import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import crypto from "crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import {
  getOAuthStateCookieOptions,
  getSessionCookieOptions,
  isSecureRequest,
} from "./cookies";
import { ENV } from "./env";
import { exchangeGoogleCode } from "./googleAuth";
import { sdk } from "./sdk";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const STATE_COOKIE = "oauth_state";
const STATE_TTL_MS = 10 * 60 * 1000;

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function getCookie(req: Request, name: string): string | undefined {
  if (!req.headers.cookie) return undefined;
  return parseCookieHeader(req.headers.cookie)[name];
}

/**
 * The origin this request arrived on, honouring the proxy headers Railway sets.
 * Both the login redirect and the callback derive `redirect_uri` this way, so
 * the value Google sees at authorization time matches the one presented at
 * token exchange.
 */
function getRedirectUri(req: Request): string {
  const forwardedHost = req.headers["x-forwarded-host"];
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : (forwardedHost ?? req.headers.host);
  const protocol = isSecureRequest(req) ? "https" : "http";
  return `${protocol}://${host}/api/oauth/callback`;
}

/** Constant-time comparison so a mismatched state cannot be probed byte by byte. */
function safeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function registerOAuthRoutes(app: Express) {
  /**
   * Starts the Google sign-in flow.
   *
   * The flow is begun server-side specifically so `state` can be an
   * unpredictable per-flow nonce stored in an httpOnly cookie — script cannot
   * set an httpOnly cookie, so a client-built URL could never bind the callback
   * to the browser that started it. Without that binding an attacker can obtain
   * a valid `code` for their own Google account and walk a victim into
   * /api/oauth/callback with it, silently signing the victim into the
   * attacker's account (OAuth login CSRF).
   */
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    if (!ENV.googleClientId) {
      res.status(503).json({
        error:
          "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      });
      return;
    }

    const state = crypto.randomBytes(32).toString("base64url");
    const redirectUri = getRedirectUri(req);

    res.cookie(STATE_COOKIE, state, {
      ...getOAuthStateCookieOptions(req),
      maxAge: STATE_TTL_MS,
    });

    const url = new URL(GOOGLE_AUTH_ENDPOINT);
    url.searchParams.set("client_id", ENV.googleClientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("access_type", "online");
    url.searchParams.set("prompt", "select_account");

    res.redirect(302, url.toString());
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // Bind the callback to the browser that started the flow. A `state` that
    // does not match this browser's cookie means the code was minted for some
    // other session — refuse rather than mint a session from it.
    const expectedState = getCookie(req, STATE_COOKIE);
    if (!expectedState || !safeEquals(state, expectedState)) {
      res.clearCookie(STATE_COOKIE, getOAuthStateCookieOptions(req));
      res.status(400).json({ error: "invalid state" });
      return;
    }
    res.clearCookie(STATE_COOKIE, getOAuthStateCookieOptions(req));

    try {
      const profile = await exchangeGoogleCode(code, getRedirectUri(req));

      const email = profile.email?.toLowerCase() ?? null;
      const openId = `google:${profile.sub}`;
      // ADMIN_EMAILS is matched only against a Google-VERIFIED address. Google
      // issues id_tokens with email_verified:false for accounts on unverified
      // custom Workspace domains, so anyone able to stand up a Workspace trial
      // for a domain could otherwise mint an address matching ADMIN_EMAILS and
      // be handed the admin role.
      const isAdmin =
        email !== null &&
        profile.emailVerified &&
        ENV.adminEmails.includes(email);

      await db.upsertUser({
        openId,
        name: profile.name,
        email: profile.email,
        loginMethod: "google",
        lastSignedIn: new Date(),
        // Only set role for admins so manual role changes are never clobbered.
        ...(isAdmin ? { role: "admin" as const } : {}),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: profile.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
