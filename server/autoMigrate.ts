/**
 * Auto-Migration: Ensures the PostgreSQL database schema matches the Drizzle schema.
 *
 * This script runs at server startup and adds any columns that exist in the
 * Drizzle schema but are missing from the actual PostgreSQL tables.
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

import postgres from "postgres";

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
 * PostgreSQL types are used here (TEXT, INTEGER, BOOLEAN, TIMESTAMPTZ, etc.)
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
    type: "TIMESTAMPTZ",
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
    type: "TIMESTAMPTZ",
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
    type: "TIMESTAMPTZ",
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
    type: "TIMESTAMPTZ",
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
    type: "BOOLEAN NOT NULL",
    defaultValue: "true",
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

  // ── Recurring adjustment support (EOR adjustments) ──
  {
    table: "adjustments",
    column: "recurrenceType",
    type: "TEXT NOT NULL",
    defaultValue: "'one_time'",
  },
  {
    table: "adjustments",
    column: "recurrenceEndMonth",
    type: "TEXT",
  },
  {
    table: "adjustments",
    column: "parentAdjustmentId",
    type: "INTEGER",
  },
  {
    table: "adjustments",
    column: "isRecurringTemplate",
    type: "BOOLEAN NOT NULL",
    defaultValue: "false",
  },

  // ── Recurring adjustment support (AOR contractor_adjustments) ──
  {
    table: "contractor_adjustments",
    column: "recurrenceType",
    type: "TEXT NOT NULL",
    defaultValue: "'one_time'",
  },
  {
    table: "contractor_adjustments",
    column: "recurrenceEndMonth",
    type: "TEXT",
  },
  {
    table: "contractor_adjustments",
    column: "parentAdjustmentId",
    type: "INTEGER",
  },
  {
    table: "contractor_adjustments",
    column: "isRecurringTemplate",
    type: "BOOLEAN NOT NULL",
    defaultValue: "false",
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
  `UPDATE "contractor_adjustments" SET "effectiveMonth" = substring("date" from 1 for 7) || '-01'
   WHERE "effectiveMonth" = '2025-01-01' AND "date" IS NOT NULL`,

  // Backfill contractor_milestones.customerId from contractors table
  `UPDATE "contractor_milestones" SET "customerId" = (
    SELECT "customerId" FROM "contractors" WHERE "contractors"."id" = "contractor_milestones"."contractorId"
  ) WHERE "customerId" = 0`,

  // Backfill leave_types.applicableGender based on leave type name keywords
  `UPDATE "leave_types" SET "applicableGender" = 'female' WHERE LOWER("leaveTypeName") LIKE '%maternity%'`,
  `UPDATE "leave_types" SET "applicableGender" = 'male' WHERE LOWER("leaveTypeName") LIKE '%paternity%'`,
];

/**
 * Check if a column exists in a PostgreSQL table using information_schema.
 */
async function columnExists(
  sql: postgres.Sql,
  tableName: string,
  columnName: string
): Promise<boolean> {
  const result = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
      AND column_name = ${columnName}
  `;
  return result.length > 0;
}

export async function runAutoMigrations(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("[AutoMigrate] DATABASE_URL not set, skipping migrations");
    return;
  }

  let sql: postgres.Sql;
  try {
    sql = postgres(dbUrl, { max: 1, connect_timeout: 10 });
  } catch (err) {
    console.warn("[AutoMigrate] Failed to connect to database:", err);
    return;
  }

  let columnsAdded = 0;

  for (const migration of REQUIRED_COLUMNS) {
    try {
      const exists = await columnExists(sql, migration.table, migration.column);

      if (!exists) {
        const defaultClause = migration.defaultValue != null
          ? ` DEFAULT ${migration.defaultValue}`
          : "";
        const alterSql = `ALTER TABLE "${migration.table}" ADD COLUMN "${migration.column}" ${migration.type}${defaultClause}`;
        await sql.unsafe(alterSql);
        console.log(`[AutoMigrate] Added column: ${migration.table}.${migration.column}`);
        columnsAdded++;
      }
    } catch (err: any) {
      // "already exists" means it already exists — safe to ignore
      if (err?.message?.includes("already exists")) {
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
        await sql.unsafe(query);
        console.log(`[AutoMigrate] Backfill executed successfully`);
      } catch (err: any) {
        // Backfill failures are non-fatal (e.g., "date" column may not exist in new installs)
        console.warn(`[AutoMigrate] Backfill query skipped or failed:`, err?.message || err);
      }
    }
  }

  // ── Special migration: Make bill_invoice_allocations.employeeId nullable ──
  // PostgreSQL supports ALTER COLUMN DROP NOT NULL directly, no need to recreate the table.
  try {
    const notNullResult = await sql`
      SELECT is_nullable FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bill_invoice_allocations'
        AND column_name = 'employeeId'
    `;

    if (notNullResult.length > 0 && notNullResult[0].is_nullable === 'NO') {
      console.log("[AutoMigrate] Making bill_invoice_allocations.employeeId nullable...");
      await sql`ALTER TABLE "bill_invoice_allocations" ALTER COLUMN "employeeId" DROP NOT NULL`;
      console.log("[AutoMigrate] bill_invoice_allocations.employeeId is now nullable");
    }
  } catch (err: any) {
    console.error("[AutoMigrate] Failed to alter bill_invoice_allocations:", err?.message || err);
  }

  // Close the dedicated migration connection
  await sql.end();

  console.log("[AutoMigrate] Schema check complete");
}
