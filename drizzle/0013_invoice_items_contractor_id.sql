-- Migration: Add contractorId to invoice_items and bill_invoice_allocations
-- Purpose: Support AOR contractor association in invoice line items and cost allocations

-- 1. Add contractorId column to invoice_items
ALTER TABLE invoice_items ADD COLUMN contractorId INTEGER;

-- 2. Create index for contractorId on invoice_items
CREATE INDEX IF NOT EXISTS ii_contractor_id_idx ON invoice_items(contractorId);

-- Note: employeeId in bill_invoice_allocations was previously NOT NULL in the DB.
-- SQLite does not support ALTER COLUMN to drop NOT NULL constraint directly.
-- We need to recreate the table to make employeeId nullable.
-- This is safe because the table typically has limited data.

-- 5. Recreate bill_invoice_allocations with employeeId as nullable
CREATE TABLE `bill_invoice_allocations_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vendorBillId` integer NOT NULL,
	`vendorBillItemId` integer,
	`invoiceId` integer NOT NULL,
	`employeeId` integer,
	`contractorId` integer,
	`allocatedAmount` text NOT NULL,
	`description` text,
	`allocatedBy` integer,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);

-- 6. Copy existing data
INSERT INTO `bill_invoice_allocations_new` (`id`, `vendorBillId`, `vendorBillItemId`, `invoiceId`, `employeeId`, `allocatedAmount`, `description`, `allocatedBy`, `createdAt`, `updatedAt`)
SELECT `id`, `vendorBillId`, `vendorBillItemId`, `invoiceId`, `employeeId`, `allocatedAmount`, `description`, `allocatedBy`, `createdAt`, `updatedAt`
FROM `bill_invoice_allocations`;

-- 7. Drop old table and rename
DROP TABLE `bill_invoice_allocations`;
ALTER TABLE `bill_invoice_allocations_new` RENAME TO `bill_invoice_allocations`;

-- 8. Recreate indexes
CREATE INDEX `bia_vendor_bill_id_idx` ON `bill_invoice_allocations` (`vendorBillId`);
CREATE INDEX `bia_vendor_bill_item_id_idx` ON `bill_invoice_allocations` (`vendorBillItemId`);
CREATE INDEX `bia_invoice_id_idx` ON `bill_invoice_allocations` (`invoiceId`);
CREATE INDEX `bia_employee_id_idx` ON `bill_invoice_allocations` (`employeeId`);
CREATE INDEX `bia_contractor_id_idx` ON `bill_invoice_allocations` (`contractorId`);
