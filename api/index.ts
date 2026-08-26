/**
 * Vercel serverless entrypoint.
 *
 * Vercel discovers functions as source files inside this `api/` directory — it
 * does not run `pnpm start`, so the long-running entrypoint in
 * `server/_core/index.ts` (which binds a port and serves static files) is not
 * used here. Instead we export the host-agnostic Express app: `@vercel/node`
 * accepts an Express instance as the default export and invokes it as the
 * request handler.
 *
 * `vercel.json` rewrites every non-static request to `/api`, and Vercel
 * preserves the original request path on `req.url`, so the app's own routers
 * (`/api/trpc`, `/api/blog`, `/api/oauth/callback`, `/sitemap.xml`) match
 * exactly as they do on Railway. Static assets are served from the build
 * output directory (`dist/public`) by Vercel's CDN before rewrites apply.
 */
import { createApp } from "../server/_core/app";

export default createApp();
