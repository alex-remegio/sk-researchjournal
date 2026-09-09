import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { assertSafeStorageKey } from "@/lib/storage/file-validation";
import type { FileStorage, StoredFile } from "@/lib/storage/types";

export function supabaseObjectPublicUrl(supabaseUrl: string, bucket: string, key: string) {
  assertSafeStorageKey(key);
  const encoded = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encoded}`;
}

function client(): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError("Supabase storage is not configured", 500, "STORAGE_NOT_CONFIGURED");
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export class SupabaseFileStorage implements FileStorage {
  publicUrl(key: string) {
    return supabaseObjectPublicUrl(env.SUPABASE_URL, env.SUPABASE_STORAGE_BUCKET, key);
  }

  async put(params: {
    key: string;
    body: Buffer;
    mimeType: string;
    originalName: string;
  }): Promise<StoredFile> {
    assertSafeStorageKey(params.key);
    const { error } = await client()
      .storage.from(env.SUPABASE_STORAGE_BUCKET)
      .upload(params.key, params.body, {
        contentType: params.mimeType,
        upsert: true,
        cacheControl: "3600",
      });
    if (error) {
      throw new AppError(error.message, 500, "STORAGE_UPLOAD_FAILED");
    }
    return {
      key: params.key,
      size: params.body.length,
      mimeType: params.mimeType,
      publicUrl: this.publicUrl(params.key),
    };
  }

  async get(key: string) {
    assertSafeStorageKey(key);
    const { data, error } = await client().storage.from(env.SUPABASE_STORAGE_BUCKET).download(key);
    if (error || !data) return null;
    return {
      body: Buffer.from(await data.arrayBuffer()),
      mimeType: data.type || "application/octet-stream",
    };
  }

  async delete(key: string) {
    assertSafeStorageKey(key);
    await client().storage.from(env.SUPABASE_STORAGE_BUCKET).remove([key]);
  }
}
