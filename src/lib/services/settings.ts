import { FileType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { DEFAULT_SETTINGS, parseBooleanSetting } from "@/lib/settings";

export async function getJournalSettings(journalId: string) {
  const rows = await prisma.journalSetting.findMany({ where: { journalId } });
  const map = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.key in map) {
      map[row.key as keyof typeof map] = row.value;
    }
  }
  return {
    showPublicMetrics: parseBooleanSetting(map.SHOW_PUBLIC_METRICS, true),
    allowMultipleCorrespondingAuthors: parseBooleanSetting(
      map.ALLOW_MULTIPLE_CORRESPONDING_AUTHORS,
      false,
    ),
    maxPdfBytes: Number(map.MAX_PDF_SIZE_MB || env.MAX_PDF_SIZE_MB) * 1024 * 1024,
    maxSupplementaryBytes:
      Number(map.MAX_SUPPLEMENTARY_SIZE_MB || env.MAX_SUPPLEMENTARY_SIZE_MB) * 1024 * 1024,
    maxThumbnailBytes: Number(map.MAX_THUMBNAIL_SIZE_MB || env.MAX_THUMBNAIL_SIZE_MB) * 1024 * 1024,
    openAccess: parseBooleanSetting(map.OPEN_ACCESS, true),
    licenseName: map.LICENSE_NAME,
    licenseUrl: map.LICENSE_URL,
    raw: map,
  };
}

export function limitForFileType(
  settings: Awaited<ReturnType<typeof getJournalSettings>>,
  fileType: FileType,
) {
  if (
    fileType === FileType.FINAL_PDF ||
    fileType === FileType.MANUSCRIPT ||
    fileType === FileType.COVER_LETTER ||
    fileType === FileType.TITLE_PAGE ||
    fileType === FileType.ANONYMOUS_MANUSCRIPT
  ) {
    return settings.maxPdfBytes;
  }
  if (fileType === FileType.THUMBNAIL) return settings.maxThumbnailBytes;
  return settings.maxSupplementaryBytes;
}

export async function upsertJournalSetting(journalId: string, key: string, value: string) {
  return prisma.journalSetting.upsert({
    where: { journalId_key: { journalId, key } },
    update: { value },
    create: { journalId, key, value },
  });
}
