-- =============================================================================
-- Migration 0009: Align contractor_adjustments & contractor_milestones tables
-- with the ORM schema defined in aor-schema.ts
-- =============================================================================

-- ── contractor_adjustments: Add missing columns ──

ALTER TABLE `contractor_adjustments` ADD `customerId` integer;--> statement-breakpoint
ALTER TABLE `contractor_adjustments` ADD `attachmentFileKey` text;--> statement-breakpoint
ALTER TABLE `contractor_adjustments` ADD `submittedBy` integer;--> statement-breakpoint
ALTER TABLE `contractor_adjustments` ADD `clientApprovedBy` integer;--> statement-breakpoint
ALTER TABLE `contractor_adjustments` ADD `clientApprovedAt` integer;--> statement-breakpoint
ALTER TABLE `contractor_adjustments` ADD `clientRejectionReason` text;--> statement-breakpoint
ALTER TABLE `contractor_adjustments` ADD `adminApprovedBy` integer;--> statement-breakpoint
ALTER TABLE `contractor_adjustments` ADD `adminApprovedAt` integer;--> statement-breakpoint
ALTER TABLE `contractor_adjustments` ADD `adminRejectionReason` text;--> statement-breakpoint
ALTER TABLE `contractor_adjustments` ADD `effectiveMonth` text;--> statement-breakpoint

-- Backfill customerId from contractors table
UPDATE `contractor_adjustments` SET `customerId` = (
  SELECT `customerId` FROM `contractors` WHERE `contractors`.`id` = `contractor_adjustments`.`contractorId`
) WHERE `customerId` IS NULL;--> statement-breakpoint

-- Backfill effectiveMonth from existing date column
UPDATE `contractor_adjustments` SET `effectiveMonth` = `date` WHERE `effectiveMonth` IS NULL AND `date` IS NOT NULL;--> statement-breakpoint

-- Add indexes for new columns
CREATE INDEX `ca_customer_id_idx` ON `contractor_adjustments` (`customerId`);--> statement-breakpoint
CREATE INDEX `ca_effective_month_idx` ON `contractor_adjustments` (`effectiveMonth`);--> statement-breakpoint

-- ── contractor_milestones: Add missing columns ──

ALTER TABLE `contractor_milestones` ADD `customerId` integer;--> statement-breakpoint
ALTER TABLE `contractor_milestones` ADD `submittedBy` integer;--> statement-breakpoint
ALTER TABLE `contractor_milestones` ADD `clientApprovedBy` integer;--> statement-breakpoint
ALTER TABLE `contractor_milestones` ADD `clientApprovedAt` integer;--> statement-breakpoint
ALTER TABLE `contractor_milestones` ADD `clientRejectionReason` text;--> statement-breakpoint
ALTER TABLE `contractor_milestones` ADD `adminApprovedBy` integer;--> statement-breakpoint
ALTER TABLE `contractor_milestones` ADD `adminApprovedAt` integer;--> statement-breakpoint
ALTER TABLE `contractor_milestones` ADD `adminRejectionReason` text;--> statement-breakpoint
ALTER TABLE `contractor_milestones` ADD `effectiveMonth` text;--> statement-breakpoint

-- Backfill customerId from contractors table
UPDATE `contractor_milestones` SET `customerId` = (
  SELECT `customerId` FROM `contractors` WHERE `contractors`.`id` = `contractor_milestones`.`contractorId`
) WHERE `customerId` IS NULL;--> statement-breakpoint

-- Add indexes for new columns
CREATE INDEX `cm_customer_id_idx` ON `contractor_milestones` (`customerId`);--> statement-breakpoint
CREATE INDEX `cm_effective_month_idx` ON `contractor_milestones` (`effectiveMonth`);
