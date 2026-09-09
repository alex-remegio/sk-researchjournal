import { PublicShell } from "@/components/public/Shell";
import { SearchBar } from "@/components/public/SearchBar";
import { FacetFilters } from "@/components/public/FacetFilters";
import { ArticleCard } from "@/components/public/ArticleCard";
import { getSearchFacets, searchArticles } from "@/lib/services/search";
import { searchQuerySchema } from "@/lib/validation/schemas";

export const metadata = { title: "Search articles" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const parsed = searchQuerySchema.parse({
    ...raw,
    q: Array.isArray(raw.q) ? raw.q[0] : raw.q,
    year: raw.year,
    journal: raw.journal,
    category: raw.category,
  });
  const filters = {
    q: parsed.q,
    keyword: parsed.keyword,
    author: parsed.author,
    title: parsed.title,
    years: parsed.year,
    journalSlugs: parsed.journal,
    volume: parsed.volume,
    issue: parsed.issue,
    categories: parsed.category,
  };
  const [result, facets] = await Promise.all([searchArticles({ ...filters, page: parsed.page }), getSearchFacets(filters)]);
  const query = parsed.q.trim();

  return (
    <PublicShell>
      <h1 className="font-serif text-4xl">{query ? `Search: ${query}` : "Search articles"}</h1>
      <SearchBar defaultValue={query} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside>
          <FacetFilters query={query} years={facets.years} categories={facets.categories} journals={facets.journals} />
        </aside>
        <div>
          <p className="text-sm text-ink-600">
            {query || parsed.year.length || parsed.journal.length || parsed.category.length
              ? `${result.total} result${result.total === 1 ? "" : "s"}`
              : `${result.total} published article${result.total === 1 ? "" : "s"}`}
          </p>
          {result.articles.length ? (
            <ul className="mt-4 divide-y divide-ink-200 border-y border-ink-200 bg-white">
              {result.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-ink-600">No articles matched that search. Clear a filter or try another term.</p>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
