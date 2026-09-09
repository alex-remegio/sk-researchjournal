import { ArticleStatus, AuditAction, FileType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { AppError, ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { sanitizePlainText, sanitizeRichText } from "@/lib/sanitize";
import { slugify, uniqueSlug } from "@/lib/slug";
import { getEdasService } from "@/lib/edas";
import { recordEdasSubmission } from "@/lib/edas/sync";
import { registerCrossrefDeposit } from "@/lib/doi/sync";
import { canEditArticleMetadata, canPublishArticle, canApproveArticle, canScheduleArticle, canMakeEditorialDecision } from "@/lib/auth/rbac";
import type { SessionUser } from "@/lib/auth/session";
import { getPublishBlockers, canTransition } from "@/lib/validation/publish";
import { getJournalSettings } from "@/lib/services/settings";
import {
  articleIdentifiersSchema,
  articleInformationSchema,
  articlePublicationSchema,
} from "@/lib/validation/schemas";

const articleInclude = {
  journal: true,
  issue: true,
  category: true,
  authors: { include: { author: true }, orderBy: { authorOrder: "asc" as const } },
  keywords: { orderBy: { sortOrder: "asc" as const } },
  references: { orderBy: { referenceOrder: "asc" as const } },
  files: { orderBy: { createdAt: "desc" as const } },
  metrics: true,
  createdBy: { select: { id: true, name: true, email: true } },
  approvedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ArticleInclude;

export async function getArticleById(id: string) {
  const article = await prisma.article.findFirst({
    where: { id, deletedAt: null },
    include: articleInclude,
  });
  if (!article) throw new NotFoundError("Article not found");
  return article;
}

export async function releaseDueScheduledArticles() {
  try {
    const due = await prisma.article.findMany({
      where: {
        deletedAt: null,
        status: ArticleStatus.SCHEDULED,
        publicationDate: { lte: new Date() },
      },
      include: articleInclude,
    });
    if (!due.length) return;
    await prisma.article.updateMany({
      where: { id: { in: due.map((row) => row.id) } },
      data: { status: ArticleStatus.PUBLISHED, publishedAt: new Date() },
    });
    await Promise.all(due.map((article) => registerCrossrefDeposit(article)));
  } catch {
    // Postgres may not have SCHEDULED until publication-pipeline migrations are applied.
  }
}

export async function getPublishedArticle(journalSlug: string, articleSlug: string) {
  await releaseDueScheduledArticles();
  const article = await prisma.article.findFirst({
    where: {
      slug: articleSlug,
      deletedAt: null,
      status: ArticleStatus.PUBLISHED,
      journal: { websiteSlug: journalSlug, deletedAt: null, active: true },
    },
    include: articleInclude,
  });
  if (!article) throw new NotFoundError("Article not found");
  return article;
}

export async function listArticles(filters?: {
  journalId?: string;
  status?: ArticleStatus;
  issueId?: string;
  scope?: {
    createdById?: string;
    journalId?: { in: string[] };
    categoryId?: { in: string[] };
    reviewAssignments?: { some: { reviewerId: string } };
  };
}) {
  return prisma.article.findMany({
    where: {
      deletedAt: null,
      ...(filters?.journalId ? { journalId: filters.journalId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.issueId ? { issueId: filters.issueId } : {}),
      ...(filters?.scope ?? {}),
    },
    include: {
      journal: true,
      issue: true,
      authors: { include: { author: true }, orderBy: { authorOrder: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createDraft(
  journalId: string,
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const slug = uniqueSlug(`draft-${Date.now().toString(36)}`, []);
  const article = await prisma.article.create({
    data: {
      title: "Untitled article",
      slug,
      abstract: "Abstract pending.",
      journalId,
      createdById: actor.id,
      status: ArticleStatus.DRAFT,
    },
    include: articleInclude,
  });
  await writeAuditLog({
    userId: actor.id,
    action: AuditAction.CREATE,
    entityType: "Article",
    entityId: article.id,
    metadata: { journalId },
    ...requestMeta,
  });
  return article;
}

function assertCanEdit(actor: SessionUser, article: { journalId: string; categoryId: string | null; status: ArticleStatus }) {
  if (!canEditArticleMetadata(actor, article, { allowPublishedCorrection: article.status === "PUBLISHED" && canPublishArticle(actor, article.journalId) })) {
    throw new ForbiddenError("You cannot edit this article");
  }
}

export async function updateArticleInformation(
  id: string,
  raw: unknown,
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const article = await getArticleById(id);
  assertCanEdit(actor, article);
  const input = articleInformationSchema.parse(raw);
  const baseSlug = slugify(input.title);
  const siblings = await prisma.article.findMany({
    where: { journalId: article.journalId, deletedAt: null, NOT: { id } },
    select: { slug: true },
  });
  const slug =
    article.status === ArticleStatus.PUBLISHED
      ? article.slug
      : uniqueSlug(
          baseSlug,
          siblings.map((row) => row.slug),
        );

  const updated = await prisma.article.update({
    where: { id },
    data: {
      title: sanitizePlainText(input.title),
      abstract: sanitizeRichText(input.abstract),
      articleType: input.articleType,
      categoryId: input.categoryId ?? null,
      slug,
    },
    include: articleInclude,
  });
  await writeAuditLog({
    userId: actor.id,
    action: AuditAction.UPDATE,
    entityType: "Article",
    entityId: id,
    metadata: { step: "information" },
    ...requestMeta,
  });
  return updated;
}

export async function updateArticlePublication(
  id: string,
  raw: unknown,
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const article = await getArticleById(id);
  assertCanEdit(actor, article);
  const input = articlePublicationSchema.parse(raw);
  if (input.issueId) {
    const issue = await prisma.issue.findFirst({
      where: { id: input.issueId, journalId: input.journalId, deletedAt: null },
    });
    if (!issue) throw new AppError("Issue does not belong to the selected journal");
  }
  const updated = await prisma.article.update({
    where: { id },
    data: {
      journalId: input.journalId,
      issueId: input.issueId ?? null,
      firstPage: input.firstPage ?? null,
      lastPage: input.lastPage ?? null,
      publicationDate: input.publicationDate ?? null,
    },
    include: articleInclude,
  });
  await writeAuditLog({
    userId: actor.id,
    action: AuditAction.UPDATE,
    entityType: "Article",
    entityId: id,
    metadata: { step: "publication" },
    ...requestMeta,
  });
  return updated;
}

export async function updateArticleIdentifiers(
  id: string,
  raw: unknown,
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const article = await getArticleById(id);
  assertCanEdit(actor, article);
  const input = articleIdentifiersSchema.parse(raw);
  const edasPaperId = input.edasPaperId
    ? getEdasService().normalizePaperId(input.edasPaperId)
    : null;
  try {
    const updated = await prisma.article.update({
      where: { id },
      data: {
        doi: input.doi?.trim() || null,
        edasPaperId,
      },
      include: articleInclude,
    });
    await writeAuditLog({
      userId: actor.id,
      action: AuditAction.UPDATE,
      entityType: "Article",
      entityId: id,
      metadata: { step: "identifiers" },
      ...requestMeta,
    });
    if (edasPaperId && ["SUBMITTED", "FOR_REVIEW", "REVISION_REQUIRED", "REVISED"].includes(updated.status)) {
      await recordEdasSubmission(updated);
    }
    return updated;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictError("DOI is already assigned to another article");
    }
    throw error;
  }
}

export async function replaceArticleAuthors(
  id: string,
  links: {
    authorId: string;
    authorOrder: number;
    corresponding: boolean;
    affiliationText?: string | null;
  }[],
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const article = await getArticleById(id);
  assertCanEdit(actor, article);
  const settings = await getJournalSettings(article.journalId);
  const correspondingCount = links.filter((link) => link.corresponding).length;
  if (!settings.allowMultipleCorrespondingAuthors && correspondingCount > 1) {
    throw new AppError("Only one corresponding author is allowed for this journal");
  }
  const orders = links.map((link) => link.authorOrder);
  if (new Set(orders).size !== orders.length) {
    throw new AppError("Author order must be unique");
  }

  await prisma.$transaction([
    prisma.articleAuthor.deleteMany({ where: { articleId: id } }),
    ...links.map((link) =>
      prisma.articleAuthor.create({
        data: {
          articleId: id,
          authorId: link.authorId,
          authorOrder: link.authorOrder,
          corresponding: link.corresponding,
          affiliationText: link.affiliationText
            ? sanitizePlainText(link.affiliationText)
            : null,
        },
      }),
    ),
  ]);

  await writeAuditLog({
    userId: actor.id,
    action: AuditAction.UPDATE,
    entityType: "Article",
    entityId: id,
    metadata: { step: "authors", count: links.length },
    ...requestMeta,
  });
  return getArticleById(id);
}

export async function replaceKeywords(
  id: string,
  keywords: string[],
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const article = await getArticleById(id);
  assertCanEdit(actor, article);
  const unique = [...new Set(keywords.map((item) => sanitizePlainText(item)).filter(Boolean))];
  await prisma.$transaction([
    prisma.keyword.deleteMany({ where: { articleId: id } }),
    prisma.keyword.createMany({
      data: unique.map((keyword, index) => ({
        articleId: id,
        keyword,
        sortOrder: index + 1,
      })),
    }),
  ]);
  await writeAuditLog({
    userId: actor.id,
    action: AuditAction.UPDATE,
    entityType: "Article",
    entityId: id,
    metadata: { step: "keywords" },
    ...requestMeta,
  });
  return getArticleById(id);
}

export async function replaceReferences(
  id: string,
  references: { referenceText: string; doi?: string | null; url?: string | null }[],
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const article = await getArticleById(id);
  assertCanEdit(actor, article);
  await prisma.$transaction([
    prisma.reference.deleteMany({ where: { articleId: id } }),
    prisma.reference.createMany({
      data: references.map((reference, index) => ({
        articleId: id,
        referenceText: sanitizePlainText(reference.referenceText),
        doi: reference.doi || null,
        url: reference.url || null,
        referenceOrder: index + 1,
      })),
    }),
  ]);
  await writeAuditLog({
    userId: actor.id,
    action: AuditAction.UPDATE,
    entityType: "Article",
    entityId: id,
    metadata: { step: "references" },
    ...requestMeta,
  });
  return getArticleById(id);
}

export function publishSnapshotFromArticle(article: Awaited<ReturnType<typeof getArticleById>>) {
  return {
    title: article.title,
    abstract: article.abstract,
    journalId: article.journalId,
    issueId: article.issueId,
    publicationDate: article.publicationDate,
    authors: article.authors,
    keywords: article.keywords,
    hasFinalPdf: article.files.some((file) => file.fileType === FileType.FINAL_PDF) || Boolean(article.pdfUrl),
    firstPage: article.firstPage,
    lastPage: article.lastPage,
    doi: article.doi,
    approvedAt: article.approvedAt,
    status: article.status,
  };
}

export async function transitionArticle(
  id: string,
  next: ArticleStatus,
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const article = await getArticleById(id);
  if (!canTransition(article.status, next)) {
    throw new AppError(`Cannot change status from ${article.status} to ${next}`);
  }

  if (next === ArticleStatus.READY_FOR_PUBLICATION || next === ArticleStatus.FOR_APPROVAL) {
    if (!canMakeEditorialDecision(actor, article.journalId) && !canApproveArticle(actor, article.journalId)) {
      throw new ForbiddenError("Only the Editor-in-Chief or Super Admin can mark an article ready for publication");
    }
  } else if (next === ArticleStatus.SCHEDULED) {
    if (!canScheduleArticle(actor, article.journalId)) {
      throw new ForbiddenError("You cannot schedule this article");
    }
    if (!article.issueId || !article.publicationDate) {
      throw new AppError("Issue and publication date are required to schedule an article", 400, "SCHEDULE_BLOCKED");
    }
  } else if (next === ArticleStatus.APPROVED) {
    if (!canApproveArticle(actor, article.journalId)) {
      throw new ForbiddenError("Only the Editor-in-Chief or Super Admin can approve articles");
    }
  } else if (next === ArticleStatus.PUBLISHED) {
    if (!canPublishArticle(actor, article.journalId)) {
      throw new ForbiddenError("Only the Editor-in-Chief or Super Admin can publish articles");
    }
    const blockers = getPublishBlockers({
      ...publishSnapshotFromArticle(article),
      status: ArticleStatus.READY_FOR_PUBLICATION,
      approvedAt: article.approvedAt ?? new Date(),
    });
    if (blockers.length) {
      throw new AppError(blockers.join(". "), 400, "PUBLISH_BLOCKED");
    }
  } else if (next === ArticleStatus.ARCHIVED) {
    if (!canApproveArticle(actor, article.journalId)) {
      throw new ForbiddenError("You cannot archive this article");
    }
  } else {
    assertCanEdit(actor, article);
  }

  const unpublish =
    article.status === ArticleStatus.PUBLISHED &&
    (next === ArticleStatus.SCHEDULED || next === ArticleStatus.READY_FOR_PUBLICATION);
  const action =
    next === ArticleStatus.PUBLISHED
      ? AuditAction.PUBLISH
      : unpublish
        ? AuditAction.UNPUBLISH
        : next === ArticleStatus.READY_FOR_PUBLICATION || next === ArticleStatus.APPROVED
          ? AuditAction.APPROVE
          : next === ArticleStatus.ARCHIVED
            ? AuditAction.ARCHIVE
            : AuditAction.UPDATE;

  const markReady =
    next === ArticleStatus.READY_FOR_PUBLICATION ||
    next === ArticleStatus.APPROVED ||
    next === ArticleStatus.FOR_APPROVAL;

  const updated = await prisma.article.update({
    where: { id },
    data: {
      status: next,
      ...(markReady ? { approvedById: actor.id, approvedAt: article.approvedAt ?? new Date() } : {}),
      ...(next === ArticleStatus.PUBLISHED ? { publishedAt: article.publishedAt ?? new Date() } : {}),
      ...(unpublish ? { publishedAt: null } : {}),
    },
    include: articleInclude,
  });

  const crossref =
    next === ArticleStatus.PUBLISHED ? await registerCrossrefDeposit(updated) : null;

  await writeAuditLog({
    userId: actor.id,
    action,
    entityType: "Article",
    entityId: id,
    metadata: { from: article.status, to: next, ...(crossref ? { crossref } : {}) },
    ...requestMeta,
  });
  return updated;
}
