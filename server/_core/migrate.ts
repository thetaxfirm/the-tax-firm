import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

/**
 * Apply pending database migrations on startup.
 *
 * Uses drizzle's mysql2 migrator, which records applied migrations in a
 * `__drizzle_migrations` table and skips ones already run — so this is
 * idempotent and safe to invoke on every boot. Migration SQL lives in the
 * ./drizzle folder (shipped in the image).
 *
 * Failures are logged but do not crash the process: static pages should still
 * serve even if the database is temporarily unreachable, and Railway will
 * restart the service rather than crash-loop on a transient DB hiccup.
 */
export async function runMigrations(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn("[Migrate] DATABASE_URL not set — skipping migrations");
    return;
  }

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("[Migrate] Database schema is up to date");
  } catch (error) {
    console.error("[Migrate] Failed to apply migrations:", error);
  } finally {
    if (connection) await connection.end().catch(() => {});
  }
}
