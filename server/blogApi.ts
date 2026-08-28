/**
 * REST API for external blog article publishing.
 * Secured with an API key (BLOG_API_KEY environment variable).
 * 
 * Endpoints:
 *   POST   /api/blog/articles       — Create or update an article (upsert by slug)
 *   GET    /api/blog/articles       — List all published articles
 *   GET    /api/blog/articles/:slug — Get a single article by slug
 *   PUT    /api/blog/articles/:slug — Update an existing article
 *   DELETE /api/blog/articles/:slug — Delete an article
 *
 * Authentication:
 *   Include header: Authorization: Bearer <BLOG_API_KEY>
 *
 * Tely.ai Integration:
 *   Configure Tely.ai webhook to POST to /api/blog/articles with the article payload.
 *   The endpoint accepts standard blog fields and maps them to the database schema.
 */

import { Router, Request, Response, NextFunction } from "express";
import {
  createBlogArticle,
  getBlogArticleBySlug,
  getPublishedBlogArticles,
  getAllBlogArticles,
  updateBlogArticle,
  deleteBlogArticle,
  upsertBlogArticleBySlug,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { storagePut, isStorageConfigured } from "./storage";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const blogApiRouter = Router();

/* ── Helpers ─────────────────────────────────── */

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 250);
}

/**
 * Reduce a caller-supplied slug to a safe file-name fragment: alphanumerics,
 * dash and underscore only. Path separators and "." (so no ".." traversal)
 * are collapsed to dashes.
 */
function sanitizeSlugForFileName(slug: string | undefined): string {
  const cleaned = (slug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
  return cleaned || "blog";
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(date?: string | Date): string {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ── Auth Middleware ─────────────────────────────────── */

function authenticateApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = process.env.BLOG_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: "Blog API is not configured. Set the BLOG_API_KEY environment variable.",
    });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Missing or invalid Authorization header. Use: Bearer <API_KEY>",
    });
    return;
  }

  const token = authHeader.replace("Bearer ", "");
  if (token !== apiKey) {
    res.status(403).json({ error: "Invalid API key." });
    return;
  }

  next();
}

/* ── POST /api/blog/articles — Create or upsert article ─────── */

blogApiRouter.post("/articles", authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validate required fields
    if (!body.title || !body.content) {
      res.status(400).json({
        error: "Missing required fields: title, content",
        required: ["title", "content"],
        optional: [
          "slug", "excerpt", "category", "readTime", "author", "authorRole",
          "featured", "image", "status", "source", "externalId",
          "metaTitle", "metaDescription", "tags", "publishedAt",
        ],
      });
      return;
    }

    const slug = body.slug || generateSlug(body.title);
    const excerpt =
      body.excerpt ||
      body.content
        .replace(/[#*_\[\]()]/g, "")
        .slice(0, 250)
        .trim() + "...";

    const articleData = {
      slug,
      title: body.title,
      excerpt,
      category: body.category || "Tax Strategy",
      readTime: body.readTime || estimateReadTime(body.content),
      author: body.author || "Christopher Craig",
      authorRole: body.authorRole || "Enrolled Agent",
      featured: body.featured ?? false,
      image: body.image || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
      content: body.content,
      status: (body.status as "draft" | "published" | "archived") || "published",
      source: body.source || "api",
      externalId: body.externalId || null,
      metaTitle: body.metaTitle || body.title,
      metaDescription: body.metaDescription || excerpt,
      tags: Array.isArray(body.tags) ? body.tags.join(",") : body.tags || null,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
    };

    // Upsert by slug (update if exists, create if not)
    const result = await upsertBlogArticleBySlug(articleData);

    // Notify owner of new article
    if (result.action === "created") {
      await notifyOwner({
        title: "New Blog Article Published via API",
        content: `Title: ${articleData.title}\nCategory: ${articleData.category}\nSource: ${articleData.source}\nSlug: /blog/${slug}`,
      }).catch(() => {});
    }

    res.status(result.action === "created" ? 201 : 200).json({
      success: true,
      action: result.action,
      article: {
        id: result.id,
        slug,
        title: articleData.title,
        status: articleData.status,
        url: `/blog/${slug}`,
      },
    });
  } catch (error: any) {
    console.error("[Blog API] Error creating article:", error);
    res.status(500).json({ error: "Failed to create article", details: error.message });
  }
});

/* ── GET /api/blog/articles — List published articles ─────── */

