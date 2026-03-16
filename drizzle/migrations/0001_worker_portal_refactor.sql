-- Migration: Worker Portal Refactor
-- Date: 2026-03-16
-- Description: Add Employee support to worker_users, create contractor documents/contracts tables,
--              create employee payslips table, and add milestone deliverable fields.

-- ============================================================================
-- 1. Add employeeId column to worker_users table
-- ============================================================================
ALTER TABLE worker_users ADD COLUMN employeeId INTEGER UNIQUE REFERENCES employees(id);

-- Create index for employeeId lookup
CREATE UNIQUE INDEX IF NOT EXISTS wu_employee_id_idx ON worker_users(employeeId);

-- ============================================================================
-- 2. Create contractor_documents table
-- ============================================================================
CREATE TABLE IF NOT EXISTS contractor_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractorId INTEGER NOT NULL REFERENCES contractors(id),
  customerId INTEGER REFERENCES customers(id),
  documentType TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT,
  fileUrl TEXT NOT NULL,
  fileName TEXT,
  fileSize INTEGER,
  mimeType TEXT,
  uploadedBy TEXT,
  isVisibleToWorker INTEGER NOT NULL DEFAULT 1,
  createdAt INTEGER DEFAULT (unixepoch()) NOT NULL,
  updatedAt INTEGER DEFAULT (unixepoch()) NOT NULL
);

CREATE INDEX IF NOT EXISTS cd_contractor_id_idx ON contractor_documents(contractorId);
CREATE INDEX IF NOT EXISTS cd_customer_id_idx ON contractor_documents(customerId);

-- ============================================================================
-- 3. Create contractor_contracts table
-- ============================================================================
CREATE TABLE IF NOT EXISTS contractor_contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractorId INTEGER NOT NULL REFERENCES contractors(id),
  customerId INTEGER REFERENCES customers(id),
  title TEXT NOT NULL,
  contractType TEXT NOT NULL DEFAULT 'service_agreement',
  status TEXT NOT NULL DEFAULT 'draft',
  startDate TEXT,
  endDate TEXT,
  fileUrl TEXT,
  fileName TEXT,
  signedAt INTEGER,
  createdAt INTEGER DEFAULT (unixepoch()) NOT NULL,
  updatedAt INTEGER DEFAULT (unixepoch()) NOT NULL
);

CREATE INDEX IF NOT EXISTS cc_contractor_id_idx ON contractor_contracts(contractorId);

-- ============================================================================
-- 4. Create employee_payslips table
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_payslips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeId INTEGER NOT NULL REFERENCES employees(id),
  customerId INTEGER REFERENCES customers(id),
  payPeriod TEXT NOT NULL,
  payDate TEXT,
  grossAmount TEXT,
  netAmount TEXT,
  currency TEXT DEFAULT 'USD',
  fileUrl TEXT,
  fileName TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  publishedAt INTEGER,
  createdAt INTEGER DEFAULT (unixepoch()) NOT NULL,
  updatedAt INTEGER DEFAULT (unixepoch()) NOT NULL
);

CREATE INDEX IF NOT EXISTS ep_employee_id_idx ON employee_payslips(employeeId);
CREATE INDEX IF NOT EXISTS ep_customer_id_idx ON employee_payslips(customerId);
CREATE UNIQUE INDEX IF NOT EXISTS ep_employee_period_idx ON employee_payslips(employeeId, payPeriod);

-- ============================================================================
-- 5. Add deliverable fields to contractor_milestones table (if not already present)
-- ============================================================================
-- Note: These ALTER TABLE statements may fail if columns already exist.
-- In production, wrap in a try-catch or check column existence first.
ALTER TABLE contractor_milestones ADD COLUMN deliverableFileUrl TEXT;
ALTER TABLE contractor_milestones ADD COLUMN deliverableFileName TEXT;
ALTER TABLE contractor_milestones ADD COLUMN deliverableNotes TEXT;
ALTER TABLE contractor_milestones ADD COLUMN deliverableSubmittedAt INTEGER;
