import Link from "next/link";
import { ArticleStatus, Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { articleListFilter, canCreateArticle } from "@/lib/auth/rbac";
import { NewArticleButton } from "@/components/admin/NewArticleButton";
import { PublicationPipeline } from "@/components/admin/PublicationPipeline";
import { formatArticleStatus, queueStatuses } from "@/lib/lifecycle/article";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; journalId?: string }>;
}) {
  const user = await requireSession();
  if (user.role === Role.REVIEWER) redirect("/admin/reviews");
  if (user.role === Role.AUTHOR) redirect("/admin/submissions");
  const params = await searchParams;
  const filter = articleListFilter(user);
  const status = params.status?.trim();
  const statusFilter =
    status === "READY_FOR_PUBLICATION"
      ? { status: { in: queueStatuses("READY_FOR_PUBLICATION") as ArticleStatus[] } }
      : status && Object.values(ArticleStatus).includes(status as ArticleStatus)
        ? { status: status as ArticleStatus }
        : {};
  const journalFilter = params.journalId ? { journalId: params.journalId } : {};
  const articles = await prisma.article.findMany({
    where: { deletedAt: null, ...filter, ...statusFilter, ...journalFilter },
    include: { journal: true, issue: true, category: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  const journals = await prisma.journal.findMany({
    where: {
      deletedAt: null,
      active: true,
      ...(filter.journalId ? { id: filter.journalId } : {}),
    },
    select: { id: true, name: true },
  });
  const canCreate = journals.some((journal) => canCreateArticle(user, journal.id));
  const heading =
    user.role === Role.MANAGING_EDITOR
      ? "Article records"
      : user.role === Role.SECTION_EDITOR
        ? "Section articles"
        : "Articles";
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">{heading}</h1>
          {user.role === Role.MANAGING_EDITOR ? (
            <p className="mt-2 text-sm text-ink-600">Metadata, records, and final file uploads.</p>
          ) : null}
          {user.role === Role.SECTION_EDITOR ? (
            <p className="mt-2 text-sm text-ink-600">Only articles in your assigned discipline.</p>
          ) : null}
        </div>
        {canCreate ? <NewArticleButton journals={journals} /> : null}
      </div>
      <PublicationPipeline />
      <div className="mt-6 overflow-x-auto rounded border border-ink-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-100">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Journal</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-t border-ink-100">
                <td className="px-3 py-2">
                  <Link className="underline" href={`/admin/articles/${article.id}/wizard`}>
                    {article.title}
                  </Link>
                  {article.category ? (
                    <p className="text-xs text-ink-500">{article.category.name}</p>
                  ) : null}
                </td>
                <td className="px-3 py-2">{article.journal.abbreviation}</td>
                <td className="px-3 py-2">{formatArticleStatus(article.status)}</td>
                <td className="px-3 py-2">{article.updatedAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
