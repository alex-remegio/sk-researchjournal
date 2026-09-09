import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { withDatabase } from "@/lib/db-safe";
import { SearchBar } from "@/components/public/SearchBar";
import { ArticleCard } from "@/components/public/ArticleCard";
import { BRAND_SHORT } from "@/lib/branding";

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
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-crimson-700">{BRAND_SHORT}</p>
      <h1
        className={`mt-2 font-serif text-ink-950 ${compact ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"}`}
      >
        Sultan Kudarat Research Journal of Education and Technology
      </h1>
      <p className={`mt-4 text-ink-700 ${compact ? "text-base" : "text-lg"}`}>
        SKRJET publishes peer-reviewed research in education and technology. Browse current issues,
        archives, and author profiles. The journal uses a single-blind peer review process: reviewers
        see author identities; authors do not see reviewer identities.
      </p>
      <SearchBar />
      <p className="mt-3 text-sm text-ink-600">
        <Link className="underline" href="/search">
          Search with filters
        </Link>
        {" · "}
        <Link className="underline" href="/journals">
          Browse all journals
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
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl">Journals</h2>
          <Link className="text-sm text-crimson-700 underline" href="/journals">
            View all
          </Link>
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
