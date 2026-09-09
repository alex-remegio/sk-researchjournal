import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/slug";
import { sanitizePlainText, sanitizeRichText } from "@/lib/sanitize";
import { authorSearchClause, buildArticleSearchWhere, describeSearchFilters, queryTokens } from "@/lib/search/query";

describe("search-oriented helpers", () => {
  it("creates stable slugs", () => {
    expect(slugify("Editorial Metadata & Google Scholar")).toBe("editorial-metadata-google-scholar");
    expect(uniqueSlug("article", ["article", "article-2"])).toBe("article-3");
  });
});

describe("sanitization", () => {
  it("strips scripts from rich text", () => {
    const clean = sanitizeRichText('<p>Hello</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>');
    expect(clean).toContain("<p>Hello</p>");
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("javascript:");
  });

  it("strips all tags from plain text", () => {
    expect(sanitizePlainText("<b>Title</b>")).toBe("Title");
  });
});

describe("article search queries", () => {
  it("tokenizes titles and author names", () => {
    expect(queryTokens("AI Integration in Education")).toEqual(["AI", "Integration", "in", "Education"]);
    expect(queryTokens("Florlyn Mae C. Remegio")).toEqual(["Florlyn", "Mae", "Remegio"]);
  });

  it("matches every author-name token against the same author", () => {
    const clause = authorSearchClause("Florlyn Mae Remegio");
    expect(clause?.authors).toMatchObject({
      some: {
        author: {
          AND: [{ OR: expect.any(Array) }, { OR: expect.any(Array) }, { OR: expect.any(Array) }],
        },
      },
    });
  });

  it("combines keyword, author, title, year, journal, volume, issue, and category", () => {
    const where = buildArticleSearchWhere({
      keyword: "metadata",
      author: "Okoye",
      title: "workflow",
      year: 2026,
      journalSlug: "jacr",
      volume: 12,
      issue: 1,
      category: "jacr/information-systems",
    });
    expect(where.status).toBe("PUBLISHED");
    expect(where.AND).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: expect.objectContaining({ contains: "workflow" }) }),
        expect.objectContaining({
          keywords: { some: { keyword: expect.objectContaining({ contains: "metadata" }) } },
        }),
        expect.objectContaining({ journal: expect.objectContaining({ websiteSlug: "jacr" }) }),
        expect.objectContaining({
          issue: expect.objectContaining({ year: 2026, volume: 12, issueNumber: 1 }),
        }),
        expect.objectContaining({
          category: expect.objectContaining({ slug: "information-systems" }),
        }),
      ]),
    );
    expect(describeSearchFilters({ author: "Okoye", volume: 12 })).toBe("Author “Okoye”, Volume “12”");
  });

  it("ORs multiple years, categories, and journals", () => {
    const where = buildArticleSearchWhere({
      q: "artificial intelligence",
      years: [2026, 2025, 2024],
      categories: ["computing", "education", "engineering"],
      journalSlugs: ["jot", "joe"],
    });
    expect(where.AND).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ journal: { websiteSlug: { in: ["jot", "joe"] }, deletedAt: null } }),
        expect.objectContaining({
          issue: expect.objectContaining({ year: { in: [2026, 2025, 2024] } }),
        }),
        expect.objectContaining({ OR: expect.any(Array) }),
      ]),
    );
  });
});