blogApiRouter.get("/articles", async (req: Request, res: Response) => {
  try {
    const includeAll = req.query.all === "true";
    let articles;

    if (includeAll) {
      // If requesting all (including drafts), require auth
      const apiKey = process.env.BLOG_API_KEY;
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      if (!apiKey || token !== apiKey) {
        const result = await getPublishedBlogArticles();
        articles = result.items;
      } else {
        articles = await getAllBlogArticles();
      }
    } else {
      const result = await getPublishedBlogArticles();
      articles = result.items;
    }

    res.json({
      success: true,
      count: articles.length,
      articles: articles.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        readTime: a.readTime,
        author: a.author,
        authorRole: a.authorRole,
        featured: a.featured,
        image: a.image,
        status: a.status,
        source: a.source,
        tags: a.tags,
        publishedAt: a.publishedAt,
        url: `/blog/${a.slug}`,
      })),
    });
  } catch (error: any) {
    console.error("[Blog API] Error listing articles:", error);
    res.status(500).json({ error: "Failed to list articles", details: error.message });
  }
});

/* ── GET /api/blog/articles/:slug — Get single article ─────── */

blogApiRouter.get("/articles/:slug", async (req: Request, res: Response) => {
  try {
    const article = await getBlogArticleBySlug(req.params.slug);
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    res.json({ success: true, article });
  } catch (error: any) {
    console.error("[Blog API] Error getting article:", error);
    res.status(500).json({ error: "Failed to get article", details: error.message });
  }
});

/* ── PUT /api/blog/articles/:slug — Update article ─────── */

blogApiRouter.put("/articles/:slug", authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const article = await getBlogArticleBySlug(req.params.slug);
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    const body = req.body;
    const updateData: Record<string, any> = {};

    const allowedFields = [
      "title", "excerpt", "category", "readTime", "author", "authorRole",
      "featured", "image", "content", "status", "source", "externalId",
      "metaTitle", "metaDescription", "tags",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "tags" && Array.isArray(body[field])) {
          updateData[field] = body[field].join(",");
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (body.publishedAt) {
      updateData.publishedAt = new Date(body.publishedAt);
    }

    // Recalculate read time if content changed
    if (body.content && !body.readTime) {
      updateData.readTime = estimateReadTime(body.content);
    }

    await updateBlogArticle(article.id, updateData);

    res.json({
      success: true,
      action: "updated",
      article: {
        id: article.id,
        slug: article.slug,
        title: updateData.title || article.title,
        url: `/blog/${article.slug}`,
      },
    });
  } catch (error: any) {
    console.error("[Blog API] Error updating article:", error);
    res.status(500).json({ error: "Failed to update article", details: error.message });
  }
});

/* ── DELETE /api/blog/articles/:slug — Delete article ─────── */

blogApiRouter.delete("/articles/:slug", authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const article = await getBlogArticleBySlug(req.params.slug);
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    await deleteBlogArticle(article.id);

    res.json({
      success: true,
      action: "deleted",
      article: { id: article.id, slug: article.slug },
    });
  } catch (error: any) {
    console.error("[Blog API] Error deleting article:", error);
    res.status(500).json({ error: "Failed to delete article", details: error.message });
  }
});

/* ── POST /api/blog/upload-image — Upload image to CDN ─────── */

import express from "express";

blogApiRouter.post(
  "/upload-image",
  authenticateApiKey,
  express.raw({ type: "image/*", limit: "10mb" }),
  async (req: Request, res: Response) => {
    try {
      const contentType = req.headers["content-type"] || "";
      if (!contentType.startsWith("image/")) {
        res.status(400).json({ error: "Content-Type must be image/* (send raw image bytes)" });
        return;
      }

      const imageData = req.body as Buffer;
      if (!imageData || imageData.length === 0) {
        res.status(400).json({ error: "Empty image body" });
        return;
      }

      const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") || "png";
      const hash = crypto.createHash("md5").update(imageData).digest("hex").slice(0, 12);
      // The slug reaches us from the query string and ends up in a file name,
      // so restrict it to characters that cannot traverse a directory. Without
      // this, path.join() below resolves "../" segments and writes outside the
      // target folder.
      const slug = sanitizeSlugForFileName(req.query.slug as string | undefined);
      const fileName = `${slug}_${hash}.${ext}`;

      // Production: upload to S3-compatible object storage (R2/S3)
      if (isStorageConfigured()) {
        const result = await storagePut(`blog/${fileName}`, imageData, contentType);
        res.json({ success: true, url: result.url, key: result.key });
        return;
      }

      // Local fallback: save to client/public/blog-images/
      const publicDir = path.resolve(import.meta.dirname, "../client/public/blog-images");
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      const filePath = path.join(publicDir, fileName);
      // Defence in depth: refuse anything that still resolves outside publicDir.
      if (path.relative(publicDir, filePath).startsWith("..")) {
        res.status(400).json({ error: "Invalid slug" });
        return;
      }
      fs.writeFileSync(filePath, imageData);
      const localUrl = `/blog-images/${fileName}`;
      console.log(`[Blog API] Saved image locally: ${filePath}`);
      res.json({ success: true, url: localUrl, key: `blog/${fileName}` });
    } catch (err: any) {
      console.error("[Blog API] Image upload error:", err);
      res.status(500).json({ error: "Upload failed", details: err.message });
    }
  }
);

export { blogApiRouter, sanitizeSlugForFileName };
