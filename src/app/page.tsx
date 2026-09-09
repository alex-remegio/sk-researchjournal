import Link from "next/link";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/public/Shell";
import { SearchBar } from "@/components/public/SearchBar";
import { ArticleCard } from "@/components/public/ArticleCard";

export default async function HomePage() {
  const journals = await prisma.journal.findMany({
    where: { deletedAt: null, active: true },
    orderBy: { name: "asc" },
  });
  const articles = await prisma.article.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    include: {
      journal: true,
      issue: true,
      category: true,
      authors: { include: { author: true }, orderBy: { authorOrder: "asc" } },
    },
    orderBy: { publishedAt: "desc" },
    take: 8,
  });

  return (
    <PublicShell>
      <section className="max-w-3xl">
        <h1 className="font-serif text-4xl text-ink-950 md:text-5xl">Open academic journals</h1>
        <p className="mt-4 text-lg text-ink-700">
          Browse peer-reviewed articles, current issues, and author profiles. Journals use a
          single-blind peer review process: reviewers see author identities; authors do not see
          reviewer identities.
        </p>
        <SearchBar />
        <p className="mt-3 text-sm text-ink-600">
          <Link className="underline" href="/search">
            Search with filters
          </Link>
        </p>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl">Journals</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {journals.map((journal) => (
            <li key={journal.id} className="rounded border border-ink-200 bg-white p-5">
              <h3 className="font-serif text-xl">
                <Link href={`/journals/${journal.websiteSlug}`}>{journal.name}</Link>
              </h3>
              <p className="mt-2 text-sm text-ink-600">{journal.publisher}</p>
              <p className="mt-2 line-clamp-3 text-sm text-ink-700">{journal.description.replace(/<[^>]+>/g, "")}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl">Latest articles</h2>
        <ul className="mt-4 divide-y divide-ink-200 border-y border-ink-200 bg-white">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </ul>
      </section>
    </PublicShell>
  );
}
