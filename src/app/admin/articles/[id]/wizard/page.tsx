import { notFound } from "next/navigation";
import { getArticleById, publishSnapshotFromArticle } from "@/lib/services/articles";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { ArticleWizard } from "@/components/admin/ArticleWizard";
import { getPublishBlockers } from "@/lib/validation/publish";
import { canApproveArticle, canEditArticleMetadata, canPublishArticle, canScheduleArticle } from "@/lib/auth/rbac";

export default async function WizardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession();
  let article;
  try {
    article = await getArticleById(id);
  } catch {
    notFound();
  }
  const [journals, issues, categories, authors] = await Promise.all([
    prisma.journal.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.issue.findMany({ where: { deletedAt: null }, orderBy: [{ year: "desc" }, { volume: "desc" }] }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.author.findMany({
      where: { deletedAt: null },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: 200,
    }),
  ]);
  const permissions = {
    canEdit: canEditArticleMetadata(user, article, {
      allowPublishedCorrection: canPublishArticle(user, article.journalId),
    }),
    canApprove: canApproveArticle(user, article.journalId),
    canPublish: canPublishArticle(user, article.journalId),
    canSchedule: canScheduleArticle(user, article.journalId),
  };

  return (
    <ArticleWizard
      article={JSON.parse(JSON.stringify(article))}
      journals={JSON.parse(JSON.stringify(journals))}
      issues={JSON.parse(JSON.stringify(issues))}
      categories={JSON.parse(JSON.stringify(categories))}
      authors={JSON.parse(JSON.stringify(authors))}
      blockers={getPublishBlockers(publishSnapshotFromArticle(article))}
      permissions={permissions}
    />
  );
}
