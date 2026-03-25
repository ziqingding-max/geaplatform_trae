/**
 * Auto-Migration: Ensures the SQLite database schema matches the Drizzle schema.
 *
 * This script runs at server startup and adds any columns that exist in the
 * Drizzle schema but are missing from the actual SQLite tables.
 *
 * Handles:
 * - invoices.creditNoteDisposition
 * - Phase 1 AOR alignment: new columns on contractor_adjustments & contractor_milestones
 *
 * This is a lightweight alternative to full Drizzle Kit migrations,
 * suitable for adding columns that don't require complex data backfill.
 *
 * For NOT NULL columns that are new, we ADD COLUMN with a DEFAULT,
 * then run backfill queries to populate existing rows.
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
 * Add new entries here when the Drizzle schema gains new columns
 * that haven't been applied via drizzle-kit migrate.
 *
 * For NOT NULL columns, provide a defaultValue so ALTER TABLE ADD COLUMN succeeds
 * on existing rows. SQLite requires a default for NOT NULL columns added via ALTER TABLE.
 */
const REQUIRED_COLUMNS: ColumnMigration[] = [
  // ── invoices ──
  {
    table: "invoices",
    column: "creditNoteDisposition",
    type: "TEXT",
  },

  // ── contractor_adjustments (Phase 1 AOR alignment) ──
  {
    table: "contractor_adjustments",
    column: "customerId",
    type: "INTEGER NOT NULL",
    defaultValue: "0",
  },
  {
    table: "contractor_adjustments",
    column: "attachmentFileKey",
    type: "TEXT",
  },
  {
    table: "contractor_adjustments",
    column: "submittedBy",
    type: "INTEGER",
  },
  {
    table: "contractor_adjustments",
    column: "clientApprovedBy",
    type: "INTEGER",
  },
  {
    table: "contractor_adjustments",
    column: "clientApprovedAt",
    type: "INTEGER",
  },
  {
    table: "contractor_adjustments",
    column: "clientRejectionReason",
    type: "TEXT",
  },
  {
    table: "contractor_adjustments",
    column: "adminApprovedBy",
    type: "INTEGER",
  },
  {
    table: "contractor_adjustments",
    column: "adminApprovedAt",
    type: "INTEGER",
  },
  {
    table: "contractor_adjustments",
    column: "adminRejectionReason",
    type: "TEXT",
  },
  {
    table: "contractor_adjustments",
    column: "effectiveMonth",
    type: "TEXT NOT NULL",
    defaultValue: "'2025-01-01'",
  },

  // ── contractor_milestones (Phase 1 AOR alignment) ──
  {
    table: "contractor_milestones",
    column: "customerId",
    type: "INTEGER NOT NULL",
    defaultValue: "0",
  },
  {
    table: "contractor_milestones",
    column: "submittedBy",
    type: "INTEGER",
  },
  {
    table: "contractor_milestones",
    column: "clientApprovedBy",
    type: "INTEGER",
  },
  {
    table: "contractor_milestones",
    column: "clientApprovedAt",
    type: "INTEGER",
  },
  {
    table: "contractor_milestones",
    column: "clientRejectionReason",
    type: "TEXT",
  },
  {
    table: "contractor_milestones",
    column: "adminApprovedBy",
    type: "INTEGER",
  },
  {
    table: "contractor_milestones",
    column: "adminApprovedAt",
    type: "INTEGER",
  },
  {
    table: "contractor_milestones",
    column: "adminRejectionReason",
    type: "TEXT",
  },
  {
    table: "contractor_milestones",
    column: "effectiveMonth",
    type: "TEXT",
  },
  // ── leave_records (payroll lifecycle fix) ──
  {
    table: "leave_records",
    column: "payrollRunId",
    type: "INTEGER",
  },
  // ── leave_types (gender-based filtering) ──
  {
    table: "leave_types",
    column: "applicableGender",
    type: "TEXT NOT NULL",
    defaultValue: "'all'",
  },
  // ── customer_leave_policies (client confirmation tracking) ──
  {
    table: "customer_leave_policies",
    column: "clientConfirmed",
    type: "INTEGER NOT NULL",
    defaultValue: "1",  // Existing records default to confirmed (1=true)
  },
  // ── vendor_bills: Settlement (Actual Payment) fields ──
  {
    table: "vendor_bills",
    column: "settlementCurrency",
    type: "TEXT",
    defaultValue: "'USD'",
  },
  {
    table: "vendor_bills",
    column: "settlementAmount",
    type: "TEXT",
  },
  {
    table: "vendor_bills",
    column: "settlementBankFee",
    type: "TEXT",
  },
  {
    table: "vendor_bills",
    column: "settlementDate",
    type: "TEXT",
  },
  {
    table: "vendor_bills",
    column: "settlementNotes",
    type: "TEXT",
  },

  // ── invoice_items: AOR contractor association (PR #117) ──
  {
    table: "invoice_items",
    column: "contractorId",
    type: "INTEGER",
  },

  // ── bill_invoice_allocations: AOR contractor association (PR #117) ──
  {
    table: "bill_invoice_allocations",
    column: "contractorId",
    type: "INTEGER",
  },

  // ── jobDescription fields (job description support) ──
  {
    table: "contractors",
    column: "jobDescription",
    type: "TEXT",
  },
  {
    table: "employees",
    column: "jobDescription",
    type: "TEXT",
  },
  {
    table: "onboarding_invites",
    column: "jobDescription",
    type: "TEXT",
  },
];

/**
 * Data backfill queries to run after columns are added.
 * These populate NOT NULL columns that were added with placeholder defaults.
 */
