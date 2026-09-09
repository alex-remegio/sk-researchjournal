import { IssueStatus, MetricType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { articleListFilter, assignedJournalIds, isSuperAdmin } from "@/lib/auth/rbac";
import type { SessionUser } from "@/lib/auth/session";
import { pipelineStage, queueStatuses } from "@/lib/lifecycle/article";

export type JournalAdministrationData = {
  journalId: string | null;
  journalName: string | null;
  publishedArticles: number;
  currentIssues: number;
  totalAuthors: number;
  pdfDownloads: number;
  queue: {
    draft: number;
    readyForPublication: number;
    scheduled: number;
  };
  recent: Array<{
    id: string;
    title: string;
    status: string;
  }>;
};

function journalScope(user: SessionUser, journalId?: string): Prisma.ArticleWhereInput {
  if (journalId) return { journalId };
  return articleListFilter(user);
}

function issueJournalScope(user: SessionUser, journalId?: string): Prisma.IssueWhereInput {
  if (journalId) return { journalId };
  if (isSuperAdmin(user)) return {};
  const ids = assignedJournalIds(user);
  return { journalId: { in: ids.length ? ids : ["__none__"] } };
}

export async function getJournalAdministration(
  user: SessionUser,
  journalId?: string,
): Promise<JournalAdministrationData> {
  const articleWhere: Prisma.ArticleWhereInput = { deletedAt: null, ...journalScope(user, journalId) };

  const [statusGroups, currentIssues, authorGroups, downloads, recent, namedJournal] = await Promise.all([
    prisma.article.groupBy({
      by: ["status"],
      where: articleWhere,
      _count: { _all: true },
    }),
    prisma.issue.count({
      where: { deletedAt: null, status: IssueStatus.PUBLISHED, ...issueJournalScope(user, journalId) },
    }),
    prisma.articleAuthor.groupBy({
      by: ["authorId"],
      where: { article: articleWhere },
    }),
    prisma.articleMetric.aggregate({
      _sum: { value: true },
      where: { metricType: MetricType.PDF_DOWNLOAD, article: articleWhere },
    }),
    prisma.article.findMany({
      where: articleWhere,
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: { id: true, title: true, status: true },
    }),
    journalId
      ? prisma.journal.findFirst({ where: { id: journalId, deletedAt: null }, select: { id: true, name: true } })
      : assignedJournalIds(user).length === 1
        ? prisma.journal.findFirst({
            where: { id: assignedJournalIds(user)[0], deletedAt: null },
            select: { id: true, name: true },
          })
        : Promise.resolve(null),
  ]);

  const countFor = (bucket: "DRAFT" | "READY_FOR_PUBLICATION" | "SCHEDULED" | "PUBLISHED") =>
    statusGroups
      .filter((row) =>
        bucket === "PUBLISHED"
          ? row.status === "PUBLISHED"
          : queueStatuses(bucket).includes(row.status) || pipelineStage(row.status) === bucket,
      )
      .reduce((sum, row) => sum + row._count._all, 0);

  return {
    journalId: namedJournal?.id ?? journalId ?? null,
    journalName: namedJournal?.name ?? null,
    publishedArticles: countFor("PUBLISHED"),
    currentIssues,
    totalAuthors: authorGroups.length,
    pdfDownloads: downloads._sum.value ?? 0,
    queue: {
      draft: countFor("DRAFT"),
      readyForPublication: countFor("READY_FOR_PUBLICATION"),
      scheduled: countFor("SCHEDULED"),
    },
    recent,
  };
}
