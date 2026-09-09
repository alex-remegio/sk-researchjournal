import { describe, expect, it } from "vitest";
import { edasStageFromStatus, publishingProgress } from "@/lib/lifecycle/publishing";

const accepted = {
  status: "READY_FOR_PUBLICATION",
  title: "Title",
  abstract: "Abstract",
  journalId: "j1",
  issueId: "i1",
  publicationDate: new Date(),
  authors: [{ corresponding: true, orcid: "0000-0002-1825-0097" }],
  keywords: ["ai"],
  hasFinalPdf: true,
  doi: "10.5555/jct.2026.001",
};

describe("EDAS to publication pipeline", () => {
  it("maps researcher, EDAS, accept, admin, and public phases", () => {
    expect(publishingProgress({ status: "DRAFT" }).phase).toBe("researcher");
    expect(publishingProgress({ status: "SUBMITTED" }).edasStage).toBe("submission");
    expect(publishingProgress({ status: "FOR_REVIEW" }).edasStage).toBe("review");
    expect(publishingProgress({ status: "READY_FOR_PUBLICATION" }).accepted).toBe(true);
    expect(publishingProgress({ status: "READY_FOR_PUBLICATION" }).phase).toBe("admin");
    expect(publishingProgress(accepted).phase).toBe("publication");
    expect(publishingProgress({ ...accepted, status: "PUBLISHED" }).phase).toBe("public");
  });

  it("requires metadata, PDF, and DOI before publication", () => {
    const missingDoi = publishingProgress({ ...accepted, doi: null });
    expect(missingDoi.phase).toBe("admin");
    expect(missingDoi.assets.doi).toBe(false);
    expect(publishingProgress(accepted).assets).toEqual({ metadata: true, pdf: true, doi: true });
  });

  it("activates Scholar and Crossref after publication, ORCID when authors have iDs", () => {
    const live = publishingProgress({ ...accepted, status: "PUBLISHED" });
    expect(live.discovery.scholar).toBe(true);
    expect(live.discovery.crossref).toBe(true);
    expect(live.discovery.orcid).toBe(true);
    expect(edasStageFromStatus("PUBLISHED")).toBe("decision");
  });
});
