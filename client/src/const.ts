export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Sign-in entry point.
 *
 * The Google authorization URL is built server-side by GET /api/oauth/login
 * rather than here, because the flow needs an unpredictable per-request `state`
 * held in an httpOnly cookie to bind the callback to this browser. Script
 * cannot set an httpOnly cookie, so a URL assembled in the client could never
 * provide that binding — it previously used state = btoa(redirectUri), which is
 * identical for every visitor and therefore no protection at all.
 *
 * A side effect worth knowing: the client no longer needs the Google client ID,
 * so VITE_GOOGLE_CLIENT_ID is no longer a build-time requirement.
 */
export const getLoginUrl = () => "/api/oauth/login";
