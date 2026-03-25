/**
 * migrate-sqlite-to-pg.ts
 *
 * One-time ETL migration script: reads all data from the SQLite production database
 * and writes it into a PostgreSQL database.
 *
 * Key transformations:
 *   - Integer booleans (0/1) → native PostgreSQL booleans (false/true)
 *   - Integer timestamps (epoch ms) → native PostgreSQL TIMESTAMPTZ
 *   - JSON stored as text → native JSONB
 *   - Auto-increment IDs → serial sequences (reset after migration)
 *
 * Usage:
 *   SQLITE_PATH=./production.db DATABASE_URL=postgresql://user:pass@host:5432/gea_production \
 *     npx tsx scripts/migrate-sqlite-to-pg.ts
 *
 * Options:
 *   --dry-run     Print table counts without writing to PostgreSQL
 *   --tables=t1,t2  Only migrate specified tables (comma-separated)
 *   --skip-verify   Skip post-migration verification
 *
 * Prerequisites:
 *   - PostgreSQL database must exist and have the schema already created
 *     (run `npx drizzle-kit push` or apply migrations first)
 *   - npm install better-sqlite3 (for reading the SQLite file)
 */

import Database from 'better-sqlite3';
import postgres from 'postgres';

// ─── Configuration ──────────────────────────────────────────────────────────

const SQLITE_PATH = process.env.SQLITE_PATH;
const PG_URL = process.env.DATABASE_URL;

if (!SQLITE_PATH) {
  console.error('Error: SQLITE_PATH environment variable is required.');
  console.error('Example: SQLITE_PATH=./production.db DATABASE_URL=postgresql://... npx tsx scripts/migrate-sqlite-to-pg.ts');
  process.exit(1);
}

