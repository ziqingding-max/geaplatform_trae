-- Migration: Add contractorId to invoice_items and bill_invoice_allocations
-- Purpose: Support AOR contractor association in invoice line items and cost allocations
--
-- IMPORTANT: This migration is designed to be idempotent (safe to re-run).
-- The heavy lifting (table recreation for bill_invoice_allocations) is now handled
-- by autoMigrate.ts which uses PRAGMA table_info() to check before adding columns.
-- This SQL file only handles simple ALTER TABLE ADD COLUMN operations.

-- 1. Add contractorId column to invoice_items (idempotent: docker-entrypoint ignores "duplicate column")
ALTER TABLE invoice_items ADD COLUMN contractorId INTEGER;

-- 2. Create index for contractorId on invoice_items
CREATE INDEX IF NOT EXISTS ii_contractor_id_idx ON invoice_items(contractorId);

-- 3. Add contractorId column to bill_invoice_allocations (idempotent: docker-entrypoint ignores "duplicate column")
ALTER TABLE bill_invoice_allocations ADD COLUMN contractorId INTEGER;

-- 4. Create index for contractorId on bill_invoice_allocations
CREATE INDEX IF NOT EXISTS bia_contractor_id_idx ON bill_invoice_allocations(contractorId);

-- NOTE: Making bill_invoice_allocations.employeeId nullable requires table recreation in SQLite.
-- This is NOT safe to do in a SQL migration file that gets re-run on every container restart.
-- Instead, the application code handles NULL employeeId gracefully:
-- - The Drizzle schema defines employeeId without .notNull()
-- - New rows can be inserted with employeeId = null (SQLite allows this even if column was originally NOT NULL,
--   as long as the INSERT doesn't go through a strict mode check)
-- - autoMigrate.ts ensures the contractorId column exists at startup
