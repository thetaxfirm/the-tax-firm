/**
 * Smoke tests for the host-agnostic Express app returned by createApp().
 *
 * This is the exact app the Vercel serverless entry (api/index.ts) exports and
 * the container entrypoint (server/_core/index.ts) listens with, so these
 * assertions cover routing for both deploy targets. They deliberately exercise
 * only paths that short-circuit before any database or third-party call.
 */
import type { Server } from "http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./_core/app";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  process.env.BLOG_API_KEY ||= "test-blog-api-key";

  const app = createApp();
  server = app.listen(0);
  await new Promise<void>(resolve => server.once("listening", () => resolve()));

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected the test server to bind a TCP port");
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

describe("createApp routing", () => {
  it("mounts the blog API under /api/blog", async () => {
    const res = await fetch(`${baseUrl}/api/blog/articles`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Test", content: "Content" }),
    });

    // 401 (not 404) proves the router matched and its auth guard ran.
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toContain("Missing or invalid Authorization");
  });

  it("mounts the OAuth callback under /api/oauth/callback", async () => {
    const res = await fetch(`${baseUrl}/api/oauth/callback`);

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("code and state are required");
  });

  it("rejects an OAuth callback whose state is not a valid redirect URI", async () => {
    const state = Buffer.from("not-a-url").toString("base64");
    const res = await fetch(
      `${baseUrl}/api/oauth/callback?code=abc&state=${encodeURIComponent(state)}`
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("invalid state");
  });

  it("mounts the tRPC handler under /api/trpc", async () => {
    const res = await fetch(`${baseUrl}/api/trpc/does.notExist`);

    // tRPC answers unknown procedures itself, in its superjson error envelope;
    // a 404 from Express would just be HTML.
    const body = (await res.json()) as {
      error?: { json?: { message?: string; data?: { code?: string } } };
    };
    expect(body.error?.json?.message).toContain("does.notExist");
    expect(body.error?.json?.data?.code).toBe("NOT_FOUND");
  });

  it("does not serve static assets — that is the host's job", async () => {
    const res = await fetch(`${baseUrl}/index.html`);
    expect(res.status).toBe(404);
  });
});
