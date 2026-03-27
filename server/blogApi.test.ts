import { describe, it, expect, afterAll } from "vitest";

const BASE = "http://localhost:3000/api/blog";
const API_KEY = process.env.BLOG_API_KEY!;
const TEST_SLUG = `vitest-blog-api-${Date.now()}`;

// Track created articles for cleanup
const createdSlugs: string[] = [];

async function deleteArticle(slug: string) {
  await fetch(`${BASE}/articles/${slug}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
}

afterAll(async () => {
  for (const slug of createdSlugs) {
    await deleteArticle(slug).catch(() => {});
  }
});

describe("Blog API", () => {
  describe("Authentication", () => {
    it("rejects POST without Authorization header", async () => {
      const res = await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Test", content: "Content" }),
      });
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toContain("Missing or invalid Authorization");
    });

    it("rejects POST with invalid API key", async () => {
      const res = await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer wrong-key-12345",
        },
        body: JSON.stringify({ title: "Test", content: "Content" }),
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toContain("Invalid API key");
    });

    it("accepts valid API key", async () => {
      const slug = `${TEST_SLUG}-auth-test`;
      createdSlugs.push(slug);
      const res = await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          title: "Auth Test Article",
          slug,
          content: "This article tests authentication.",
        }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });

  describe("POST /api/blog/articles", () => {
    it("requires title and content", async () => {
      const res = await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ title: "Only Title" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Missing required fields");
    });

    it("creates article with minimal fields", async () => {
      const slug = `${TEST_SLUG}-minimal`;
      createdSlugs.push(slug);
      const res = await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          title: "Minimal Test Article",
          slug,
          content: "This is a minimal test article with only required fields.",
        }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.action).toBe("created");
      expect(body.article.slug).toBe(slug);
      expect(body.article.url).toBe(`/blog/${slug}`);
    });

    it("creates article with all fields", async () => {
      const slug = `${TEST_SLUG}-full`;
      createdSlugs.push(slug);
      const res = await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          title: "Full Test Article",
          slug,
          excerpt: "Custom excerpt for the article.",
          category: "Tax Planning",
          readTime: "8 min read",
          author: "Test Author",
          authorRole: "Tax Advisor",
          featured: true,
          image: "https://example.com/test-image.jpg",
          content: "# Full Article\n\nThis has all fields populated.",
          status: "published",
          source: "tely.ai",
          externalId: "tely-12345",
          metaTitle: "Full Test Article | The Tax Firm",
          metaDescription: "A comprehensive test article.",
          tags: ["tax", "planning", "test"],
        }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.article.slug).toBe(slug);
    });

    it("upserts (updates) on duplicate slug", async () => {
      const slug = `${TEST_SLUG}-upsert`;
      createdSlugs.push(slug);

      // Create first
      await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          title: "Original Title",
          slug,
          content: "Original content.",
        }),
      });

      // Upsert with same slug
      const res = await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          title: "Updated Title",
          slug,
          content: "Updated content.",
        }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.action).toBe("updated");
    });

    it("auto-generates slug from title", async () => {
      const res = await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          title: `Auto Slug Test ${Date.now()}`,
          content: "Content for auto slug test.",
        }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.article.slug).toMatch(/^auto-slug-test-/);
      createdSlugs.push(body.article.slug);
    });
  });

  describe("GET /api/blog/articles", () => {
    it("returns published articles list", async () => {
      const res = await fetch(`${BASE}/articles`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(typeof body.count).toBe("number");
      expect(Array.isArray(body.articles)).toBe(true);
    });
  });

  describe("GET /api/blog/articles/:slug", () => {
    it("returns 404 for non-existent article", async () => {
      const res = await fetch(`${BASE}/articles/definitely-does-not-exist-xyz`);
      expect(res.status).toBe(404);
    });

    it("returns article by slug", async () => {
      // First create an article
      const slug = `${TEST_SLUG}-get-test`;
      createdSlugs.push(slug);
      await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          title: "Get Test Article",
          slug,
          content: "Content for get test.",
          category: "Tax Strategy",
        }),
      });

      // Now fetch it
      const res = await fetch(`${BASE}/articles/${slug}`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.article.slug).toBe(slug);
      expect(body.article.title).toBe("Get Test Article");
      expect(body.article.content).toBe("Content for get test.");
    });
  });

  describe("PUT /api/blog/articles/:slug", () => {
    it("requires auth for updates", async () => {
      const res = await fetch(`${BASE}/articles/any-slug`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Updated" }),
      });
      expect(res.status).toBe(401);
    });

    it("returns 404 for non-existent article", async () => {
      const res = await fetch(`${BASE}/articles/definitely-does-not-exist-xyz`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ title: "Updated" }),
      });
      expect(res.status).toBe(404);
    });

    it("updates article fields", async () => {
      // Create article first
      const slug = `${TEST_SLUG}-put-test`;
      createdSlugs.push(slug);
      await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          title: "Original Put Title",
          slug,
          content: "Original content.",
        }),
      });

      // Update it
      const res = await fetch(`${BASE}/articles/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          title: "Updated Put Title",
          status: "draft",
        }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.action).toBe("updated");

      // Verify the update
      const getRes = await fetch(`${BASE}/articles/${slug}`);
      const getBody = await getRes.json();
      expect(getBody.article.title).toBe("Updated Put Title");
    });
  });

  describe("DELETE /api/blog/articles/:slug", () => {
    it("requires auth for deletion", async () => {
      const res = await fetch(`${BASE}/articles/any-slug`, {
        method: "DELETE",
      });
      expect(res.status).toBe(401);
    });

    it("deletes article by slug", async () => {
      // Create article first
      const slug = `${TEST_SLUG}-delete-test`;
      await fetch(`${BASE}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          title: "Delete Test Article",
          slug,
          content: "Content to be deleted.",
        }),
      });

      // Delete it
      const res = await fetch(`${BASE}/articles/${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.action).toBe("deleted");

      // Verify it's gone
      const getRes = await fetch(`${BASE}/articles/${slug}`);
      expect(getRes.status).toBe(404);
    });
  });
});
