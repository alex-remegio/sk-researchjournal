import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { normalizeOrcid } from "@/lib/identifiers";
import { sanitizePlainText, sanitizeRichText } from "@/lib/sanitize";
import type { SessionUser } from "@/lib/auth/session";
import { authorSchema } from "@/lib/validation/schemas";

export { displayName } from "@/lib/authors/name";

export async function listAuthors(query?: string) {
  return prisma.author.findMany({
    where: {
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { orcid: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { affiliations: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 100,
  });
}

export async function getAuthorById(id: string) {
  const author = await prisma.author.findFirst({
    where: { id, deletedAt: null },
    include: {
      affiliations: true,
      articles: {
        where: { article: { status: "PUBLISHED", deletedAt: null } },
        include: {
          article: {
            include: {
              journal: true,
              issue: true,
            },
          },
        },
        orderBy: { authorOrder: "asc" },
      },
    },
  });
  if (!author) throw new NotFoundError("Author not found");
  return author;
}

export async function createAuthor(
  raw: unknown,
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const input = authorSchema.parse(raw);
  const orcid = input.orcid ? normalizeOrcid(input.orcid) : null;
  if (orcid) {
    const existing = await prisma.author.findUnique({ where: { orcid } });
    if (existing) throw new ConflictError("An author with this ORCID already exists");
  }
  const author = await prisma.author.create({
    data: {
      firstName: sanitizePlainText(input.firstName),
      middleName: input.middleName ? sanitizePlainText(input.middleName) : null,
      lastName: sanitizePlainText(input.lastName),
      email: input.email.toLowerCase(),
      affiliation: sanitizePlainText(input.affiliation),
      country: sanitizePlainText(input.country),
      orcid,
      biography: input.biography ? sanitizeRichText(input.biography) : null,
      userId: input.userId ?? null,
      affiliations: input.affiliations
        ? {
            create: input.affiliations.map((affiliation) => ({
              name: sanitizePlainText(affiliation.name),
              country: affiliation.country ? sanitizePlainText(affiliation.country) : null,
              department: affiliation.department
                ? sanitizePlainText(affiliation.department)
                : null,
              isPrimary: affiliation.isPrimary ?? false,
            })),
          }
        : undefined,
    },
    include: { affiliations: true },
  });
  await writeAuditLog({
    userId: actor.id,
    action: AuditAction.CREATE,
    entityType: "Author",
    entityId: author.id,
    ...requestMeta,
  });
  return author;
}

export async function updateAuthor(
  id: string,
  raw: unknown,
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  await getAuthorById(id);
  const input = authorSchema.partial().parse(raw);
  const orcid = input.orcid ? normalizeOrcid(input.orcid) : input.orcid;
  const author = await prisma.author.update({
    where: { id },
    data: {
      ...(input.firstName ? { firstName: sanitizePlainText(input.firstName) } : {}),
      ...(input.middleName !== undefined
        ? { middleName: input.middleName ? sanitizePlainText(input.middleName) : null }
        : {}),
      ...(input.lastName ? { lastName: sanitizePlainText(input.lastName) } : {}),
      ...(input.email ? { email: input.email.toLowerCase() } : {}),
      ...(input.affiliation ? { affiliation: sanitizePlainText(input.affiliation) } : {}),
      ...(input.country ? { country: sanitizePlainText(input.country) } : {}),
      ...(input.orcid !== undefined ? { orcid } : {}),
      ...(input.biography !== undefined
        ? { biography: input.biography ? sanitizeRichText(input.biography) : null }
        : {}),
      ...(input.userId !== undefined ? { userId: input.userId } : {}),
    },
    include: { affiliations: true },
  });
  await writeAuditLog({
    userId: actor.id,
    action: AuditAction.UPDATE,
    entityType: "Author",
    entityId: id,
    ...requestMeta,
  });
  return author;
}
