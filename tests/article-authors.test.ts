import { describe, expect, it } from "vitest";
import { getPublishBlockers } from "@/lib/validation/publish";

describe("article-author relationships", () => {
  it("rejects missing authors and multiple corresponding authors by default", () => {
    const none = getPublishBlockers({
      title: "T",
      abstract: "A",
      journalId: "j",
      issueId: "i",
      publicationDate: new Date(),
      authors: [],
      keywords: ["k"],
      hasFinalPdf: true,
      approvedAt: new Date(),
      status: "READY_FOR_PUBLICATION",
    });
    const many = getPublishBlockers({
      title: "T",
      abstract: "A",
      journalId: "j",
      issueId: "i",
      publicationDate: new Date(),
      authors: [{ corresponding: true }, { corresponding: true }],
      keywords: ["k"],
      hasFinalPdf: true,
      approvedAt: new Date(),
      status: "READY_FOR_PUBLICATION",
    });
    expect(none.some((item) => /author/i.test(item))).toBe(true);
    expect(many.some((item) => /corresponding/i.test(item))).toBe(true);
  });
});
