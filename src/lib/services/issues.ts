import { AuditAction, IssueStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { sanitizePlainText } from "@/lib/sanitize";
import type { SessionUser } from "@/lib/auth/session";
import { releaseDueScheduledArticles } from "@/lib/services/articles";

export async function listIssues(journalId?: string) {
  return prisma.issue.findMany({
    where: { deletedAt: null, ...(journalId ? { journalId } : {}) },
    include: { journal: true, _count: { select: { articles: true } } },
    orderBy: [{ year: "desc" }, { volume: "desc" }, { issueNumber: "desc" }],
  });
}

export async function getIssueById(id: string) {
  const issue = await prisma.issue.findFirst({
    where: { id, deletedAt: null },
    include: {
      journal: true,
      articles: {
        where: { deletedAt: null, status: "PUBLISHED" },
        orderBy: { firstPage: "asc" },
        include: {
          authors: { include: { author: true }, orderBy: { authorOrder: "asc" } },
        },
      },
    },
  });
  if (!issue) throw new NotFoundError("Issue not found");
  return issue;
}

export async function createIssue(
  input: {
    journalId: string;
    volume: number;
    issueNumber: number;
    title: string;
    year: number;
    publicationDate?: Date | null;
    coverUrl?: string | null;
    status?: IssueStatus;
  },
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  try {
    const issue = await prisma.issue.create({
      data: {
        ...input,
        title: sanitizePlainText(input.title),
      },
    });
    await writeAuditLog({
      userId: actor.id,
      action: AuditAction.CREATE,
      entityType: "Issue",
      entityId: issue.id,
      metadata: { journalId: input.journalId, volume: input.volume, issueNumber: input.issueNumber },
      ...requestMeta,
    });
    return issue;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictError("An issue with this volume, number, and year already exists");
    }
    throw error;
  }
}

export async function updateIssue(
  id: string,
  input: Prisma.IssueUncheckedUpdateInput,
  actor: SessionUser,
  requestMeta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  await getIssueById(id);
  const issue = await prisma.issue.update({
    where: { id },
    data: input,
  });
  await writeAuditLog({
    userId: actor.id,
    action: AuditAction.UPDATE,
    entityType: "Issue",
    entityId: id,
    ...requestMeta,
  });
  return issue;
}

export async function getCurrentIssue(journalId: string) {
  await releaseDueScheduledArticles();
  return prisma.issue.findFirst({
    where: { journalId, deletedAt: null, status: IssueStatus.PUBLISHED },
    orderBy: [{ publicationDate: "desc" }, { year: "desc" }, { volume: "desc" }, { issueNumber: "desc" }],
    include: {
      articles: {
        where: { deletedAt: null, status: "PUBLISHED" },
        orderBy: { firstPage: "asc" },
        include: {
          authors: { include: { author: true }, orderBy: { authorOrder: "asc" } },
          category: true,
        },
      },
    },
  });
}
