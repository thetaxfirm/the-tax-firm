/**
 * Google Drive -> Blog API Sync Script
 *
 * Reads Google Docs from a shared Drive folder and publishes them
 * as blog articles via the REST API on thetaxfirm.us.
 *
 * Anti-duplicate system:
 *   - Tracks published articles in persistent volume (/app/data/published.json)
 *   - Double-checks by Drive file ID AND by normalized title
 *   - Survives Railway container redeploys via mounted volume
 *   - Seed endpoint to restore state if volume is lost
 *
 * Environment variables:
 *   GOOGLE_API_KEY       — Google API key (for public Drive files)
 *   DRIVE_FOLDER_ID      — Google Drive folder ID to watch
 *   BLOG_API_URL         — Blog API base URL (e.g. https://thetaxfirm.us/api/blog)
 *   BLOG_API_KEY         — Blog API bearer token
 *   DATA_DIR             — Persistent data directory (default: /app/data)
 *   PORT                 — HTTP port for seed/status endpoints (default: 8080)
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import http from "http";

// ── Config ──────────────────────────────────────────────

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID!;
const BLOG_API_URL = process.env.BLOG_API_URL || "https://thetaxfirm.us/api/blog";
const BLOG_API_KEY = process.env.BLOG_API_KEY!;
const DATA_DIR = process.env.DATA_DIR || "/app/data";
const PUBLISHED_LOG = path.join(DATA_DIR, "published.json");

// ── Published tracker (anti-duplicate) ──────────────────

interface PublishedEntry {
  slug: string;
  title: string;
  modifiedTime: string;
  publishedAt: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadPublished(): Record<string, PublishedEntry> {
  try {
    return JSON.parse(fs.readFileSync(PUBLISHED_LOG, "utf-8"));
  } catch {
    return {};
  }
}

function savePublished(data: Record<string, PublishedEntry>) {
  ensureDataDir();
  fs.writeFileSync(PUBLISHED_LOG, JSON.stringify(data, null, 2));
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function isAlreadyPublished(
  published: Record<string, PublishedEntry>,
  fileId: string,
  title: string,
  modifiedTime: string
): { isDuplicate: boolean; reason?: string; needsUpdate?: boolean } {
  // Check 1: exact file ID match
  const byId = published[fileId];
  if (byId) {
    if (byId.modifiedTime === modifiedTime) {
      return { isDuplicate: true, reason: `ID match, unchanged` };
    }
    return { isDuplicate: false, needsUpdate: true };
  }

  // Check 2: title match (catches re-created files with new IDs)
  const normalizedTitle = normalizeTitle(title);
  for (const [existingId, entry] of Object.entries(published)) {
    if (normalizeTitle(entry.title) === normalizedTitle) {
      return {
        isDuplicate: true,
        reason: `title match with ${existingId} ("${entry.title}")`,
      };
    }
  }

  return { isDuplicate: false };
}

// ── Google Drive helpers ────────────────────────────────

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  createdTime: string;
}

async function listDriveFiles(): Promise<DriveFile[]> {
  const query = `'${DRIVE_FOLDER_ID}' in parents and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&fields=files(id,name,mimeType,modifiedTime,createdTime)&orderBy=modifiedTime desc&pageSize=100`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Drive API error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.files || [];
}

async function exportGoogleDoc(fileId: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Export error for ${fileId}: ${res.status} ${await res.text()}`);
  }
  return res.text();
}

async function downloadFile(fileId: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download error for ${fileId}: ${res.status} ${await res.text()}`);
  }
  return res.text();
}

const SUPPORTED_MIME_TYPES = new Set([
  "application/vnd.google-apps.document",
  "text/plain",
  "text/markdown",
  "text/html",
]);

function isImageFile(file: DriveFile): boolean {
  return file.mimeType.startsWith("image/");
}

function isSupportedFile(file: DriveFile): boolean {
  if (SUPPORTED_MIME_TYPES.has(file.mimeType)) return true;
  // Also support .md and .txt files regardless of reported MIME type
  if (/\.(md|txt|markdown)$/i.test(file.name)) return true;
  return false;
}

/**
 * Download image from Drive and upload to CDN via Blog API.
 * Returns the CDN URL for use in <img> tags.
 */
