import { createRemoteJWKSet, jwtVerify } from "jose";
import { ENV } from "./env";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

// Google's public keys for verifying id_tokens. Cached across requests.
const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export type GoogleUser = {
  sub: string;
  email: string | null;
  name: string | null;
  emailVerified: boolean;
};

/**
 * Exchange an authorization code for tokens, then verify the returned id_token
 * against Google's JWKS. Returns the authenticated user's profile claims.
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<GoogleUser> {
  if (!ENV.googleClientId || !ENV.googleClientSecret) {
    throw new Error(
      "Google OAuth is not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
    );
  }

  const body = new URLSearchParams({
    code,
    client_id: ENV.googleClientId,
    client_secret: ENV.googleClientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenResponse.ok) {
    const detail = await tokenResponse.text().catch(() => "");
    throw new Error(
      `Google token exchange failed (${tokenResponse.status}): ${detail}`
    );
  }

  const tokens = (await tokenResponse.json()) as { id_token?: string };
  if (!tokens.id_token) {
    throw new Error("Google token response did not include an id_token");
  }

  const { payload } = await jwtVerify(tokens.id_token, googleJwks, {
    issuer: GOOGLE_ISSUERS,
    audience: ENV.googleClientId,
  });

  const sub = typeof payload.sub === "string" ? payload.sub : "";
  if (!sub) {
    throw new Error("Google id_token is missing the subject (sub) claim");
  }

  return {
    sub,
    email: typeof payload.email === "string" ? payload.email : null,
    name: typeof payload.name === "string" ? payload.name : null,
    emailVerified: payload.email_verified === true,
  };
}
