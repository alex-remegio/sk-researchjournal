import { env } from "@/lib/env";
import { LocalFileStorage } from "@/lib/storage/local";
import { S3FileStorage } from "@/lib/storage/s3";
import { SupabaseFileStorage } from "@/lib/storage/supabase";
import type { FileStorage } from "@/lib/storage/types";

let instance: FileStorage | null = null;

export function getStorage(): FileStorage {
  if (instance) return instance;
  if (env.STORAGE_DRIVER === "s3") instance = new S3FileStorage();
  else if (env.STORAGE_DRIVER === "supabase") instance = new SupabaseFileStorage();
  else instance = new LocalFileStorage();
  return instance;
}

export function resetStorageForTests() {
  instance = null;
}
