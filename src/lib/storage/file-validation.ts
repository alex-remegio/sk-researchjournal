import { createHash, randomBytes } from "crypto";
import { FileType } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { FILE_TYPE_EXTENSIONS, FILE_TYPE_MIMES } from "@/lib/storage/types";

type MagicMatch = { mime: string; extension: string };

function bytesStartWith(buffer: Buffer, signature: number[]) {
  return signature.every((byte, index) => buffer[index] === byte);
}

export function sniffMime(buffer: Buffer): MagicMatch | null {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return { mime: "application/pdf", extension: "pdf" };
  }
  if (bytesStartWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: "image/png", extension: "png" };
  }
  if (bytesStartWith(buffer, [0xff, 0xd8, 0xff])) {
    return { mime: "image/jpeg", extension: "jpg" };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mime: "image/webp", extension: "webp" };
  }
  if (bytesStartWith(buffer, [0x50, 0x4b, 0x03, 0x04])) {
    const name = buffer.toString("utf8", 30, 80);
    if (name.includes(".docx") || name.startsWith("word/")) {
      return {
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        extension: "docx",
      };
    }
    if (name.includes(".xlsx") || name.startsWith("xl/")) {
      return {
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        extension: "xlsx",
      };
    }
    return { mime: "application/zip", extension: "zip" };
  }
  const textStart = buffer.subarray(0, 64).toString("utf8");
  if (/^[\u0009\u000A\u000D\u0020-\u007E]+$/.test(textStart)) {
    if (textStart.includes(",") && !textStart.includes("<")) {
      return { mime: "text/csv", extension: "csv" };
    }
    return { mime: "text/plain", extension: "txt" };
  }
  return null;
}

export function sanitizeFileName(originalName: string) {
  const base = originalName.replace(/\\/g, "/").split("/").pop() ?? "file";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "");
  return cleaned.slice(0, 120) || "file";
}

export function assertSafeStorageKey(key: string) {
  if (!key || key.includes("..") || key.startsWith("/") || key.includes("\\") || key.includes("\0")) {
    throw new AppError("Invalid storage key", 400, "INVALID_STORAGE_KEY");
  }
}

export function buildStorageKey(parts: { journalId: string; articleId: string; fileType: FileType; fileName: string }) {
  const safeName = sanitizeFileName(parts.fileName);
  const id = randomBytes(8).toString("hex");
  return `journals/${parts.journalId}/articles/${parts.articleId}/${parts.fileType.toLowerCase()}/${id}-${safeName}`;
}

export function validateUpload(params: {
  fileType: FileType;
  buffer: Buffer;
  originalName: string;
  declaredMime?: string | null;
  maxBytes: number;
}) {
  if (params.buffer.length === 0) {
    throw new AppError("Empty file", 400, "EMPTY_FILE");
  }
  if (params.buffer.length > params.maxBytes) {
    throw new AppError("File exceeds the configured size limit", 400, "FILE_TOO_LARGE");
  }

  const sniffed = sniffMime(params.buffer);
  if (!sniffed) {
    throw new AppError("Unrecognized file signature", 400, "INVALID_FILE_SIGNATURE");
  }
  if (!FILE_TYPE_MIMES[params.fileType].includes(sniffed.mime)) {
    throw new AppError("File type is not allowed for this upload", 400, "INVALID_MIME");
  }

  const extension = sanitizeFileName(params.originalName).split(".").pop()?.toLowerCase() ?? "";
  if (!FILE_TYPE_EXTENSIONS[params.fileType].includes(extension)) {
    throw new AppError("File extension is not allowed", 400, "INVALID_EXTENSION");
  }

  return {
    mimeType: sniffed.mime,
    originalName: sanitizeFileName(params.originalName),
    checksum: createHash("sha256").update(params.buffer).digest("hex"),
  };
}
