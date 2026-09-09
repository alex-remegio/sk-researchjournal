import { describe, expect, it } from "vitest";
import { shouldCountMetric } from "@/lib/services/metrics";
import { rateLimit, resetRateLimitForTests } from "@/lib/auth/rate-limit";
import { MockEdasService } from "@/lib/edas/implementations";
import { hashPassword, verifyPassword, assertPasswordPolicy } from "@/lib/auth/password";

describe("metrics dedupe", () => {
  it("ignores repeated events inside the window", () => {
    const last = new Date("2026-01-01T00:00:00Z");
    const now = Date.parse("2026-01-01T00:10:00Z");
    expect(shouldCountMetric(last, now, 3600)).toBe(false);
    expect(shouldCountMetric(last, Date.parse("2026-01-01T02:00:00Z"), 3600)).toBe(true);
    expect(shouldCountMetric(null)).toBe(true);
  });
});

describe("authentication helpers", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("DevPassword123!");
    expect(hash).not.toContain("DevPassword123!");
    expect(await verifyPassword("DevPassword123!", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("enforces password policy", () => {
    expect(() => assertPasswordPolicy("short")).toThrow();
    expect(() => assertPasswordPolicy("DevPassword123!")).not.toThrow();
  });

  it("rate limits login-like keys", () => {
    resetRateLimitForTests();
    for (let i = 0; i < 5; i += 1) {
      expect(rateLimit("login:1", 5, 60_000).allowed).toBe(true);
    }
    expect(rateLimit("login:1", 5, 60_000).allowed).toBe(false);
  });
});

describe("EDAS adapter", () => {
  it("returns mock paper data without calling a remote API", async () => {
    const edas = new MockEdasService();
    const paper = await edas.lookupPaper(" EDAS-1001 ");
    expect(paper?.paperId).toBe("EDAS-1001");
    expect(paper?.source).toBe("mock");
  });

  it("records submission, review, and decision against a paper ID", async () => {
    const edas = new MockEdasService();
    const submitted = await edas.recordSubmission({
      paperId: "EDAS-2001",
      articleId: "a1",
      title: "A computing manuscript",
    });
    expect(submitted.stage).toBe("submission");
    expect(submitted.status).toBe("submitted");
    const reviewed = await edas.recordReview({ paperId: "EDAS-2001", recommendation: "MINOR_REVISION" });
    expect(reviewed.stage).toBe("review");
    const decided = await edas.recordDecision({ paperId: "EDAS-2001", outcome: "ACCEPT" });
    expect(decided.stage).toBe("decision");
    expect(decided.status).toBe("accept");
    const lookup = await edas.lookupPaper("EDAS-2001");
    expect(lookup?.review?.recommendation).toBe("MINOR_REVISION");
    expect(lookup?.decision?.outcome).toBe("ACCEPT");
  });
});
