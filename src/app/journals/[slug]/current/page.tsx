import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import { getCurrentIssue } from "@/lib/services/issues";
import { displayName } from "@/lib/services/authors";
import { IssueCover } from "@/components/public/IssueCover";

export default async function CurrentIssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await prisma.journal.findFirst({
    where: { websiteSlug: slug, deletedAt: null, active: true },
  });
  if (!journal) notFound();
  const current = await getCurrentIssue(journal.id);
  return (
    <PublicShell>
      <JournalNav slug={slug} name={journal.name} />
      <h1 className="font-serif text-4xl">Current issue</h1>
      {!current ? (
        <p className="mt-6">No published issue is available yet.</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-6">
            <IssueCover src={current.coverUrl} title={current.title} className="h-56 w-40 object-cover" />
            <p className="text-ink-600">
              Vol. {current.volume}, No. {current.issueNumber} ({current.year}) — {current.title}
            </p>
          </div>
          <ul className="mt-6 divide-y divide-ink-200 bg-white">
            {current.articles.map((article) => (
              <li key={article.id} className="p-4">
                <Link
                  className="font-serif text-lg hover:underline"
                  href={`/journals/${slug}/articles/${article.slug}`}
                >
                  {article.title}
                </Link>
                <p className="text-sm text-ink-600">
                  {article.authors.map((link) => displayName(link.author)).join(", ")}
                  {article.firstPage ? ` · pp. ${article.firstPage}–${article.lastPage}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </PublicShell>
  );
}
