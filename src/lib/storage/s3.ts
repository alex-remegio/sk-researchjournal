import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { assertSafeStorageKey } from "@/lib/storage/file-validation";
import type { FileStorage, StoredFile } from "@/lib/storage/types";

function client() {
  if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    throw new AppError("S3 storage is not configured", 500, "STORAGE_NOT_CONFIGURED");
  }
  return new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT || undefined,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
}

export class S3FileStorage implements FileStorage {
  publicUrl(key: string) {
    assertSafeStorageKey(key);
    if (env.S3_PUBLIC_BASE_URL) {
      return `${env.S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
    }
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
    assertSafeStorageKey(params.key);
    await client().send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: params.key,
        Body: params.body,
        ContentType: params.mimeType,
        ContentDisposition: `inline; filename="${params.originalName}"`,
      }),
    );
    return {
      key: params.key,
      size: params.body.length,
      mimeType: params.mimeType,
      publicUrl: this.publicUrl(params.key),
    };
  }

  async get(key: string) {
    assertSafeStorageKey(key);
    try {
      const result = await client().send(
        new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
      );
      const bytes = await result.Body?.transformToByteArray();
      if (!bytes) return null;
      return {
        body: Buffer.from(bytes),
        mimeType: result.ContentType ?? "application/octet-stream",
      };
    } catch {
      return null;
    }
  }

  async delete(key: string) {
    assertSafeStorageKey(key);
    await client().send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
  }
}
