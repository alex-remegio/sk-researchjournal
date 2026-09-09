import { FileType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { AuditAction } from "@prisma/client";
import { getStorage } from "@/lib/storage";
import { buildStorageKey, validateUpload } from "@/lib/storage/file-validation";
import { getJournalSettings, limitForFileType } from "@/lib/services/settings";
import { getArticleById } from "@/lib/services/articles";
import { canEditArticleMetadata, canPublishArticle } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/session";

export async function uploadArticleFile(params: {
  articleId: string;
  fileType: FileType;
  buffer: Buffer;
  originalName: string;
  declaredMime?: string | null;
  actor: SessionUser;
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null };
}) {
  const article = await getArticleById(params.articleId);
  if (
    !canEditArticleMetadata(params.actor, article, {
      allowPublishedCorrection:
        article.status === "PUBLISHED" && canPublishArticle(params.actor, article.journalId),
    })
  ) {
    throw new ForbiddenError("You cannot upload files for this article");
  }

  const settings = await getJournalSettings(article.journalId);
  const validated = validateUpload({
    fileType: params.fileType,
    buffer: params.buffer,
    originalName: params.originalName,
    declaredMime: params.declaredMime,
    maxBytes: limitForFileType(settings, params.fileType),
  });

  const key = buildStorageKey({
    journalId: article.journalId,
    articleId: article.id,
    fileType: params.fileType,
    fileName: validated.originalName,
  });

  const stored = await getStorage().put({
    key,
    body: params.buffer,
    mimeType: validated.mimeType,
    originalName: validated.originalName,
  });

  if (params.fileType === FileType.FINAL_PDF || params.fileType === FileType.THUMBNAIL) {
    const existing = await prisma.articleFile.findMany({
      where: { articleId: article.id, fileType: params.fileType },
    });
    for (const file of existing) {
      await getStorage().delete(file.storageKey);
    }
    await prisma.articleFile.deleteMany({
      where: { articleId: article.id, fileType: params.fileType },
    });
  }

  const record = await prisma.articleFile.create({
    data: {
      articleId: article.id,
      fileType: params.fileType,
      originalName: validated.originalName,
      storageKey: stored.key,
      publicUrl: stored.publicUrl,
      mimeType: stored.mimeType,
      fileSize: stored.size,
      uploadedById: params.actor.id,
    },
  });

  if (params.fileType === FileType.FINAL_PDF) {
    await prisma.article.update({ where: { id: article.id }, data: { pdfUrl: stored.publicUrl } });
  }
  if (params.fileType === FileType.THUMBNAIL) {
    await prisma.article.update({
      where: { id: article.id },
      data: { thumbnailUrl: stored.publicUrl },
    });
  }

  await writeAuditLog({
    userId: params.actor.id,
    action: AuditAction.FILE_UPLOAD,
    entityType: "ArticleFile",
    entityId: record.id,
    metadata: { articleId: article.id, fileType: params.fileType },
    ...params.requestMeta,
  });

  return record;
}
