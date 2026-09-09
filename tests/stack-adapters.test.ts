import { describe, expect, it } from "vitest";
import { MockCrossrefService } from "@/lib/doi/implementations";
import { MockOrcidService, orcidUrl } from "@/lib/orcid";
import { supabaseObjectPublicUrl } from "@/lib/storage/supabase";

describe("Crossref adapter", () => {
  it("registers a DOI in mock mode without a remote call", async () => {
    const crossref = new MockCrossrefService();
    const deposited = await crossref.registerArticle({
      doi: "10.5555/jct.2026.001",
      articleId: "a1",
      title: "Artificial Intelligence Integration in Higher Education",
      resourceUrl: "http://localhost:3000/journals/jct/articles/ai",
      journalTitle: "Journal of Computing and Technology",
      authors: [
        { given: "Florlyn Mae C.", family: "Remegio", orcid: "0000-0002-1825-0097" },
        { given: "Alex N.", family: "Remegio" },
      ],
    });
    expect(deposited.source).toBe("mock");
    expect(deposited.status).toBe("registered");
    expect(deposited.doi).toBe("10.5555/jct.2026.001");
    const lookup = await crossref.lookup("10.5555/jct.2026.001");
    expect(lookup?.resourceUrl).toContain("/journals/jct/articles/ai");
  });
});

describe("ORCID adapter", () => {
  it("returns a mock public record for a checksum-valid ORCID", async () => {
    const orcid = new MockOrcidService();
    const person = await orcid.lookup("https://orcid.org/0000-0002-1825-0097");
    expect(person?.orcid).toBe("0000-0002-1825-0097");
    expect(person?.source).toBe("mock");
    expect(orcidUrl(person!.orcid)).toBe("https://orcid.org/0000-0002-1825-0097");
  });

  it("rejects an invalid ORCID", async () => {
    const orcid = new MockOrcidService();
    expect(await orcid.lookup("0000-0002-1825-0098")).toBeNull();
  });
});

describe("Supabase Storage URLs", () => {
  it("builds a public object URL from project URL, bucket, and key", () => {
    expect(
      supabaseObjectPublicUrl("https://example.supabase.co", "journal-files", "articles/a1/final.pdf"),
    ).toBe("https://example.supabase.co/storage/v1/object/public/journal-files/articles/a1/final.pdf");
  });
});
