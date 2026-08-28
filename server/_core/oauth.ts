import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { exchangeGoogleCode } from "./googleAuth";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/** Decode the redirect URI the frontend packed into `state` (base64). */
function decodeRedirectUri(state: string): string | null {
  try {
    const decoded = Buffer.from(state, "base64").toString("utf-8");
    return decoded.startsWith("http") ? decoded : null;
  } catch {
    return null;
  }
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    const redirectUri = decodeRedirectUri(state);
    if (!redirectUri) {
      res.status(400).json({ error: "invalid state" });
      return;
    }

    try {
      const profile = await exchangeGoogleCode(code, redirectUri);

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
