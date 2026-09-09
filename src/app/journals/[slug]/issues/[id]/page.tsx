import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { JournalNav } from "@/components/public/JournalNav";
import { IssueCover } from "@/components/public/IssueCover";
import { displayName } from "@/lib/services/authors";

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const issue = await prisma.issue.findFirst({
    where: { id, deletedAt: null, journal: { websiteSlug: slug, deletedAt: null } },
    include: {
      journal: true,
      articles: {
        where: { deletedAt: null, status: "PUBLISHED" },
        orderBy: { firstPage: "asc" },
        include: { authors: { include: { author: true }, orderBy: { authorOrder: "asc" } } },
      },
    },
  });
  if (!issue) notFound();
  return (
    <PublicShell>
      <JournalNav slug={slug} name={issue.journal.name} />
      <h1 className="font-serif text-4xl">{issue.title}</h1>
      <p className="mt-2 text-ink-600">
        Vol. {issue.volume}, No. {issue.issueNumber} ({issue.year})
      </p>
      <div className="mt-6">
        <IssueCover src={issue.coverUrl} title={issue.title} className="h-56 w-40 object-cover" />
      </div>
      <ol className="mt-8 divide-y divide-ink-200 bg-white">
        {issue.articles.map((article) => (
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
      </ol>
    </PublicShell>
  );
}
