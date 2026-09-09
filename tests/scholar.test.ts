import { describe, expect, it } from "vitest";
import { ArticleStatus, ArticleType } from "@prisma/client";
import { citationMeta, formatCitation, formatDate, generateScholarTags, scholarlyJsonLd } from "@/lib/scholar";

const article = {
  id: "a1",
  title: "Editorial metadata and Google Scholar citation tagging",
  slug: "editorial-metadata-google-scholar",
  abstract: "<p>Abstract text</p>",
  articleType: ArticleType.RESEARCH,
  categoryId: null,
  doi: "10.5555/jacr.2026.002",
  journalId: "j1",
  issueId: "i1",
  firstPage: "19",
  lastPage: "33",
  publicationDate: new Date("2026-03-15"),
  pdfUrl: "/pdf",
  thumbnailUrl: null,
  status: ArticleStatus.PUBLISHED,
  edasPaperId: "EDAS-1002",
  createdById: "u",
  approvedById: "u",
  approvedAt: new Date(),
  publishedAt: new Date("2026-03-15"),
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  journal: {
    id: "j1",
    name: "Journal of Applied Computing Research",
    abbreviation: "JACR",
    description: "",
    issnPrint: "2049-3630",
    issnOnline: "2049-3649",
    publisher: "Journal Platform Press",
    frequency: "Quarterly",
    logoUrl: null,
    coverUrl: null,
    websiteSlug: "jacr",
    active: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  issue: {
    id: "i1",
    journalId: "j1",
    volume: 12,
    issueNumber: 1,
    title: "Issue",
    year: 2026,
    publicationDate: new Date("2026-03-01"),
    coverUrl: null,
    status: "PUBLISHED" as const,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  keywords: [{ id: "k1", articleId: "a1", keyword: "metadata", sortOrder: 1 }],
  authors: [
    {
      articleId: "a1",
      authorId: "au1",
      authorOrder: 1,
      corresponding: true,
      affiliationText: "TU Delft",
      author: {
        id: "au1",
        userId: null,
        firstName: "Daniel",
        middleName: "R.",
        lastName: "Voss",
        email: "d@example.edu",
        affiliation: "TU Delft",
        country: "Netherlands",
        orcid: "0000-0002-1825-0097",
        biography: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ],
};

describe("Google Scholar metadata", () => {
  it("maps article metadata to the Scholar inclusion tags", () => {
    const tags = generateScholarTags(article);
    expect(tags.map((tag) => tag.name)).toEqual([
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
    ]);
    const map = Object.fromEntries(tags.map((tag) => [tag.name, tag.content]));
    expect(map.citation_title).toBe(article.title);
    expect(map.citation_author).toBe("Daniel R. Voss");
    expect(map.citation_journal_title).toBe("Journal of Applied Computing Research");
    expect(map.citation_publication_date).toBe("2026/03/15");
    expect(map.citation_volume).toBe("12");
    expect(map.citation_issue).toBe("1");
    expect(map.citation_firstpage).toBe("19");
    expect(map.citation_lastpage).toBe("33");
    expect(map.citation_pdf_url).toContain("/journals/jacr/articles/editorial-metadata-google-scholar/pdf");
    expect(map.citation_doi).toBe("10.5555/jacr.2026.002");
  });

  it("generates one citation_author tag per database author", () => {
    const record = {
      ...article,
      title: "AI Integration in Education",
      slug: "ai-integration-in-education",
      doi: "10.5555/jacr.2026.004",
      firstPage: "34",
      lastPage: "48",
      authors: [
        {
          ...article.authors[0],
          authorId: "florlyn",
          authorOrder: 1,
          corresponding: true,
          author: {
            ...article.authors[0].author,
            id: "florlyn",
            firstName: "Florlyn Mae",
            middleName: "C.",
            lastName: "Remegio",
          },
        },
        {
          ...article.authors[0],
          authorId: "alex",
          authorOrder: 2,
          corresponding: false,
          author: {
            ...article.authors[0].author,
            id: "alex",
            firstName: "Alex",
            middleName: "N.",
            lastName: "Remegio",
          },
        },
      ],
    };
    const tags = generateScholarTags(record);
    expect(tags.filter((tag) => tag.name === "citation_title")).toEqual([
      { name: "citation_title", content: "AI Integration in Education" },
    ]);
    expect(tags.filter((tag) => tag.name === "citation_author")).toEqual([
      { name: "citation_author", content: "Florlyn Mae C. Remegio" },
      { name: "citation_author", content: "Alex N. Remegio" },
    ]);
    expect(tags.find((tag) => tag.name === "citation_volume")?.content).toBe("12");
    expect(tags.find((tag) => tag.name === "citation_issue")?.content).toBe("1");
    expect(tags.find((tag) => tag.name === "citation_pdf_url")?.content).toContain(
      "/journals/jacr/articles/ai-integration-in-education/pdf",
    );
    expect(citationMeta(record).citation_author).toEqual(["Florlyn Mae C. Remegio", "Alex N. Remegio"]);
    expect(formatCitation({ ...record, journal: { ...record.journal, name: "Journal of Computing and Technology" }, issue: { ...record.issue!, volume: 1, issueNumber: 2 }, firstPage: "1", lastPage: "18", doi: "10.5555/jct.2026.001", title: "Artificial Intelligence Integration in Higher Education" })).toContain(
      "Florlyn Mae C. Remegio, Alex N. Remegio (2026). Artificial Intelligence Integration in Higher Education. Journal of Computing and Technology, 1(2), 1–18.",
    );
  });

  it("builds ScholarlyArticle JSON-LD", () => {
    const jsonLd = scholarlyJsonLd(article);
    expect(jsonLd["@type"]).toBe("ScholarlyArticle");
    expect(jsonLd.headline).toBe(article.title);
  });

  it("formats Date objects and ISO strings without throwing", () => {
    expect(formatDate(new Date("2026-06-15T00:00:00.000Z"))).toBe("2026-06-15");
    expect(formatDate("2026-06-15T12:00:00.000Z")).toBe("2026-06-15");
    expect(formatDate("2026-06-15")).toBe("2026-06-15");
    expect(formatDate(null)).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });
});
