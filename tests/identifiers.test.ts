import { describe, expect, it } from "vitest";
import { isValidDoi, isValidOrcid, isValidIssn, isValidPageRange, normalizeOrcid } from "@/lib/identifiers";

describe("DOI validation", () => {
  it("accepts standard DOIs", () => {
    expect(isValidDoi("10.5555/jacr.2026.001")).toBe(true);
    expect(isValidDoi("10.1000/xyz123")).toBe(true);
  });

  it("rejects incomplete values", () => {
    expect(isValidDoi("10.123")).toBe(false);
    expect(isValidDoi("doi:10.1000/xyz")).toBe(false);
    expect(isValidDoi("")).toBe(false);
  });
});

describe("ORCID validation", () => {
  it("accepts a checksum-valid ORCID", () => {
    expect(isValidOrcid("0000-0002-1825-0097")).toBe(true);
  });

  it("normalizes ORCID URLs", () => {
    expect(normalizeOrcid("https://orcid.org/0000-0002-1825-0097")).toBe("0000-0002-1825-0097");
  });

  it("rejects an invalid checksum", () => {
    expect(isValidOrcid("0000-0002-1825-0098")).toBe(false);
  });
});

describe("ISSN and page range", () => {
  it("validates ISSN", () => {
    expect(isValidIssn("2049-3630")).toBe(true);
    expect(isValidIssn("abc")).toBe(false);
  });

  it("requires last page to be greater or equal when numeric", () => {
    expect(isValidPageRange("1", "18")).toBe(true);
    expect(isValidPageRange("20", "18")).toBe(false);
    expect(isValidPageRange("A1", "A3")).toBe(true);
  });
});
