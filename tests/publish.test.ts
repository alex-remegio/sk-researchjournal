import { describe, expect, it } from "vitest";
import { getPublishBlockers, canTransition } from "@/lib/validation/publish";
import { articleInformationSchema, articleIdentifiersSchema } from "@/lib/validation/schemas";
import { formatArticleStatus, formatRecentArticleStatus, pipelineStage, truncateArticleTitle } from "@/lib/lifecycle/article";

describe("article wizard validation", () => {
  it("requires core information fields", () => {
    expect(() => articleInformationSchema.parse({ title: "ab", abstract: "short", articleType: "RESEARCH" })).toThrow();
    expect(
      articleInformationSchema.parse({
        title: "A complete scholarly title",
        abstract: "This abstract is long enough to describe the contribution clearly.",
        articleType: "RESEARCH",
      }).title,
    ).toContain("complete");
  });

  it("validates DOI on the identifiers step", () => {
    expect(() => articleIdentifiersSchema.parse({ doi: "bad" })).toThrow();
    expect(articleIdentifiersSchema.parse({ doi: "10.5555/jacr.1", edasPaperId: "EDAS-1" }).doi).toBe(
      "10.5555/jacr.1",
    );
  });
});

describe("publishing rules", () => {
  const complete = {
    title: "Title",
    abstract: "Abstract",
    journalId: "j1",
    issueId: "i1",
    publicationDate: new Date(),
    authors: [{ corresponding: true }, { corresponding: false }],
    keywords: ["a"],
    hasFinalPdf: true,
    firstPage: "1",
    lastPage: "8",
    doi: "10.5555/jacr.1",
    approvedAt: new Date(),
    status: "READY_FOR_PUBLICATION",
  };

  it("returns no blockers for a complete approved article", () => {
    expect(getPublishBlockers(complete)).toEqual([]);
  });

  it("requires one corresponding author, PDF, keyword, issue, and approval", () => {
    const blockers = getPublishBlockers({
      ...complete,
      authors: [{ corresponding: false }],
      keywords: [],
      hasFinalPdf: false,
      issueId: null,
      approvedAt: null,
      status: "DRAFT",
    });
    expect(blockers.join(" ")).toMatch(/corresponding/i);
    expect(blockers.join(" ")).toMatch(/keyword/i);
    expect(blockers.join(" ")).toMatch(/PDF/i);
    expect(blockers.join(" ")).toMatch(/Issue/i);
    expect(blockers.join(" ")).toMatch(/approval/i);
    expect(getPublishBlockers({ ...complete, doi: null }).join(" ")).toMatch(/DOI/i);
  });

  it("allows only defined status transitions", () => {
    expect(canTransition("READY_FOR_PUBLICATION", "SCHEDULED")).toBe(true);
    expect(canTransition("SCHEDULED", "PUBLISHED")).toBe(true);
    expect(canTransition("DRAFT", "PUBLISHED")).toBe(false);
    expect(canTransition("PUBLISHED", "SCHEDULED")).toBe(true);
    expect(canTransition("PUBLISHED", "ARCHIVED")).toBe(true);
  });
});

describe("publication pipeline", () => {
  it("maps review and legacy statuses onto the public lifecycle", () => {
    expect(pipelineStage("SUBMITTED")).toBe("FOR_REVIEW");
    expect(pipelineStage("REVISION_REQUIRED")).toBe("FOR_REVIEW");
    expect(pipelineStage("FOR_APPROVAL")).toBe("READY_FOR_PUBLICATION");
    expect(pipelineStage("APPROVED")).toBe("READY_FOR_PUBLICATION");
    expect(pipelineStage("SCHEDULED")).toBe("SCHEDULED");
    expect(formatArticleStatus("READY_FOR_PUBLICATION")).toBe("Accepted");
    expect(formatArticleStatus("ARCHIVED")).toBe("Archived");
  });

  it("shortens recent-article labels and truncates titles", () => {
    expect(formatRecentArticleStatus("READY_FOR_PUBLICATION")).toBe("Accepted");
    expect(formatRecentArticleStatus("PUBLISHED")).toBe("Published");
    expect(formatRecentArticleStatus("DRAFT")).toBe("Draft");
    expect(truncateArticleTitle("AI Integration in Education")).toBe("AI Integration...");
  });
});
