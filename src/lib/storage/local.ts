import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { assertSafeStorageKey } from "@/lib/storage/file-validation";
import type { FileStorage, StoredFile } from "@/lib/storage/types";

function rootDir() {
  return path.resolve(process.cwd(), env.STORAGE_LOCAL_PATH);
}

function resolveKey(key: string) {
  assertSafeStorageKey(key);
  const full = path.resolve(rootDir(), key);
  if (!full.startsWith(rootDir())) {
    throw new AppError("Invalid storage path", 400, "PATH_TRAVERSAL");
  }
  return full;
}

export class LocalFileStorage implements FileStorage {
  publicUrl(key: string) {
    assertSafeStorageKey(key);
    return `${env.APP_URL}/api/files/${key
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/")}`;
  }

  async put(params: {
    key: string;
    body: Buffer;
    mimeType: string;
    originalName: string;
  }): Promise<StoredFile> {
    const full = resolveKey(params.key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, params.body);
    return {
      key: params.key,
      size: params.body.length,
      mimeType: params.mimeType,
      publicUrl: this.publicUrl(params.key),
    };
  }

  async get(key: string) {
    try {
      const body = await readFile(resolveKey(key));
      return { body, mimeType: "application/octet-stream" };
    } catch {
      return null;
    }
  }

  async delete(key: string) {
    try {
      await unlink(resolveKey(key));
    } catch {
      // missing files are ignored
    }
  }
}