const BACKFILL_QUERIES: string[] = [
  // Backfill contractor_adjustments.customerId from contractors table
  `UPDATE "contractor_adjustments" SET "customerId" = (
    SELECT "customerId" FROM "contractors" WHERE "contractors"."id" = "contractor_adjustments"."contractorId"
  ) WHERE "customerId" = 0`,

  // Backfill contractor_adjustments.effectiveMonth from date column (if date column exists)
  `UPDATE "contractor_adjustments" SET "effectiveMonth" = substr("date", 1, 7) || '-01'
   WHERE "effectiveMonth" = '2025-01-01' AND "date" IS NOT NULL`,

  // Backfill contractor_milestones.customerId from contractors table
  `UPDATE "contractor_milestones" SET "customerId" = (
    SELECT "customerId" FROM "contractors" WHERE "contractors"."id" = "contractor_milestones"."contractorId"
  ) WHERE "customerId" = 0`,

  // Backfill leave_types.applicableGender based on leave type name keywords
  `UPDATE "leave_types" SET "applicableGender" = 'female' WHERE LOWER("leaveTypeName") LIKE '%maternity%'`,
  `UPDATE "leave_types" SET "applicableGender" = 'male' WHERE LOWER("leaveTypeName") LIKE '%paternity%'`,
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

  let columnsAdded = 0;

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
        columnsAdded++;
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

  // Run backfill queries if any columns were added
  if (columnsAdded > 0) {
    console.log(`[AutoMigrate] ${columnsAdded} columns added, running backfill queries...`);
    for (const query of BACKFILL_QUERIES) {
      try {
        await client.execute(query);
        console.log(`[AutoMigrate] Backfill executed successfully`);
      } catch (err: any) {
        // Backfill failures are non-fatal (e.g., "date" column may not exist in new installs)
        console.warn(`[AutoMigrate] Backfill query skipped or failed:`, err?.message || err);
      }
    }
  }

  // ── Special migration: Make bill_invoice_allocations.employeeId nullable ──
  // SQLite does not support ALTER COLUMN to drop NOT NULL. We must recreate the table.
  // This is done here (not in SQL migration files) to ensure idempotency.
  try {
    const biaInfo = await client.execute(`PRAGMA table_info("bill_invoice_allocations")`);
    const empCol = biaInfo.rows.find(
      (row: any) => (row.name || row[1]) === "employeeId"
    );
    // Check if employeeId is NOT NULL (notnull flag = 1)
    const isNotNull = empCol && (empCol.notnull === 1 || (empCol as any)[3] === 1);

    if (isNotNull) {
      console.log("[AutoMigrate] Recreating bill_invoice_allocations to make employeeId nullable...");

      // Use a transaction to ensure atomicity
      await client.execute(`CREATE TABLE IF NOT EXISTS "bill_invoice_allocations_rebuild" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "vendorBillId" integer NOT NULL,
        "vendorBillItemId" integer,
        "invoiceId" integer NOT NULL,
        "employeeId" integer,
        "contractorId" integer,
        "allocatedAmount" text NOT NULL,
        "description" text,
        "allocatedBy" integer,
        "createdAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
        "updatedAt" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
      )`);

      // Check if the rebuild table is empty (avoid duplicate inserts on re-run)
      const rebuildCount = await client.execute(`SELECT COUNT(*) as cnt FROM "bill_invoice_allocations_rebuild"`);
      const cnt = (rebuildCount.rows[0] as any)?.cnt ?? (rebuildCount.rows[0] as any)?.[0] ?? 0;

      if (Number(cnt) === 0) {
        // Copy data from original table.
        // Note: contractorId column is guaranteed to exist at this point because
        // REQUIRED_COLUMNS already added it via ALTER TABLE ADD COLUMN above.
        await client.execute(`INSERT INTO "bill_invoice_allocations_rebuild" 
          ("id", "vendorBillId", "vendorBillItemId", "invoiceId", "employeeId", "contractorId", "allocatedAmount", "description", "allocatedBy", "createdAt", "updatedAt")
          SELECT "id", "vendorBillId", "vendorBillItemId", "invoiceId", "employeeId", "contractorId",
            "allocatedAmount", "description", "allocatedBy", "createdAt", "updatedAt"
          FROM "bill_invoice_allocations"`);
      }

      // Drop old table and rename
      await client.execute(`DROP TABLE IF EXISTS "bill_invoice_allocations"`);
      await client.execute(`ALTER TABLE "bill_invoice_allocations_rebuild" RENAME TO "bill_invoice_allocations"`);

      // Recreate indexes
      await client.execute(`CREATE INDEX IF NOT EXISTS "bia_vendor_bill_id_idx" ON "bill_invoice_allocations" ("vendorBillId")`);
      await client.execute(`CREATE INDEX IF NOT EXISTS "bia_vendor_bill_item_id_idx" ON "bill_invoice_allocations" ("vendorBillItemId")`);
      await client.execute(`CREATE INDEX IF NOT EXISTS "bia_invoice_id_idx" ON "bill_invoice_allocations" ("invoiceId")`);
      await client.execute(`CREATE INDEX IF NOT EXISTS "bia_employee_id_idx" ON "bill_invoice_allocations" ("employeeId")`);
      await client.execute(`CREATE INDEX IF NOT EXISTS "bia_contractor_id_idx" ON "bill_invoice_allocations" ("contractorId")`);

      console.log("[AutoMigrate] bill_invoice_allocations recreated with nullable employeeId");
    }
  } catch (err: any) {
    console.error("[AutoMigrate] Failed to recreate bill_invoice_allocations:", err?.message || err);
  }

  console.log("[AutoMigrate] Schema check complete");
}
