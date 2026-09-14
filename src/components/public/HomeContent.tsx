import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { withDatabase } from "@/lib/db-safe";
import { SearchBar } from "@/components/public/SearchBar";
import { ArticleCard } from "@/components/public/ArticleCard";
import { BRAND_FULL, BRAND_SHORT, BRAND_TAGLINE } from "@/lib/branding";

const homeArticleInclude = {
  journal: true,
  issue: true,
  category: true,
  authors: { include: { author: true }, orderBy: { authorOrder: "asc" as const } },
} satisfies Prisma.ArticleInclude;

export type HomeJournal = Prisma.JournalGetPayload<object>;
export type HomeArticle = Prisma.ArticleGetPayload<{ include: typeof homeArticleInclude }>;

export async function loadHomeCatalog() {
  return withDatabase(async () => {
    const journals = await prisma.journal.findMany({
      where: { deletedAt: null, active: true },
      orderBy: { name: "asc" },
    });
    // Keep SKRJET first on the public home catalog.
    journals.sort((a, b) => {
      if (a.websiteSlug === "skrjet") return -1;
      if (b.websiteSlug === "skrjet") return 1;
      return a.name.localeCompare(b.name);
    });
    const articles = await prisma.article.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      include: homeArticleInclude,
      orderBy: { publishedAt: "desc" },
      take: 8,
    });
    return { journals, articles };
  });
}

export function HomeHero({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "max-w-xl" : "max-w-3xl"}>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-forest-500">{BRAND_SHORT}</p>
      <h1
        className={`mt-2 font-sans font-bold uppercase tracking-wide text-navy-900 ${compact ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"}`}
      >
        {BRAND_FULL}
      </h1>
      <p className={`mt-4 text-ink-700 ${compact ? "text-base" : "text-lg"}`}>{BRAND_TAGLINE}</p>
      <p className={`mt-3 text-ink-600 ${compact ? "text-sm" : "text-base"}`}>
        Peer-reviewed research in education and technology. Double-blind review, published
        bi-annually by Sultan Kudarat State University.
      </p>
      <SearchBar />
      <p className="mt-3 text-sm text-ink-600">
        <Link className="underline" href="/search">
          Search with filters
        </Link>
        {" · "}
        <Link className="underline" href="/journals/skrjet/current">
          Current issue
        </Link>
        {" · "}
        <Link className="underline" href="/journals/skrjet/for-authors">
          Submissions
        </Link>
      </p>
    </div>
  );
}

export function HomeCatalogSections({
  journals,
  articles,
}: {
  journals: HomeJournal[];
  articles: HomeArticle[];
}) {
  return (
    <>
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-2xl">Journals</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="font-medium text-forest-600 underline" href="/journals/skrjet/for-authors">
              For authors
            </Link>
            <Link className="font-medium text-forest-600 underline" href="/journals/skrjet/editorial-workflow">
              Guidelines
            </Link>
            <Link className="text-forest-500 underline" href="/journals">
              View all
            </Link>
          </div>
        </div>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {journals.map((journal) => (
            <li key={journal.id} className="border border-ink-200 bg-white p-5">
              <h3 className="font-serif text-xl">
                <Link href={`/journals/${journal.websiteSlug}`}>{journal.name}</Link>
              </h3>
              <p className="mt-2 text-sm text-ink-600">{journal.publisher}</p>
              <p className="mt-2 line-clamp-3 text-sm text-ink-700">
                {journal.description.replace(/<[^>]+>/g, "")}
              </p>
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
    </>
  );
}
