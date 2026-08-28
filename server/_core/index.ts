import "dotenv/config";
import { createServer } from "http";
import net from "net";
import { createApp } from "./app";
import { runMigrations } from "./migrate";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Apply any pending database migrations before serving traffic.
  await runMigrations();

  const app = createApp();
  const server = createServer(app);

  // development mode uses Vite, production mode serves the built static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // In production (Railway/containers) PORT is injected and the platform routes
  // to it exactly — bind directly on 0.0.0.0. Only fall back to port-scanning
  // for local dev where the preferred port may be taken.
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = process.env.PORT
    ? preferredPort
    : await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
