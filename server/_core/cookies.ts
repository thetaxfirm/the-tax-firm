import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

export function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  const secure = isSecureRequest(req);

  return {
    httpOnly: true,
    path: "/",
    // SameSite=None is only legal alongside Secure — every modern browser
    // silently DROPS a `SameSite=None` cookie that is not also `Secure`. That
    // combination arises whenever the request does not look secure to us: plain
    // HTTP locally, or a CDN/proxy that terminates TLS and forwards to the
    // origin over HTTP without setting x-forwarded-proto (Cloudflare's
    // "Flexible" SSL mode does exactly this). The session cookie would then
    // never be stored, every request would come back unauthenticated, and the
    // client would bounce to login forever. Fall back to Lax, which is valid
    // without Secure and still survives the OAuth callback's top-level GET.
    sameSite: secure ? "none" : "lax",
    secure,
  };
}

/**
 * Cookie carrying the per-flow OAuth nonce.
 *
 * SameSite=Lax rather than None: the cookie has to survive Google's top-level
 * GET redirect back to /api/oauth/callback (Lax does allow that) while not
 * riding along on cross-site subrequests. Short-lived, and scoped to the OAuth
 * routes so it is never sent anywhere else.
 */
export function getOAuthStateCookieOptions(
  req: Request
): Pick<CookieOptions, "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/api/oauth",
    sameSite: "lax",
    secure: isSecureRequest(req),
  };
}
