/**
 * Migration: Add employer-provided fields to onboarding_invites table
 * and frozenBalance to customer_wallets table.
 *
 * These columns were added to the Drizzle schema but not yet applied
 * to the actual SQLite database.
 *
 * Run with: npx tsx scripts/migrate-add-invite-fields.ts
 */
import { createClient } from "@libsql/client";

const dbUrl = process.env.DATABASE_URL || "file:sqlite.db";
const client = createClient({ url: dbUrl });

async function migrate() {
  console.log("Starting migration...");

  // ── onboarding_invites: add employer-provided fields ──
  const inviteColumns = [
    { name: "serviceType", sql: `ALTER TABLE onboarding_invites ADD COLUMN "serviceType" TEXT DEFAULT 'eor'` },
    { name: "country", sql: `ALTER TABLE onboarding_invites ADD COLUMN "country" text(100)` },
    { name: "jobTitle", sql: `ALTER TABLE onboarding_invites ADD COLUMN "jobTitle" text(255)` },
    { name: "department", sql: `ALTER TABLE onboarding_invites ADD COLUMN "department" text(100)` },
    { name: "startDate", sql: `ALTER TABLE onboarding_invites ADD COLUMN "startDate" TEXT` },
    { name: "endDate", sql: `ALTER TABLE onboarding_invites ADD COLUMN "endDate" TEXT` },
    { name: "employmentType", sql: `ALTER TABLE onboarding_invites ADD COLUMN "employmentType" text(50)` },
    { name: "baseSalary", sql: `ALTER TABLE onboarding_invites ADD COLUMN "baseSalary" TEXT` },
    { name: "salaryCurrency", sql: `ALTER TABLE onboarding_invites ADD COLUMN "salaryCurrency" text(3)` },
    { name: "paymentFrequency", sql: `ALTER TABLE onboarding_invites ADD COLUMN "paymentFrequency" text(50)` },
    { name: "rateAmount", sql: `ALTER TABLE onboarding_invites ADD COLUMN "rateAmount" TEXT` },
    { name: "contractorCurrency", sql: `ALTER TABLE onboarding_invites ADD COLUMN "contractorCurrency" text(3)` },
    { name: "contractorId", sql: `ALTER TABLE onboarding_invites ADD COLUMN "contractorId" INTEGER` },
  ];

  for (const col of inviteColumns) {
    try {
      await client.execute(col.sql);
      console.log(`  ✓ Added onboarding_invites.${col.name}`);
    } catch (err: any) {
      if (err.message?.includes("duplicate column name")) {
        console.log(`  · onboarding_invites.${col.name} already exists, skipping`);
      } else {
        console.error(`  ✗ Failed to add onboarding_invites.${col.name}:`, err.message);
      }
    }
  }

  // ── customer_wallets: add frozenBalance ──
  try {
    await client.execute(`ALTER TABLE customer_wallets ADD COLUMN "frozenBalance" TEXT NOT NULL DEFAULT '0'`);
    console.log(`  ✓ Added customer_wallets.frozenBalance`);
  } catch (err: any) {
    if (err.message?.includes("duplicate column name")) {
      console.log(`  · customer_wallets.frozenBalance already exists, skipping`);
    } else {
      console.error(`  ✗ Failed to add customer_wallets.frozenBalance:`, err.message);
    }
  }

  // Verify
  console.log("\nVerifying onboarding_invites columns:");
  const inviteInfo = await client.execute("PRAGMA table_info(onboarding_invites)");
  for (const row of inviteInfo.rows) {
    console.log(`  ${row.name} (${row.type})`);
  }

  console.log("\nVerifying customer_wallets columns:");
  const walletInfo = await client.execute("PRAGMA table_info(customer_wallets)");
  for (const row of walletInfo.rows) {
    console.log(`  ${row.name} (${row.type})`);
  }

  console.log("\nMigration complete!");
}

migrate().catch(console.error);
