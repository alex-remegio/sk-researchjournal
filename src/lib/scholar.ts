import type { Article, Author, Issue, Journal, Keyword, ArticleAuthor } from "@prisma/client";
import { displayName } from "@/lib/authors/name";
import { env } from "@/lib/env";

export type ScholarArticle = Article & {
  journal: Journal;
  issue: Issue | null;
  keywords: Keyword[];
  authors: (ArticleAuthor & { author: Author })[];
};

export type CitationTag = { name: string; content: string };

export const SCHOLAR_CITATION_TAGS = [
  "citation_title",
  "citation_author",
  "citation_journal_title",
  "citation_publication_date",
  "citation_volume",
  "citation_issue",
  "citation_firstpage",
  "citation_lastpage",
  "citation_pdf_url",
  "citation_doi",
] as const;

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function articlePublicPath(journalSlug: string, articleSlug: string) {
  return `/journals/${journalSlug}/articles/${articleSlug}`;
}

export function articleAbsoluteUrl(journalSlug: string, articleSlug: string) {
  return `${env.APP_URL}${articlePublicPath(journalSlug, articleSlug)}`;
}

export function pdfAbsoluteUrl(journalSlug: string, articleSlug: string) {
  return `${env.APP_URL}${articlePublicPath(journalSlug, articleSlug)}/pdf`;
}

/** Display and JSON-LD dates use ISO YYYY-MM-DD. Scholar meta tags use YYYY/MM/DD. */
export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  if (typeof date === "string") {
    const trimmed = date.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  }
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatCitation(article: ScholarArticle) {
  const authors = article.authors.map((link) => displayName(link.author)).join(", ");
  const year = article.issue?.year ?? asDate(article.publicationDate)?.getUTCFullYear();
  const volume = article.issue?.volume;
  const issueNumber = article.issue?.issueNumber;
  const pages = article.firstPage ? `${article.firstPage}–${article.lastPage}` : "";
  const venue = [
    article.journal.name,
    volume != null ? `${volume}${issueNumber != null ? `(${issueNumber})` : ""}` : null,
    pages || null,
  ]
    .filter(Boolean)
    .join(", ");
  const citation = [
    authors ? `${authors}${year ? ` (${year})` : ""}.` : null,
    `${article.title}.`,
    venue ? `${venue}.` : null,
  ]
    .filter(Boolean)
    .join(" ");
  return article.doi ? `${citation} https://doi.org/${article.doi}` : citation;
}

function formatScholarDate(date: Date | string | null | undefined) {
  return formatDate(date).replaceAll("-", "/");
}

/**
 * Database → article metadata → Scholar inclusion tags.
 * https://scholar.google.com/intl/en/scholar/inclusion.html
 */
export function generateScholarTags(article: ScholarArticle): CitationTag[] {
  const tags: CitationTag[] = [];
  const push = (name: (typeof SCHOLAR_CITATION_TAGS)[number], content?: string | null) => {
    if (content) tags.push({ name, content });
  };

  push("citation_title", article.title);
  for (const link of article.authors) {
    push("citation_author", displayName(link.author));
  }
  push("citation_journal_title", article.journal.name);
  push("citation_publication_date", formatScholarDate(article.publicationDate ?? article.publishedAt));
  push("citation_volume", article.issue ? String(article.issue.volume) : null);
  push("citation_issue", article.issue ? String(article.issue.issueNumber) : null);
  push("citation_firstpage", article.firstPage);
  push("citation_lastpage", article.lastPage);
  push("citation_pdf_url", pdfAbsoluteUrl(article.journal.websiteSlug, article.slug));
  push("citation_doi", article.doi);
  return tags;
}

export const citationTags = generateScholarTags;

/** Next.js `metadata.other` overwrites duplicate keys; arrays keep one tag per author. */
export function citationMeta(article: ScholarArticle): Record<string, string | string[]> {
  const grouped = new Map<string, string[]>();
  for (const tag of generateScholarTags(article)) {
    const values = grouped.get(tag.name) ?? [];
    values.push(tag.content);
    grouped.set(tag.name, values);
  }
  const other: Record<string, string | string[]> = {};
  for (const [name, values] of grouped) {
    other[name] = values.length === 1 ? values[0] : values;
  }
  return other;
}

export function scholarlyJsonLd(article: ScholarArticle) {
  const url = articleAbsoluteUrl(article.journal.websiteSlug, article.slug);
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.title,
    name: article.title,
    description: stripTags(article.abstract),
    datePublished: formatDate(article.publicationDate ?? article.publishedAt) || undefined,
    identifier: article.doi ? `https://doi.org/${article.doi}` : article.id,
    url,
    sameAs: article.doi ? [`https://doi.org/${article.doi}`] : undefined,
    isPartOf: {
      "@type": "PublicationIssue",
      issueNumber: article.issue ? String(article.issue.issueNumber) : undefined,
      datePublished: formatDate(article.issue?.publicationDate) || undefined,
      isPartOf: {
        "@type": "PublicationVolume",
        volumeNumber: article.issue ? String(article.issue.volume) : undefined,
        isPartOf: {
          "@type": "Periodical",
          name: article.journal.name,
          issn: [article.journal.issnOnline, article.journal.issnPrint].filter(Boolean),
        },
      },
    },
    author: article.authors.map((link) => ({
      "@type": "Person",
      name: displayName(link.author),
      affiliation: link.affiliationText || link.author.affiliation,
      identifier: link.author.orcid ? `https://orcid.org/${link.author.orcid}` : undefined,
    })),
    keywords: article.keywords.map((item) => item.keyword).join(", "),
    publisher: {
      "@type": "Organization",
      name: article.journal.publisher,
    },
    encoding: {
      "@type": "MediaObject",
      contentUrl: pdfAbsoluteUrl(article.journal.websiteSlug, article.slug),
      encodingFormat: "application/pdf",
    },
  };
}

export function openGraph(article: ScholarArticle) {
  const url = articleAbsoluteUrl(article.journal.websiteSlug, article.slug);
  return {
    title: `${article.title} | ${article.journal.name}`,
    description: stripTags(article.abstract).slice(0, 240),
    url,
    type: "article" as const,
    images: article.thumbnailUrl ? [article.thumbnailUrl] : undefined,
  };
}
