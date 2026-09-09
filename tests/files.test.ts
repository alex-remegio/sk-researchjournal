import { describe, expect, it } from "vitest";
import { FileType } from "@prisma/client";
import { sniffMime, validateUpload, sanitizeFileName, assertSafeStorageKey } from "@/lib/storage/file-validation";

const pdf = Buffer.from("%PDF-1.4\ntrailer\n%%EOF\n");
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

describe("file signature validation", () => {
  it("detects PDF and PNG magic bytes", () => {
    expect(sniffMime(pdf)?.mime).toBe("application/pdf");
    expect(sniffMime(png)?.mime).toBe("image/png");
  });

  it("rejects mismatched types", () => {
    expect(() =>
      validateUpload({
        fileType: FileType.THUMBNAIL,
        buffer: pdf,
        originalName: "cover.png",
        maxBytes: 5_000_000,
      }),
    ).toThrow(/not allowed/i);
  });

  it("rejects oversized files", () => {
    expect(() =>
      validateUpload({
        fileType: FileType.FINAL_PDF,
        buffer: pdf,
        originalName: "paper.pdf",
        maxBytes: 4,
      }),
    ).toThrow(/size limit/i);
  });

  it("sanitizes names and blocks path traversal", () => {
    expect(sanitizeFileName("../../etc/passwd.pdf")).toBe("passwd.pdf");
    expect(() => assertSafeStorageKey("../secret")).toThrow();
    expect(() => assertSafeStorageKey("/absolute")).toThrow();
  });
});
