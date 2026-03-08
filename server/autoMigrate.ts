/**
 * Auto-Migration: Ensures the SQLite database schema matches the Drizzle schema.
 *
 * This script runs at server startup and adds any columns that exist in the
 * Drizzle schema but are missing from the actual SQLite tables.
 *
 * Currently handles:
 * - invoices.creditNoteDisposition (added in schema but missing from DB)
 *
 * This is a lightweight alternative to full Drizzle Kit migrations,
 * suitable for adding nullable columns that don't require data backfill.
 */

import { createClient } from "@libsql/client";

interface ColumnMigration {
  table: string;
  column: string;
  type: string;
  defaultValue?: string;
}

/**
 * List of columns that should exist but may be missing from the database.
 * Add new entries here when the Drizzle schema gains new nullable columns
 * that haven't been applied via drizzle-kit migrate.
 */
const REQUIRED_COLUMNS: ColumnMigration[] = [
  {
    table: "invoices",
    column: "creditNoteDisposition",
    type: "TEXT",
    // No default — nullable column
  },
];

export async function runAutoMigrations(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("[AutoMigrate] DATABASE_URL not set, skipping migrations");
    return;
  }

  const url = dbUrl.includes("://") ? dbUrl : `file:${dbUrl}`;

  let client: ReturnType<typeof createClient>;
  try {
    client = createClient({ url });
  } catch (err) {
    console.warn("[AutoMigrate] Failed to connect to database:", err);
    return;
  }

  for (const migration of REQUIRED_COLUMNS) {
    try {
      // Check if column already exists
      const tableInfo = await client.execute(`PRAGMA table_info("${migration.table}")`);
      const columnExists = tableInfo.rows.some(
        (row: any) => row.name === migration.column || row[1] === migration.column
      );

      if (!columnExists) {
        const defaultClause = migration.defaultValue != null
          ? ` DEFAULT ${migration.defaultValue}`
          : "";
        const sql = `ALTER TABLE "${migration.table}" ADD COLUMN "${migration.column}" ${migration.type}${defaultClause}`;
        await client.execute(sql);
        console.log(`[AutoMigrate] Added column: ${migration.table}.${migration.column}`);
      }
    } catch (err: any) {
      // "duplicate column name" means it already exists — safe to ignore
      if (err?.message?.includes("duplicate column")) {
        // Column already exists, no action needed
      } else {
        console.error(
          `[AutoMigrate] Failed to add ${migration.table}.${migration.column}:`,
          err?.message || err
        );
      }
    }
  }

  console.log("[AutoMigrate] Schema check complete");
}
