import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { listMySubmissions } from "@/lib/services/review";
import { AuthorRevisionForm } from "@/components/admin/AuthorRevisionForm";
import { NewArticleButton } from "@/components/admin/NewArticleButton";
import { formatArticleStatus } from "@/lib/lifecycle/article";

export default async function SubmissionsPage() {
  const user = await requireSession();
  const articles = await listMySubmissions(user.id);
  const journals = await prisma.journal.findMany({
    where: { deletedAt: null, active: true },
    select: { id: true, name: true },
  });
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">My submissions</h1>
          <p className="mt-2 text-ink-600">
            After screening, manuscripts enter double-blind review. Author and reviewer identities
            remain concealed from each other. Referee reports are handled in EDAS.
          </p>
        </div>
        <NewArticleButton journals={journals} />
      </div>
      <ul className="mt-6 space-y-6">
        {articles.map((article) => (
          <li key={article.id} className="rounded border bg-white p-4">
            <Link className="font-serif text-lg underline" href={`/admin/articles/${article.id}/wizard`}>
              {article.title}
            </Link>
            <p className="text-sm text-ink-600">
              {article.journal.abbreviation} · {formatArticleStatus(article.status)}
            </p>
            {article.editorialDecisions[0] ? (
              <div className="mt-3 text-sm">
                <p className="font-medium">
                  Latest decision: {article.editorialDecisions[0].decision.replaceAll("_", " ")}
                </p>
                <div
                  className="mt-1"
                  dangerouslySetInnerHTML={{ __html: article.editorialDecisions[0].letterToAuthors }}
                />
              </div>
            ) : null}
            {article.status === "REVISION_REQUIRED" ? <AuthorRevisionForm articleId={article.id} /> : null}
            <p className="mt-3 text-sm">
              <Link className="underline" href={`/admin/review/${article.id}`}>
                Review history
              </Link>
            </p>
          </li>
        ))}
        {!articles.length ? <li>No submissions yet.</li> : null}
      </ul>
    </div>
  );
}
