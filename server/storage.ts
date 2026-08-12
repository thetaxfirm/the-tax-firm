// S3-compatible object storage helpers.
//
// Works with any S3-compatible provider — Cloudflare R2, AWS S3, Backblaze B2,
// MinIO, etc. — selected entirely through environment variables:
//
//   S3_BUCKET             (required) bucket name
//   S3_ACCESS_KEY_ID      (required) access key
//   S3_SECRET_ACCESS_KEY  (required) secret key
//   S3_REGION             region (default "auto", which R2 expects)
//   S3_ENDPOINT           custom endpoint. Set for R2:
//                         https://<accountid>.r2.cloudflarestorage.com
//                         Leave unset for AWS S3.
//   S3_PUBLIC_URL         public base URL for objects (e.g. an R2 public bucket
//                         URL / custom domain, or https://<bucket>.s3.<region>.amazonaws.com).
//                         When set, uploaded object URLs are built from it so they
//                         are durable (needed for blog images). When unset, a
//                         time-limited presigned URL is returned instead.
//   S3_FORCE_PATH_STYLE   "true" to force path-style addressing (some providers)
//
// The public API (storagePut / storageGet) is unchanged from the previous
// Manus-proxy implementation, so callers do not need to change.

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const PRESIGN_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days (SigV4 maximum)

type StorageConfig = {
  bucket: string;
  publicBaseUrl: string | null;
};

let cachedClient: S3Client | null = null;
let cachedConfig: StorageConfig | null = null;

function getConfig(): StorageConfig {
  if (cachedConfig) return cachedConfig;

  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Object storage is not configured: set S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY"
    );
  }

  const publicBaseUrl = process.env.S3_PUBLIC_URL
    ? process.env.S3_PUBLIC_URL.replace(/\/+$/, "")
    : null;

  cachedConfig = { bucket, publicBaseUrl };
  return cachedConfig;
}

function getClient(): S3Client {
  if (cachedClient) return cachedClient;

  const endpoint = process.env.S3_ENDPOINT || undefined;

  cachedClient = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint,
    // R2 and most non-AWS providers require path-style; AWS works with either.
    forcePathStyle:
      process.env.S3_FORCE_PATH_STYLE === "true" || Boolean(endpoint),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    },
  });
  return cachedClient;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toBody(data: Buffer | Uint8Array | string): Buffer {
  if (typeof data === "string") return Buffer.from(data);
  if (Buffer.isBuffer(data)) return data;
  return Buffer.from(data);
}

async function resolveUrl(key: string): Promise<string> {
  const { bucket, publicBaseUrl } = getConfig();
  if (publicBaseUrl) {
    return `${publicBaseUrl}/${key}`;
  }
  // No public base configured — hand back a time-limited presigned URL.
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: PRESIGN_EXPIRY_SECONDS }
  );
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { bucket } = getConfig();
  const key = normalizeKey(relKey);

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: toBody(data),
      ContentType: contentType,
    })
  );

  return { key, url: await resolveUrl(key) };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: await resolveUrl(key) };
}

export async function storageDelete(relKey: string): Promise<void> {
  const { bucket } = getConfig();
  const key = normalizeKey(relKey);
  await getClient().send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key })
  );
}

/** True when object storage has the minimum required configuration. */
export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );
}
