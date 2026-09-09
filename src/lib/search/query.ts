import type { Prisma } from "@prisma/client";

export type SearchFacetOption = {
  value: string;
  label: string;
  count: number;
  selected: boolean;
};

export type ArticleSearchInput = {
  q?: string;
  keyword?: string;
  author?: string;
  title?: string;
  journalSlug?: string;
  journalSlugs?: string[];
  year?: number;
  years?: number[];
  volume?: number;
  issue?: number;
  category?: string;
  categories?: string[];
};

export function listParam(value: unknown): string[] {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.flatMap(listParam);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function fromUrlSearchParams(params: URLSearchParams) {
  const raw: Record<string, string | string[]> = {};
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key);
    raw[key] = all.length > 1 ? all : all[0]!;
  }
  return raw;
}

export function queryTokens(query: string) {
  return query
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter((token) => token.length >= 2);
}

function nameFieldMatch(token: string): Prisma.AuthorWhereInput {
  return {
    OR: [
      { firstName: { contains: token, mode: "insensitive" } },
      { middleName: { contains: token, mode: "insensitive" } },
      { lastName: { contains: token, mode: "insensitive" } },
    ],
  };
}

export function authorSearchClause(query: string): Prisma.ArticleWhereInput | null {
  const tokens = queryTokens(query);
  if (!tokens.length) return null;
  return {
    authors: {
      some: {
        author: tokens.length === 1 ? nameFieldMatch(tokens[0]) : { AND: tokens.map(nameFieldMatch) },
      },
    },
  };
}

export function generalSearchClause(query: string): Prisma.ArticleWhereInput | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const textFilters: Prisma.ArticleWhereInput[] = [
    { title: { contains: trimmed, mode: "insensitive" } },
    { abstract: { contains: trimmed, mode: "insensitive" } },
    { doi: { contains: trimmed, mode: "insensitive" } },
    { journal: { name: { contains: trimmed, mode: "insensitive" } } },
    { keywords: { some: { keyword: { contains: trimmed, mode: "insensitive" } } } },
    { issue: { title: { contains: trimmed, mode: "insensitive" } } },
  ];
  const authorClause = authorSearchClause(trimmed);
  if (authorClause) textFilters.push(authorClause);
  if (/^\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    textFilters.push({
      issue: { OR: [{ volume: numeric }, { issueNumber: numeric }, { year: numeric }] },
    });
  }
  return { OR: textFilters };
}

function selectedYears(params: ArticleSearchInput) {
  return [...(params.years ?? []), ...(params.year ? [params.year] : [])].filter(
    (year, index, all) => Number.isInteger(year) && year > 0 && all.indexOf(year) === index,
  );
}

function selectedJournals(params: ArticleSearchInput) {
  return [...(params.journalSlugs ?? []), ...(params.journalSlug ? [params.journalSlug] : [])]
    .map((slug) => slug.trim())
    .filter((slug, index, all) => slug && all.indexOf(slug) === index);
}

function selectedCategories(params: ArticleSearchInput) {
  return [...(params.categories ?? []), ...(params.category ? [params.category] : [])]
    .map((value) => value.trim())
    .filter((value, index, all) => value && all.indexOf(value) === index);
}

function categoryClause(category: string): Prisma.ArticleWhereInput {
  if (category.includes("/")) {
    const [journal, ...rest] = category.split("/");
    return {
      category: {
        deletedAt: null,
        slug: rest.join("/"),
        journal: { websiteSlug: journal, deletedAt: null },
      },
    };
  }
  return {
    category: {
      deletedAt: null,
      OR: [{ slug: category }, { name: { equals: category, mode: "insensitive" } }],
    },
  };
}

export function hasFieldFilters(params: ArticleSearchInput) {
  return Boolean(
    params.keyword?.trim() ||
      params.author?.trim() ||
      params.title?.trim() ||
      selectedJournals(params).length ||
      selectedYears(params).length ||
      params.volume ||
      params.issue ||
      selectedCategories(params).length,
  );
}

export function buildArticleSearchWhere(params: ArticleSearchInput): Prisma.ArticleWhereInput {
  const and: Prisma.ArticleWhereInput[] = [];
  if (params.title?.trim()) {
    and.push({ title: { contains: params.title.trim(), mode: "insensitive" } });
  }
  if (params.keyword?.trim()) {
    and.push({
      keywords: { some: { keyword: { contains: params.keyword.trim(), mode: "insensitive" } } },
    });
  }
  if (params.author?.trim()) {
    const authorClause = authorSearchClause(params.author);
    if (authorClause) and.push(authorClause);
  }

  const journals = selectedJournals(params);
  if (journals.length === 1) {
    and.push({ journal: { websiteSlug: journals[0], deletedAt: null } });
  } else if (journals.length > 1) {
    and.push({ journal: { websiteSlug: { in: journals }, deletedAt: null } });
  }

  const categories = selectedCategories(params);
  if (categories.length === 1) {
    and.push(categoryClause(categories[0]));
  } else if (categories.length > 1) {
    and.push({ OR: categories.map(categoryClause) });
  }

  const issueFilter: Prisma.IssueWhereInput = { deletedAt: null };
  let hasIssue = false;
  const years = selectedYears(params);
  if (years.length === 1) {
    issueFilter.year = years[0];
    hasIssue = true;
  } else if (years.length > 1) {
    issueFilter.year = { in: years };
    hasIssue = true;
  }
  if (params.volume) {
    issueFilter.volume = params.volume;
    hasIssue = true;
  }
  if (params.issue) {
    issueFilter.issueNumber = params.issue;
    hasIssue = true;
  }
  if (hasIssue) and.push({ issue: issueFilter });

  const general = params.q ? generalSearchClause(params.q) : null;
  if (general) and.push(general);

  return {
    deletedAt: null,
    status: "PUBLISHED",
    ...(and.length ? { AND: and } : {}),
  };
}

export function describeSearchFilters(params: ArticleSearchInput) {
  const parts: string[] = [];
  const push = (label: string, value?: string | number) => {
    if (value === undefined || value === "") return;
    const text = String(value).trim();
    if (!text) return;
    parts.push(`${label} “${text}”`);
  };
  push("All fields", params.q);
  push("Keyword", params.keyword);
  push("Author", params.author);
  push("Title", params.title);
  for (const year of selectedYears(params)) push("Year", year);
  for (const journal of selectedJournals(params)) push("Journal", journal);
  push("Volume", params.volume);
  push("Issue", params.issue);
  for (const category of selectedCategories(params)) {
    push("Category", category.includes("/") ? category.split("/").slice(1).join("/") : category);
  }
  return parts.join(", ");
}

export { selectedYears, selectedJournals, selectedCategories };
