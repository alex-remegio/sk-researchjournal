import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { sanitizePlainText, sanitizeRichText } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import type { SessionUser } from "@/lib/auth/session";

export async function listJournals(options?: { activeOnly?: boolean }) {
  return prisma.journal.findMany({
    where: {
      deletedAt: null,
      ...(options?.activeOnly ? { active: true } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function getJournalBySlug(slug: string) {
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null },
    include: {
      settings: true,
      categories: { where: { deletedAt: null }, orderBy: { name: "asc" } },
    },
  });
  if (!journal) throw new NotFoundError("Journal not found");
  return journal;
}

export async function getJournalById(id: string) {
  const journal = await prisma.journal.findFirst({
    where: { id, deletedAt: null },
  });
  if (!journal) throw new NotFoundError("Journal not found");
  return journal;
}

export async function createJournal(
  input: Prisma.JournalUncheckedCreateInput,
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const websiteSlug = slugify(input.websiteSlug || input.name);
  const existing = await prisma.journal.findUnique({ where: { websiteSlug } });
  if (existing) throw new ConflictError("Journal slug already exists");

  const journal = await prisma.journal.create({
    data: {
      ...input,
      name: sanitizePlainText(input.name),
      abbreviation: sanitizePlainText(input.abbreviation),
      description: sanitizeRichText(input.description),
      publisher: sanitizePlainText(input.publisher),
      websiteSlug,
    },
  });

  await prisma.journalSetting.createMany({
    data: Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
      journalId: journal.id,
      key,
      value,
    })),
  });

  await writeAuditLog({
    userId: actor.id,
    action: AuditAction.CREATE,
    entityType: "Journal",
    entityId: journal.id,
    metadata: { name: journal.name },
    ...requestMeta,
  });
  return journal;
}

export async function updateJournal(
  id: string,
  input: Prisma.JournalUncheckedUpdateInput,
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  await getJournalById(id);
  const journal = await prisma.journal.update({
    where: { id },
    data: {
      ...input,
      ...(typeof input.name === "string" ? { name: sanitizePlainText(input.name) } : {}),
      ...(typeof input.description === "string"
        ? { description: sanitizeRichText(input.description) }
        : {}),
    },
  });
  await writeAuditLog({
    userId: actor.id,
    action: AuditAction.UPDATE,
    entityType: "Journal",
    entityId: id,
    ...requestMeta,
  });
  return journal;
}
