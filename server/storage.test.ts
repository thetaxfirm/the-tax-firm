/**
 * Guards the public/private split in resolveUrl().
 *
 * S3_PUBLIC_URL exists so blog images get durable links. The danger is that it
 * is a single global setting: applied to every key it would turn each portal
 * upload — client tax returns, W2s, financial statements — into a permanent
 * URL fetchable with no authentication, and that URL is persisted in
 * documents.fileUrl and rendered as a plain anchor.
 *
 * No network is involved: the public branch is string concatenation and
 * presigning is computed locally, so dummy credentials are enough.
 */
import { beforeAll, describe, expect, it } from "vitest";

const PUBLIC_BASE = "https://cdn.example.test";

let storageGet: (key: string) => Promise<{ key: string; url: string }>;

beforeAll(async () => {
  process.env.S3_BUCKET = "test-bucket";
  process.env.S3_ACCESS_KEY_ID = "AKIATEST";
  process.env.S3_SECRET_ACCESS_KEY = "secret";
  process.env.S3_REGION = "auto";
  process.env.S3_PUBLIC_URL = PUBLIC_BASE;

  ({ storageGet } = await import("./storage"));
});

describe("resolveUrl with S3_PUBLIC_URL configured", () => {
  it("serves blog assets from the public base URL", async () => {
    const { url } = await storageGet("blog/s-corp-guide_abc123.jpg");
    expect(url).toBe(`${PUBLIC_BASE}/blog/s-corp-guide_abc123.jpg`);
  });

  it("never serves portal documents from the public base URL", async () => {
    for (const key of [
      "portal/42/xyz789-2025-tax-return.pdf",
      "portal/1/aaa-W2.pdf",
    ]) {
      const { url } = await storageGet(key);
      expect(url.startsWith(PUBLIC_BASE)).toBe(false);
      // A presigned URL, i.e. access is authenticated and time-limited.
      expect(url).toContain("X-Amz-Signature=");
      expect(url).toContain("X-Amz-Expires=");
    }
  });

  it("presigns anything outside the known-public prefixes", async () => {
    const { url } = await storageGet("something-else/file.bin");
    expect(url.startsWith(PUBLIC_BASE)).toBe(false);
    expect(url).toContain("X-Amz-Signature=");
  });
});