async function uploadImageToCdn(fileId: string, slug: string, mimeType: string): Promise<string | null> {
  try {
    // Download image bytes from Drive via direct link
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const dlRes = await fetch(downloadUrl, { redirect: "follow" });
    if (!dlRes.ok) {
      console.error(`[upload] Drive download failed: ${dlRes.status} ${dlRes.statusText} for file ${fileId}`);
      return null;
    }
    const imageBuffer = Buffer.from(await dlRes.arrayBuffer());

    // Upload to CDN via Blog API
    const uploadRes = await fetch(`${BLOG_API_URL}/upload-image?slug=${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: {
        "Content-Type": mimeType,
        Authorization: `Bearer ${BLOG_API_KEY}`,
      },
      body: imageBuffer,
    });

    if (!uploadRes.ok) {
      const body = await uploadRes.text().catch(() => "");
      console.error(`[upload] CDN upload failed: ${uploadRes.status} ${uploadRes.statusText} — ${body}`);
      return null;
    }
    const data = await uploadRes.json();
    return data.url || null;
  } catch (err) {
    console.error(`[upload] Exception:`, err);
    return null;
  }
}

/**
 * Build a list of image files with their normalized kebab names.
 * Image names follow the pattern: prefix-article-title-slug.ext
 * We store the full kebab name so we can match via endsWith against article title slugs.
 */
function getImageFiles(files: DriveFile[]): Array<{ kebab: string; id: string; name: string; mimeType: string }> {
  const images: Array<{ kebab: string; id: string; name: string; mimeType: string }> = [];
  for (const file of files) {
    if (!isImageFile(file)) continue;
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, "");
    const kebab = nameWithoutExt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    images.push({ kebab, id: file.id, name: file.name, mimeType: file.mimeType });
  }
  return images;
}

/**
 * Find the image file ID that matches a given article title slug.
 * Uses endsWith to reliably ignore any prefix in the image filename.
 */
function findImageForArticle(
  images: Array<{ kebab: string; id: string; name: string; mimeType: string }>,
  titleSlug: string,
): { id: string; name: string; mimeType: string } | null {
  // Exact match
  for (const img of images) {
    if (img.kebab === titleSlug || img.kebab.endsWith(`-${titleSlug}`)) {
      return img;
    }
  }
  // Fuzzy match: strip hyphens to handle &, 's, and other special char differences
  const normalized = titleSlug.replace(/-/g, "");
  for (const img of images) {
    const imgNorm = img.kebab.replace(/-/g, "");
    if (imgNorm === normalized || imgNorm.endsWith(normalized)) {
      return img;
    }
  }
  return null;
}

async function getFileContent(file: DriveFile): Promise<string> {
  if (file.mimeType === "application/vnd.google-apps.document") {
    return exportGoogleDoc(file.id);
  }
  return downloadFile(file.id);
}

// ── Text to Markdown conversion ─────────────────────────

function textToMarkdown(text: string, title: string): string {
  const lines = text.split("\n");
  const mdLines: string[] = [];
  let firstLine = true;

  for (const line of lines) {
    const trimmed = line.trim();
    if (firstLine && trimmed) {
      firstLine = false;
      if (trimmed.toLowerCase() === title.toLowerCase()) {
        continue;
      }
    }
    mdLines.push(line);
  }

  return mdLines.join("\n").trim();
}

// ── Parse title and metadata from doc name ──────────────

function parseDocName(name: string): { title: string; category?: string } {
  const clean = name.replace(/\.(gdoc|md|txt|docx)$/i, "").trim();
  const categoryMatch = clean.match(/^\[([^\]]+)\]\s*(.+)/);
  if (categoryMatch) {
    return { category: categoryMatch[1], title: categoryMatch[2] };
  }
  return { title: clean };
}

// ── Blog API ────────────────────────────────────────────

async function publishArticle(article: {
  title: string;
  content: string;
  category?: string;
  externalId: string;
  image?: string;
}): Promise<{ success: boolean; action: string; slug: string }> {
  const body: Record<string, string> = {
    title: article.title,
    content: article.content,
    category: article.category || "Tax Strategy",
    source: "google-drive",
    externalId: article.externalId,
    status: "published",
  };
  if (article.image) {
    body.image = article.image;
  }

  const res = await fetch(`${BLOG_API_URL}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BLOG_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Blog API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    success: data.success,
    action: data.action,
    slug: data.article.slug,
  };
}

// ── Main sync logic ─────────────────────────────────────

async function sync() {
  console.log(`[sync] Starting sync at ${new Date().toISOString()}`);
  console.log(`[sync] Folder: ${DRIVE_FOLDER_ID}`);
  console.log(`[sync] Target: ${BLOG_API_URL}`);
  console.log(`[sync] Data dir: ${DATA_DIR}`);

  if (!GOOGLE_API_KEY || !DRIVE_FOLDER_ID || !BLOG_API_KEY) {
    console.error("[sync] Missing required env vars: GOOGLE_API_KEY, DRIVE_FOLDER_ID, BLOG_API_KEY");
    process.exit(1);
  }

  ensureDataDir();
  const published = loadPublished();
  const files = await listDriveFiles();

  console.log(`[sync] Found ${files.length} file(s) in Drive folder`);
  console.log(`[sync] Tracking ${Object.keys(published).length} published article(s)`);

  // Collect image files for article matching
  const imageFiles = getImageFiles(files);
  console.log(`[sync] Found ${imageFiles.length} image(s) for article matching`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    if (!isSupportedFile(file)) {
      console.log(`[sync] Skip (unsupported type ${file.mimeType}): ${file.name}`);
      skipped++;
      continue;
    }

    const { title, category } = parseDocName(file.name);
    const check = isAlreadyPublished(published, file.id, title, file.modifiedTime);

    if (check.isDuplicate) {
      console.log(`[sync] Skip (${check.reason}): ${file.name}`);
      skipped++;
      continue;
    }

    try {
      console.log(`[sync] Processing: ${file.name} (${file.mimeType})`);

      const rawContent = await getFileContent(file);
      if (!rawContent.trim()) {
        console.log(`[sync] Skip (empty): ${file.name}`);
        skipped++;
        continue;
      }

      const content = textToMarkdown(rawContent, title);

      // Match image, download from Drive, upload to CDN
      const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const matchedImg = findImageForArticle(imageFiles, titleSlug);
      let matchedImage: string | undefined;
      if (matchedImg) {
        const cdnUrl = await uploadImageToCdn(matchedImg.id, titleSlug, matchedImg.mimeType);
        if (cdnUrl) {
          matchedImage = cdnUrl;
          console.log(`[sync] Uploaded image "${matchedImg.name}" to CDN for "${title}"`);
        } else {
          console.log(`[sync] Image upload failed for "${matchedImg.name}"`);
        }
      } else {
        console.log(`[sync] No image match for "${title}" (slug: ${titleSlug})`);
      }

      const result = await publishArticle({
        title,
        content,
        category,
        externalId: `gdrive:${file.id}`,
        image: matchedImage,
      });

      console.log(`[sync] ${result.action}: "${title}" -> /blog/${result.slug}`);

      published[file.id] = {
        slug: result.slug,
        title,
        modifiedTime: file.modifiedTime,
        publishedAt: new Date().toISOString(),
      };

      if (result.action === "created") created++;
      else updated++;
    } catch (err) {
      console.error(`[sync] Error processing ${file.name}:`, err);
    }
  }

  savePublished(published);
  console.log(`[sync] Done. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
}

/**
 * Fix images for all already-published articles.
 * Matches Drive image files to articles by slug and updates via PUT API.
 */
async function fixImages() {
  if (!GOOGLE_API_KEY || !DRIVE_FOLDER_ID || !BLOG_API_KEY) {
    console.error("[fix-images] Missing required env vars");
    process.exit(1);
  }

  const published = loadPublished();
  const files = await listDriveFiles();
  const imageFiles = getImageFiles(files);

  console.log(`[fix-images] ${Object.keys(published).length} published article(s), ${imageFiles.length} image(s) in Drive`);

  let fixed = 0;
  let failed = 0;

  for (const [, entry] of Object.entries(published)) {
    const titleSlug = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const matchedImg = findImageForArticle(imageFiles, titleSlug);

    if (!matchedImg) {
      console.log(`[fix-images] No image found for "${entry.title}" (slug: ${titleSlug})`);
      continue;
    }

    const cdnUrl = await uploadImageToCdn(matchedImg.id, titleSlug, matchedImg.mimeType);
    if (!cdnUrl) {
      console.log(`[fix-images] Upload failed for "${matchedImg.name}"`);
      failed++;
      continue;
    }

    // Update article image via PUT API
    const res = await fetch(`${BLOG_API_URL}/articles/${entry.slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BLOG_API_KEY}`,
      },
      body: JSON.stringify({ image: cdnUrl }),
    });

    if (res.ok) {
      console.log(`[fix-images] Updated "${entry.title}" -> ${matchedImg.name}`);
      fixed++;
    } else {
      console.log(`[fix-images] PUT failed for "${entry.slug}": ${res.status}`);
      failed++;
    }
  }

  console.log(`[fix-images] Done. Fixed: ${fixed}, Failed: ${failed}`);
}

// ── HTTP server for seed/status endpoints ───────────────

function startServer() {
  const port = parseInt(process.env.PORT || "8080");

  const server = http.createServer(async (req, res) => {
    // Health check
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", time: new Date().toISOString() }));
      return;
    }

    // Status: show tracked articles
    if (req.method === "GET" && req.url === "/published") {
      const published = loadPublished();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ count: Object.keys(published).length, articles: published }, null, 2));
      return;
    }

    // Seed: restore published state
    if (req.method === "POST" && req.url === "/published/seed") {
      // Verify API key
      const auth = req.headers.authorization;
      if (!auth || auth !== `Bearer ${BLOG_API_KEY}`) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { articles } = JSON.parse(body);
          if (!Array.isArray(articles)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Expected { articles: [...] }" }));
            return;
          }

          const published = loadPublished();
          let added = 0;

          for (const a of articles) {
            const id = a.id || `seed:${normalizeTitle(a.title)}`;
            if (!published[id]) {
              published[id] = {
                slug: a.slug || normalizeTitle(a.title),
                title: a.title,
                modifiedTime: a.modifiedTime || new Date().toISOString(),
                publishedAt: a.publishedAt || new Date().toISOString(),
              };
              added++;
            }
          }

          savePublished(published);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, added, total: Object.keys(published).length }));
        } catch (err: any) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // Trigger sync manually
    if (req.method === "POST" && req.url === "/sync") {
      const auth = req.headers.authorization;
      if (!auth || auth !== `Bearer ${BLOG_API_KEY}`) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "sync started" }));
      sync().catch(console.error);
      return;
    }

    // Fix images for already-published articles
    if (req.method === "POST" && req.url === "/fix-images") {
      const auth = req.headers.authorization;
      if (!auth || auth !== `Bearer ${BLOG_API_KEY}`) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "fix-images started" }));
      fixImages().catch(console.error);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  server.listen(port, () => {
    console.log(`[server] Listening on port ${port}`);
    console.log(`[server] GET  /health          — health check`);
    console.log(`[server] GET  /published        — list tracked articles`);
    console.log(`[server] POST /published/seed   — restore published state`);
    console.log(`[server] POST /sync             — trigger sync manually`);
    console.log(`[server] POST /fix-images       — update images for published articles`);
  });
}

// ── Entry point ─────────────────────────────────────────

const mode = process.argv[2];

if (mode === "fix-images") {
  fixImages().catch((err) => {
    console.error("[fix-images] Fatal error:", err);
    process.exit(1);
  });
} else if (mode === "serve") {
  // Long-running mode: start HTTP server + run sync on schedule
  ensureDataDir();
  startServer();

  // Run sync immediately on startup
  sync().catch(console.error);

  // Then every 24 hours
  const INTERVAL = 24 * 60 * 60 * 1000;
  setInterval(() => {
    sync().catch(console.error);
  }, INTERVAL);
  console.log(`[scheduler] Next sync in 24 hours`);
} else {
  // One-shot mode: run sync and exit (for cron)
  sync().catch((err) => {
    console.error("[sync] Fatal error:", err);
    process.exit(1);
  });
}