if (!PG_URL) {
  console.error('Error: DATABASE_URL environment variable is required.');
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_VERIFY = args.includes('--skip-verify');
const tablesArg = args.find(a => a.startsWith('--tables='));
const ONLY_TABLES = tablesArg ? tablesArg.split('=')[1].split(',') : null;

// ─── Boolean columns (were integer 0/1 in SQLite) ──────────────────────────

const BOOLEAN_COLUMNS: Record<string, string[]> = {
  users: ['isActive'],
  customers: ['isActive'],
  employees: ['isActive'],
  invoices: ['isLocked'],
  invoice_items: ['isTaxable'],
  payroll_runs: ['isLocked'],
  customer_leave_policies: ['clientConfirmed'],
  leave_records: ['isPaid'],
  reimbursements: ['isPaid'],
  social_insurance_rules: ['isActive'],
  onboarding_invites: ['isActive'],
  knowledge_articles: ['isPublished'],
  contractors: ['isActive'],
  contractor_invoices: ['isLocked'],
  contractor_invoice_items: ['isTaxable'],
};

// ─── Timestamp columns (were integer epoch ms in SQLite) ────────────────────

const TIMESTAMP_COLUMNS: Record<string, string[]> = {
  users: ['createdAt', 'updatedAt', 'inviteExpiresAt', 'resetTokenExpiresAt', 'lastLoginAt'],
  countries_config: ['createdAt', 'updatedAt'],
  leave_types: ['createdAt', 'updatedAt'],
  public_holidays: ['createdAt', 'updatedAt'],
  customers: ['createdAt', 'updatedAt'],
  customer_contacts: ['createdAt', 'updatedAt'],
  customer_pricing: ['createdAt', 'updatedAt'],
  customer_contracts: ['createdAt', 'updatedAt'],
  customer_wallets: ['createdAt', 'updatedAt'],
  wallet_transactions: ['createdAt'],
  employees: ['createdAt', 'updatedAt'],
  invoices: ['createdAt', 'updatedAt', 'paidAt'],
  invoice_items: ['createdAt', 'updatedAt'],
  vendors: ['createdAt', 'updatedAt'],
  vendor_bills: ['createdAt', 'updatedAt'],
  vendor_bill_items: ['createdAt', 'updatedAt'],
  bill_invoice_allocations: ['createdAt', 'updatedAt'],
  payroll_runs: ['createdAt', 'updatedAt', 'approvedAt'],
  payroll_run_items: ['createdAt', 'updatedAt'],
  leave_records: ['createdAt', 'updatedAt', 'approvedAt'],
  reimbursements: ['createdAt', 'updatedAt', 'approvedAt'],
  social_insurance_rules: ['createdAt', 'updatedAt'],
  onboarding_invites: ['createdAt', 'updatedAt', 'expiresAt'],
  audit_logs: ['createdAt'],
  knowledge_articles: ['createdAt', 'updatedAt'],
  customer_leave_policies: ['createdAt', 'updatedAt'],
  customer_social_insurance_configs: ['createdAt', 'updatedAt'],
  sales_leads: ['createdAt', 'updatedAt', 'lastContactedAt', 'convertedAt'],
  sales_activities: ['createdAt'],
  sales_documents: ['createdAt'],
  lead_change_logs: ['createdAt'],
  cron_job_logs: ['startedAt', 'completedAt'],
  contractors: ['createdAt', 'updatedAt'],
  contractor_adjustments: ['createdAt', 'updatedAt', 'clientApprovedAt', 'adminApprovedAt'],
  contractor_milestones: ['createdAt', 'updatedAt', 'clientApprovedAt', 'adminApprovedAt'],
  contractor_invoices: ['createdAt', 'updatedAt', 'paidAt'],
  contractor_invoice_items: ['createdAt', 'updatedAt'],
  contractor_payments: ['createdAt', 'updatedAt'],
  contractor_timesheets: ['createdAt', 'updatedAt'],
  contractor_timesheet_entries: ['createdAt', 'updatedAt'],
};

// ─── JSON columns (were text in SQLite) ─────────────────────────────────────

const JSON_COLUMNS: Record<string, string[]> = {
  users: ['permissions'],
  employees: ['customFields'],
  invoices: ['metadata'],
  payroll_runs: ['metadata'],
  payroll_run_items: ['breakdown'],
  social_insurance_rules: ['tiers'],
  customer_social_insurance_configs: ['customTiers'],
  knowledge_articles: ['metadata'],
  contractors: ['customFields'],
  contractor_invoices: ['metadata'],
};

// ─── Table migration order (respects foreign key dependencies) ──────────────

const TABLE_ORDER: string[] = [
  // Core / config tables (no FK dependencies)
  'countries_config',
  'leave_types',
  'public_holidays',
  'social_insurance_rules',
  'knowledge_articles',
  
  // Users
  'users',
  
  // Customers & related
  'customers',
  'customer_contacts',
  'customer_pricing',
  'customer_contracts',
  'customer_wallets',
  'wallet_transactions',
  'customer_leave_policies',
  'customer_social_insurance_configs',
  
  // Employees
  'employees',
  'onboarding_invites',
  
  // Payroll
  'payroll_runs',
  'payroll_run_items',
  
  // Leave & Reimbursements
  'leave_records',
  'reimbursements',
  
  // Invoices
  'invoices',
  'invoice_items',
  
  // Vendors & Bills
  'vendors',
  'vendor_bills',
  'vendor_bill_items',
  'bill_invoice_allocations',
  
  // Sales / CRM
  'sales_leads',
  'sales_activities',
  'sales_documents',
  'lead_change_logs',
  
  // Audit
  'audit_logs',
  'cron_job_logs',
  
  // AOR / Contractors
  'contractors',
  'contractor_adjustments',
  'contractor_milestones',
  'contractor_invoices',
  'contractor_invoice_items',
  'contractor_payments',
  'contractor_timesheets',
  'contractor_timesheet_entries',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function convertValue(
  tableName: string,
  columnName: string,
  value: any
): any {
  if (value === null || value === undefined) return null;

  // Boolean conversion
  const boolCols = BOOLEAN_COLUMNS[tableName] || [];
  if (boolCols.includes(columnName)) {
    return value === 1 || value === true;
  }

  // Timestamp conversion (epoch ms → Date)
  const tsCols = TIMESTAMP_COLUMNS[tableName] || [];
  if (tsCols.includes(columnName)) {
    if (typeof value === 'number' && value > 0) {
      return new Date(value);
    }
    return null;
  }

  // JSON conversion (text → parsed object)
  const jsonCols = JSON_COLUMNS[tableName] || [];
  if (jsonCols.includes(columnName)) {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }

  return value;
}

// ─── Main Migration ─────────────────────────────────────────────────────────

async function migrate() {
  console.log('='.repeat(70));
  console.log('  GEA Platform: SQLite → PostgreSQL Data Migration');
  console.log('='.repeat(70));
  console.log(`  SQLite source: ${SQLITE_PATH}`);
  console.log(`  PostgreSQL target: ${PG_URL!.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE MIGRATION'}`);
  console.log('='.repeat(70));

  // Open SQLite
  const sqlite = new Database(SQLITE_PATH!, { readonly: true });

  // Open PostgreSQL
  const pg = postgres(PG_URL!, { max: 5 });

  // Get list of tables in SQLite
  const sqliteTables = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_drizzle%' ORDER BY name")
    .all()
    .map((r: any) => r.name);

  console.log(`\nSQLite tables found: ${sqliteTables.length}`);

  // Determine migration order
  const tablesToMigrate = TABLE_ORDER.filter(t => {
    if (ONLY_TABLES && !ONLY_TABLES.includes(t)) return false;
    return sqliteTables.includes(t);
  });

  // Also add any tables not in TABLE_ORDER (safety net)
  for (const t of sqliteTables) {
    if (!tablesToMigrate.includes(t) && (!ONLY_TABLES || ONLY_TABLES.includes(t))) {
      tablesToMigrate.push(t);
    }
  }

  console.log(`Tables to migrate: ${tablesToMigrate.length}\n`);

  const stats: { table: string; sqliteCount: number; pgCount: number; status: string }[] = [];

  for (const tableName of tablesToMigrate) {
    try {
      // Count rows in SQLite
      const countResult = sqlite.prepare(`SELECT COUNT(*) as cnt FROM "${tableName}"`).get() as any;
      const sqliteCount = countResult.cnt;

      if (DRY_RUN) {
        console.log(`  [DRY RUN] ${tableName}: ${sqliteCount} rows`);
        stats.push({ table: tableName, sqliteCount, pgCount: 0, status: 'dry-run' });
        continue;
      }

      if (sqliteCount === 0) {
        console.log(`  [SKIP] ${tableName}: 0 rows`);
        stats.push({ table: tableName, sqliteCount: 0, pgCount: 0, status: 'empty' });
        continue;
      }

      // Read all rows from SQLite
      const rows = sqlite.prepare(`SELECT * FROM "${tableName}"`).all() as any[];
      const columns = Object.keys(rows[0]);

      // Clear target table in PostgreSQL (TRUNCATE CASCADE)
      await pg.unsafe(`TRUNCATE TABLE "${tableName}" CASCADE`);

      // Batch insert into PostgreSQL (chunks of 500)
      const BATCH_SIZE = 500;
      let inserted = 0;

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);

        // Build parameterized INSERT
        const values = batch.map(row => {
          return columns.map(col => convertValue(tableName, col, row[col]));
        });

        const placeholders = values.map((row, ri) => {
          return `(${row.map((_, ci) => `$${ri * columns.length + ci + 1}`).join(', ')})`;
        }).join(', ');

        const flatValues = values.flat();
        const quotedCols = columns.map(c => `"${c}"`).join(', ');

        await pg.unsafe(
          `INSERT INTO "${tableName}" (${quotedCols}) VALUES ${placeholders}`,
          flatValues
        );

        inserted += batch.length;
      }

      // Reset serial sequence to max(id) + 1
      if (columns.includes('id')) {
        try {
          await pg.unsafe(`SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tableName}"), 0) + 1, false)`);
        } catch {
          // Table might not have a serial sequence
        }
      }

      console.log(`  [OK] ${tableName}: ${inserted} rows migrated`);
      stats.push({ table: tableName, sqliteCount, pgCount: inserted, status: 'ok' });

    } catch (err: any) {
      console.error(`  [ERROR] ${tableName}: ${err.message}`);
      stats.push({ table: tableName, sqliteCount: -1, pgCount: 0, status: `error: ${err.message.substring(0, 80)}` });
    }
  }

  // ─── Verification ───────────────────────────────────────────────────────

  if (!DRY_RUN && !SKIP_VERIFY) {
    console.log('\n' + '='.repeat(70));
    console.log('  Post-Migration Verification');
    console.log('='.repeat(70));

    let allMatch = true;
    for (const stat of stats) {
      if (stat.status !== 'ok') continue;

      const [pgResult] = await pg.unsafe(`SELECT COUNT(*) as cnt FROM "${stat.table}"`);
      const pgCount = Number(pgResult.cnt);

      if (pgCount !== stat.sqliteCount) {
        console.error(`  [MISMATCH] ${stat.table}: SQLite=${stat.sqliteCount}, PG=${pgCount}`);
        allMatch = false;
      } else {
        console.log(`  [VERIFIED] ${stat.table}: ${pgCount} rows`);
      }
    }

    if (allMatch) {
      console.log('\n  All tables verified successfully!');
    } else {
      console.error('\n  WARNING: Some tables have mismatched row counts!');
    }
  }

  // ─── Summary ──────────────────────────────────────────────────────────

  console.log('\n' + '='.repeat(70));
  console.log('  Migration Summary');
  console.log('='.repeat(70));
  console.log(`  Total tables: ${stats.length}`);
  console.log(`  Successful: ${stats.filter(s => s.status === 'ok').length}`);
  console.log(`  Empty: ${stats.filter(s => s.status === 'empty').length}`);
  console.log(`  Errors: ${stats.filter(s => s.status.startsWith('error')).length}`);
  console.log(`  Total rows migrated: ${stats.reduce((sum, s) => sum + s.pgCount, 0)}`);
  console.log('='.repeat(70));

  // Cleanup
  sqlite.close();
  await pg.end();

  // Exit with error code if any failures
  if (stats.some(s => s.status.startsWith('error'))) {
    process.exit(1);
  }
}

migrate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
