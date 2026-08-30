/**
 * `SameSite=None` is only legal alongside `Secure`; browsers silently drop a
 * cookie that sets None without it. Emitting that pair is not a cosmetic slip —
 * the session cookie is never stored, every request comes back
 * unauthenticated, and the client bounces to login forever.
 *
 * A TLS-terminating proxy that forwards to the origin over plain HTTP without
 * setting x-forwarded-proto (Cloudflare's "Flexible" SSL mode) puts us on the
 * insecure branch on a site users reach over HTTPS, so this is reachable in
 * production, not just locally.
 */
import { describe, expect, it } from "vitest";
import type { Request } from "express";
import { getOAuthStateCookieOptions, getSessionCookieOptions } from "./_core/cookies";

const req = (headers: Record<string, string> = {}, protocol = "http") =>
  ({ headers, protocol }) as unknown as Request;

describe("session cookie options", () => {
  it("never pairs SameSite=None with an insecure cookie", () => {
    for (const r of [
      req(),
      req({ "x-forwarded-proto": "http" }),
      req({ "x-forwarded-proto": "http,https" }),
    ]) {
      const opts = getSessionCookieOptions(r);
      if (opts.sameSite === "none") expect(opts.secure).toBe(true);
      expect(opts.secure === false && opts.sameSite === "none").toBe(false);
    }
  });

  it("falls back to Lax when the request is not secure", () => {
    const opts = getSessionCookieOptions(req());
    expect(opts.secure).toBe(false);
    expect(opts.sameSite).toBe("lax");
  });

  it("keeps SameSite=None over a direct https request", () => {
    const opts = getSessionCookieOptions(req({}, "https"));
    expect(opts.secure).toBe(true);
    expect(opts.sameSite).toBe("none");
  });

  it("honours x-forwarded-proto from the platform edge", () => {
    const opts = getSessionCookieOptions(req({ "x-forwarded-proto": "https" }));
    expect(opts.secure).toBe(true);
    expect(opts.sameSite).toBe("none");
  });

  it("always marks both cookies httpOnly", () => {
    expect(getSessionCookieOptions(req()).httpOnly).toBe(true);
    expect(getOAuthStateCookieOptions(req()).httpOnly).toBe(true);
  });

  it("scopes the OAuth state cookie to the OAuth routes, SameSite=Lax", () => {
    const opts = getOAuthStateCookieOptions(req({ "x-forwarded-proto": "https" }));
    expect(opts.path).toBe("/api/oauth");
    expect(opts.sameSite).toBe("lax");
    expect(opts.secure).toBe(true);
  });
});
