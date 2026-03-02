
import { createApp } from "../server/_core/app";
import { getDb } from "../server/db";
import { migrate } from "drizzle-orm/libsql/migrator";
import { seedDefaultAdmin } from "../server/seedAdmin";
import { seedMigration } from "../server/seedMigration";
import path from "path";

// Vercel specific database handling
if (process.env.VERCEL) {
  // If no DB URL set, or if it points to a local file in root (which is read-only), use /tmp
  // This enables "Demo Mode" where the app works but data resets on cold starts
  if (!process.env.DATABASE_URL || (!process.env.DATABASE_URL.includes("libsql://") && !process.env.DATABASE_URL.includes("turso.io"))) {
    console.log("[Vercel] Using ephemeral /tmp/sqlite.db for demo mode");
    process.env.DATABASE_URL = "file:/tmp/sqlite.db";
  }
}

// Initialize the app without static serving (Vercel handles static files)
// We export the express app as the default export for Vercel
const { app } = await createApp({ skipStatic: true });

// Attempt to initialize database (run migrations and seeds)
// This is necessary for serverless environments where the DB might be fresh
try {
  const db = await getDb();
  if (db) {
    // Only run migrations/seeds if we are using a local file database (Demo Mode)
    // If using Turso/LibSQL remote, we assume it's already migrated/seeded to avoid slowing down startup
    const isLocalDb = process.env.DATABASE_URL?.includes("file:") || process.env.DATABASE_URL?.includes("sqlite.db");
    
    if (isLocalDb) {
      console.log("[Vercel] Running database migrations for local/demo DB...");
      // Use the included drizzle folder. On Vercel, included files are in the task root.
      const migrationsFolder = path.join(process.cwd(), "drizzle");
      await migrate(db, { migrationsFolder });
      
      console.log("[Vercel] Seeding initial data...");
      await seedDefaultAdmin();
      await seedMigration();
      console.log("[Vercel] Database initialization complete.");
    }
  }
} catch (error) {
  console.error("[Vercel] Database initialization failed:", error);
}

export default app;
