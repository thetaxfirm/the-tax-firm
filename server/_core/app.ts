import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { blogApiRouter } from "../blogApi";
import { generateSitemapXml } from "./sitemap";

/**
 * Build the Express application with all API routes and middleware, but without
 * binding a port or serving static assets. This keeps the app host-agnostic:
 *  - the local/container entrypoint (index.ts) wraps it with Vite (dev) or
 *    static file serving (prod) and calls listen();
 *  - a serverless entrypoint can export the returned app directly as a handler.
 */
export function createApp(): Express {
  const app = express();

  // Larger body limit to accommodate base64 file uploads.
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Dynamic sitemap (always fresh from DB, falls back to static slugs).
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const xml = await generateSitemapXml();
      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      console.error("[sitemap] Error:", err);
      res.status(500).send("Sitemap generation failed");
    }
  });

  // OAuth callback (Google sign-in) under /api/oauth/callback.
  registerOAuthRoutes(app);

  // Blog REST API for external publishing (Tely.ai, etc.).
  app.use("/api/blog", blogApiRouter);

  // tRPC API.
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}
