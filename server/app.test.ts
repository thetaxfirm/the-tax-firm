/**
 * Smoke tests for the host-agnostic Express app returned by createApp().
 *
 * This is the exact app the Railway container entrypoint
 * (server/_core/index.ts) listens with, so these assertions cover the routes
 * production serves. They deliberately exercise only paths that short-circuit
 * before any database or third-party call.
 */
import type { Server } from "http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  process.env.BLOG_API_KEY ||= "test-blog-api-key";
  process.env.GOOGLE_CLIENT_ID ||= "test-client-id.apps.googleusercontent.com";

  // Imported after the environment is set: server/_core/env.ts snapshots
  // process.env at module load, so a static import would capture an unset
  // GOOGLE_CLIENT_ID and the login route would answer 503.
  const { createApp } = await import("./_core/app");

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

  it("starts the flow with an unpredictable state bound to an httpOnly cookie", async () => {
    const res = await fetch(`${baseUrl}/api/oauth/login`, { redirect: "manual" });

    expect(res.status).toBe(302);
    const location = new URL(res.headers.get("location") ?? "");
    expect(location.origin + location.pathname).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );

    const state = location.searchParams.get("state") ?? "";
    // Not derived from anything an attacker can precompute.
    expect(state.length).toBeGreaterThanOrEqual(32);

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`oauth_state=${state}`);
    expect(setCookie.toLowerCase()).toContain("httponly");
    expect(setCookie.toLowerCase()).toContain("samesite=lax");
  });

  it("issues a different state on every login attempt", async () => {
    const states = await Promise.all(
      [0, 1, 2].map(async () => {
        const res = await fetch(`${baseUrl}/api/oauth/login`, {
          redirect: "manual",
        });
        return new URL(res.headers.get("location") ?? "").searchParams.get(
          "state"
        );
      })
    );
    expect(new Set(states).size).toBe(3);
  });

  it("rejects a callback whose state is not bound to this browser", async () => {
    // A well-formed state that this browser never received: exactly the
    // login-CSRF an attacker would replay after harvesting their own code.
    const res = await fetch(
      `${baseUrl}/api/oauth/callback?code=attacker-code&state=Zm9yZ2Vk`
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("invalid state");
  });

  it("rejects a callback carrying a state cookie that does not match", async () => {
    const res = await fetch(
      `${baseUrl}/api/oauth/callback?code=attacker-code&state=aaaa`,
      { headers: { cookie: "oauth_state=bbbb" } }
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

  it("does not serve static assets — the entrypoint adds that", async () => {
    const res = await fetch(`${baseUrl}/index.html`);
    expect(res.status).toBe(404);
  });
});
