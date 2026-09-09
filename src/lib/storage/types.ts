import { FileType } from "@prisma/client";

export type StoredFile = {
  key: string;
  size: number;
  mimeType: string;
  publicUrl: string;
};

export interface FileStorage {
  put(params: {
    key: string;
    body: Buffer;
    mimeType: string;
    originalName: string;
  }): Promise<StoredFile>;
  get(key: string): Promise<{ body: Buffer; mimeType: string } | null>;
  delete(key: string): Promise<void>;
  publicUrl(key: string): string;
}

export type UploadLimits = {
  [FileType.FINAL_PDF]: number;
  [FileType.SUPPLEMENTARY]: number;
  [FileType.THUMBNAIL]: number;
  [FileType.MANUSCRIPT]: number;
};

export const FILE_TYPE_EXTENSIONS: Record<FileType, string[]> = {
  FINAL_PDF: ["pdf"],
  SUPPLEMENTARY: ["pdf", "zip", "docx", "xlsx", "csv", "txt"],
  THUMBNAIL: ["jpg", "jpeg", "png", "webp"],
  MANUSCRIPT: ["pdf"],
};

export const FILE_TYPE_MIMES: Record<FileType, string[]> = {
  FINAL_PDF: ["application/pdf"],
  SUPPLEMENTARY: [
    "application/pdf",
    "application/zip",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "text/plain",
  ],
  THUMBNAIL: ["image/jpeg", "image/png", "image/webp"],
  MANUSCRIPT: ["application/pdf"],
};
