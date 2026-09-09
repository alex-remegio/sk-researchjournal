import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  buildArticleSearchWhere,
  hasFieldFilters,
  selectedCategories,
  selectedJournals,
  selectedYears,
  type ArticleSearchInput,
  type SearchFacetOption,
} from "@/lib/search/query";

export type SearchParams = ArticleSearchInput & {
  page?: number;
  pageSize?: number;
};

export type { SearchFacetOption };

const articleSearchInclude = {
  journal: true,
  issue: true,
  category: true,
  authors: { include: { author: true }, orderBy: { authorOrder: "asc" as const } },
  keywords: true,
} satisfies Prisma.ArticleInclude;

function countBy<T>(rows: T[], key: (row: T) => string | null | undefined) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = key(row);
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function matchesYears(year: number | null | undefined, years: number[]) {
  return !years.length || (year != null && years.includes(year));
}

function matchesJournals(slug: string | null | undefined, journals: string[]) {
  return !journals.length || (slug != null && journals.includes(slug));
}

function matchesCategories(slug: string | null | undefined, categories: string[]) {
  return !categories.length || (slug != null && categories.includes(slug));
}

export async function getSearchFacets(params: ArticleSearchInput) {
  const baseWhere = buildArticleSearchWhere({
    ...params,
    year: undefined,
    years: [],
    journalSlug: undefined,
    journalSlugs: [],
    category: undefined,
    categories: [],
  });
  const rows = await prisma.article.findMany({
    where: baseWhere,
    select: {
      issue: { select: { year: true } },
      category: { select: { name: true, slug: true } },
      journal: { select: { name: true, websiteSlug: true } },
    },
  });

  const yearsSelected = selectedYears(params);
  const journalsSelected = selectedJournals(params);
  const categoriesSelected = selectedCategories(params);

  const yearRows = rows.filter(
    (row) =>
      matchesJournals(row.journal.websiteSlug, journalsSelected) &&
      matchesCategories(row.category?.slug, categoriesSelected),
  );
  const categoryRows = rows.filter(
    (row) =>
      matchesYears(row.issue?.year, yearsSelected) && matchesJournals(row.journal.websiteSlug, journalsSelected),
  );
  const journalRows = rows.filter(
    (row) => matchesYears(row.issue?.year, yearsSelected) && matchesCategories(row.category?.slug, categoriesSelected),
  );

  const yearCounts = countBy(yearRows, (row) => (row.issue ? String(row.issue.year) : null));
  const categoryMeta = new Map<string, string>();
  for (const row of categoryRows) {
    if (row.category) categoryMeta.set(row.category.slug, row.category.name);
  }
  const categoryCounts = countBy(categoryRows, (row) => row.category?.slug);
  const journalMeta = new Map<string, string>();
  for (const row of journalRows) journalMeta.set(row.journal.websiteSlug, row.journal.name);
  const journalCounts = countBy(journalRows, (row) => row.journal.websiteSlug);

  const years: SearchFacetOption[] = [...yearCounts.entries()]
    .map(([value, count]) => ({ value, label: value, count, selected: yearsSelected.includes(Number(value)) }))
    .sort((a, b) => Number(b.value) - Number(a.value));
  for (const year of yearsSelected) {
    if (!years.some((item) => item.value === String(year))) {
      years.push({ value: String(year), label: String(year), count: 0, selected: true });
    }
  }

  const categories: SearchFacetOption[] = [...categoryCounts.entries()]
    .map(([value, count]) => ({
      value,
      label: categoryMeta.get(value) ?? value,
      count,
      selected: categoriesSelected.includes(value),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  for (const category of categoriesSelected) {
    if (!categories.some((item) => item.value === category)) {
      categories.push({ value: category, label: category, count: 0, selected: true });
    }
  }

  const journals: SearchFacetOption[] = [...journalCounts.entries()]
    .map(([value, count]) => ({
      value,
      label: journalMeta.get(value) ?? value,
      count,
      selected: journalsSelected.includes(value),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  for (const journal of journalsSelected) {
    if (!journals.some((item) => item.value === journal)) {
      journals.push({ value: journal, label: journal, count: 0, selected: true });
    }
  }

  return { years, categories, journals };
}

export async function searchArticles(params: SearchParams) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const query = params.q?.trim() ?? "";
  const where = buildArticleSearchWhere(params);
  const fielded = hasFieldFilters(params);

  const searchDocument = Prisma.sql`
    setweight(to_tsvector('english', coalesce(a.title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(au.first_name,'') || ' ' || coalesce(au.middle_name,'') || ' ' || coalesce(au.last_name,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(a.doi,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(j.name,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(k.keyword,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(a.abstract,'')), 'C') ||
    setweight(to_tsvector('english', coalesce(i.title,'')), 'C') ||
    setweight(to_tsvector('english', coalesce(i.volume::text,'') || ' ' || coalesce(i.issue_number::text,'') || ' ' || coalesce(i.year::text,'')), 'D')
  `;

  try {
    if (query && !fielded) {
      const rows = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT a.id, MAX(ts_rank(${searchDocument}, plainto_tsquery('english', ${query}))) AS rank
        FROM articles a
        JOIN journals j ON j.id = a.journal_id
        LEFT JOIN issues i ON i.id = a.issue_id
        LEFT JOIN keywords k ON k.article_id = a.id
        LEFT JOIN article_authors aa ON aa.article_id = a.id
        LEFT JOIN authors au ON au.id = aa.author_id
        WHERE a.deleted_at IS NULL
          AND a.status = 'PUBLISHED'
          AND ${searchDocument} @@ plainto_tsquery('english', ${query})
        GROUP BY a.id
        ORDER BY rank DESC
        LIMIT ${pageSize}
        OFFSET ${(page - 1) * pageSize}
      `;
      const ids = rows.map((row) => row.id);
      if (ids.length) {
        const [articles, countRows] = await Promise.all([
          prisma.article.findMany({
            where: { id: { in: ids } },
            include: articleSearchInclude,
          }),
          prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*)::bigint AS count FROM (
              SELECT a.id
              FROM articles a
              JOIN journals j ON j.id = a.journal_id
              LEFT JOIN issues i ON i.id = a.issue_id
              LEFT JOIN keywords k ON k.article_id = a.id
              LEFT JOIN article_authors aa ON aa.article_id = a.id
              LEFT JOIN authors au ON au.id = aa.author_id
              WHERE a.deleted_at IS NULL
                AND a.status = 'PUBLISHED'
                AND ${searchDocument} @@ plainto_tsquery('english', ${query})
              GROUP BY a.id
            ) ranked
          `,
        ]);
        articles.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
        return {
          articles,
          page,
          pageSize,
          total: Number(countRows[0]?.count ?? ids.length),
          usedFullText: true,
        };
      }
    }
  } catch {
    // Fall back to Prisma contains search when tsvector is unavailable.
  }

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      include: articleSearchInclude,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, page, pageSize, total, usedFullText: false };
}
