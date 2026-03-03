import { createClient } from "@libsql/client";

const client = createClient({ url: process.env.DATABASE_URL || "file:sqlite.db" });

const sql = `
CREATE TABLE IF NOT EXISTS \`country_guide_chapters\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`countryCode\` text(3) NOT NULL,
	\`part\` integer NOT NULL,
	\`chapterKey\` text(50) NOT NULL,
	\`titleEn\` text(300) NOT NULL,
	\`titleZh\` text(300) NOT NULL,
	\`contentEn\` text NOT NULL,
	\`contentZh\` text NOT NULL,
	\`sortOrder\` integer DEFAULT 0 NOT NULL,
	\`version\` text(20) NOT NULL,
	\`status\` text DEFAULT 'draft' NOT NULL,
	\`metadata\` text,
	\`effectiveFrom\` text,
	\`effectiveTo\` text,
	\`createdAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	\`updatedAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);

CREATE INDEX IF NOT EXISTS \`cgc_country_idx\` ON \`country_guide_chapters\` (\`countryCode\`);
CREATE INDEX IF NOT EXISTS \`cgc_status_idx\` ON \`country_guide_chapters\` (\`status\`);

CREATE TABLE IF NOT EXISTS \`country_social_insurance_items\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`countryCode\` text(3) NOT NULL,
	\`itemKey\` text(50) NOT NULL,
	\`itemNameEn\` text(200) NOT NULL,
	\`itemNameZh\` text(200) NOT NULL,
	\`category\` text NOT NULL,
	\`rateEmployer\` text DEFAULT '0' NOT NULL,
	\`rateEmployee\` text DEFAULT '0' NOT NULL,
	\`capType\` text DEFAULT 'none' NOT NULL,
	\`capBase\` text,
	\`capMultiplier\` text,
	\`capReferenceBase\` text,
	\`regionCode\` text,
	\`regionName\` text,
	\`ageBracketMin\` integer,
	\`ageBracketMax\` integer,
	\`salaryBracketMin\` text,
	\`salaryBracketMax\` text,
	\`effectiveYear\` integer NOT NULL,
	\`effectiveFrom\` text,
	\`effectiveTo\` text,
	\`legalReference\` text,
	\`notes\` text,
	\`sortOrder\` integer DEFAULT 0 NOT NULL,
	\`isActive\` integer DEFAULT true NOT NULL,
	\`createdAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	\`updatedAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);

CREATE INDEX IF NOT EXISTS \`csi_country_year_idx\` ON \`country_social_insurance_items\` (\`countryCode\`,\`effectiveYear\`);
CREATE INDEX IF NOT EXISTS \`csi_country_item_idx\` ON \`country_social_insurance_items\` (\`countryCode\`,\`itemKey\`);
CREATE INDEX IF NOT EXISTS \`csi_region_idx\` ON \`country_social_insurance_items\` (\`regionCode\`);

CREATE TABLE IF NOT EXISTS \`notifications\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`targetPortal\` text NOT NULL,
	\`targetUserId\` integer,
	\`targetRole\` text,
	\`targetCustomerId\` integer,
	\`type\` text NOT NULL,
	\`title\` text NOT NULL,
	\`data\` text,
	\`isRead\` integer DEFAULT false NOT NULL,
	\`readAt\` integer,
	\`createdAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);

CREATE INDEX IF NOT EXISTS \`notif_target_idx\` ON \`notifications\` (\`targetPortal\`,\`targetUserId\`,\`targetRole\`);
CREATE INDEX IF NOT EXISTS \`notif_customer_idx\` ON \`notifications\` (\`targetCustomerId\`);
CREATE INDEX IF NOT EXISTS \`notif_read_idx\` ON \`notifications\` (\`isRead\`);
CREATE INDEX IF NOT EXISTS \`notif_type_idx\` ON \`notifications\` (\`type\`);
CREATE INDEX IF NOT EXISTS \`notif_created_idx\` ON \`notifications\` (\`createdAt\`);

CREATE TABLE IF NOT EXISTS \`quotations\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`quotationNumber\` text(50) NOT NULL,
	\`leadId\` integer,
	\`customerId\` integer,
	\`countries\` text,
	\`totalMonthly\` text NOT NULL,
	\`currency\` text(3) DEFAULT 'USD' NOT NULL,
	\`snapshotData\` text,
	\`validUntil\` text,
	\`status\` text DEFAULT 'draft' NOT NULL,
	\`pdfUrl\` text,
	\`pdfKey\` text,
	\`sentAt\` integer,
	\`sentTo\` text,
	\`sentBy\` integer,
	\`createdBy\` integer NOT NULL,
	\`createdAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	\`updatedAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS \`quotations_quotationNumber_unique\` ON \`quotations\` (\`quotationNumber\`);
CREATE UNIQUE INDEX IF NOT EXISTS \`qt_number_idx\` ON \`quotations\` (\`quotationNumber\`);
CREATE INDEX IF NOT EXISTS \`qt_lead_idx\` ON \`quotations\` (\`leadId\`);
CREATE INDEX IF NOT EXISTS \`qt_customer_idx\` ON \`quotations\` (\`customerId\`);
CREATE INDEX IF NOT EXISTS \`qt_status_idx\` ON \`quotations\` (\`status\`);

CREATE TABLE IF NOT EXISTS \`salary_benchmarks\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`countryCode\` text(3) NOT NULL,
	\`jobCategory\` text(100) NOT NULL,
	\`jobTitle\` text(200) NOT NULL,
	\`seniorityLevel\` text NOT NULL,
	\`salaryP25\` text NOT NULL,
	\`salaryP50\` text NOT NULL,
	\`salaryP75\` text NOT NULL,
	\`currency\` text(3) NOT NULL,
	\`dataYear\` integer NOT NULL,
	\`source\` text,
	\`updatedAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);

CREATE INDEX IF NOT EXISTS \`sb_country_idx\` ON \`salary_benchmarks\` (\`countryCode\`);
CREATE INDEX IF NOT EXISTS \`sb_job_title_idx\` ON \`salary_benchmarks\` (\`jobTitle\`);

CREATE TABLE IF NOT EXISTS \`sales_documents\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`leadId\` integer,
	\`customerId\` integer,
	\`quotationId\` integer,
	\`docType\` text NOT NULL,
	\`title\` text(255) NOT NULL,
	\`fileUrl\` text NOT NULL,
	\`fileKey\` text(500) NOT NULL,
	\`generatedBy\` integer NOT NULL,
	\`createdAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);

CREATE INDEX IF NOT EXISTS \`sd_lead_idx\` ON \`sales_documents\` (\`leadId\`);
CREATE INDEX IF NOT EXISTS \`sd_customer_idx\` ON \`sales_documents\` (\`customerId\`);
CREATE INDEX IF NOT EXISTS \`sd_quotation_idx\` ON \`sales_documents\` (\`quotationId\`);

CREATE TABLE IF NOT EXISTS \`copilot_predictions\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`userId\` integer NOT NULL,
	\`predictionType\` text(50) NOT NULL,
	\`title\` text(255) NOT NULL,
	\`description\` text NOT NULL,
	\`confidence\` integer NOT NULL,
	\`severity\` text(20) NOT NULL,
	\`predictionData\` text,
	\`expiresAt\` integer,
	\`isDismissed\` integer DEFAULT false NOT NULL,
	\`dismissedAt\` integer,
	\`suggestedAction\` text,
	\`createdAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	\`updatedAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
CREATE INDEX IF NOT EXISTS \`cp_user_id_idx\` ON \`copilot_predictions\` (\`userId\`);
CREATE INDEX IF NOT EXISTS \`cp_type_idx\` ON \`copilot_predictions\` (\`predictionType\`);
CREATE INDEX IF NOT EXISTS \`cp_severity_idx\` ON \`copilot_predictions\` (\`severity\`);
CREATE INDEX IF NOT EXISTS \`cp_dismissed_idx\` ON \`copilot_predictions\` (\`isDismissed\`);
CREATE INDEX IF NOT EXISTS \`cp_expires_idx\` ON \`copilot_predictions\` (\`expiresAt\`);
CREATE INDEX IF NOT EXISTS \`cp_created_idx\` ON \`copilot_predictions\` (\`createdAt\`);

CREATE TABLE IF NOT EXISTS \`copilot_shortcuts\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`userId\` integer NOT NULL,
	\`title\` text(100) NOT NULL,
	\`description\` text(500),
	\`action\` text(100) NOT NULL,
	\`params\` text,
	\`icon\` text(50),
	\`badge\` text(20),
	\`hotkey\` text(50),
	\`usageCount\` integer DEFAULT 0 NOT NULL,
	\`lastUsedAt\` integer,
	\`isActive\` integer DEFAULT true NOT NULL,
	\`createdAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	\`updatedAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
CREATE INDEX IF NOT EXISTS \`cs_user_id_idx\` ON \`copilot_shortcuts\` (\`userId\`);
CREATE INDEX IF NOT EXISTS \`cs_action_idx\` ON \`copilot_shortcuts\` (\`action\`);
CREATE INDEX IF NOT EXISTS \`cs_active_idx\` ON \`copilot_shortcuts\` (\`isActive\`);
CREATE INDEX IF NOT EXISTS \`cs_usage_idx\` ON \`copilot_shortcuts\` (\`usageCount\`);
CREATE INDEX IF NOT EXISTS \`cs_last_used_idx\` ON \`copilot_shortcuts\` (\`lastUsedAt\`);

CREATE TABLE IF NOT EXISTS \`copilot_user_configs\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`userId\` integer NOT NULL,
	\`preferences\` text,
	\`hotkeys\` text,
	\`enabledFeatures\` text,
	\`disabledPredictions\` text,
	\`theme\` text(20) DEFAULT 'auto' NOT NULL,
	\`language\` text(10) DEFAULT 'zh' NOT NULL,
	\`position\` text(20) DEFAULT 'bottom-right' NOT NULL,
	\`isEnabled\` integer DEFAULT true NOT NULL,
	\`createdAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	\`updatedAt\` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS \`cuc_user_id_idx\` ON \`copilot_user_configs\` (\`userId\`);
CREATE INDEX IF NOT EXISTS \`cuc_enabled_idx\` ON \`copilot_user_configs\` (\`isEnabled\`);
`;

async function main() {
  console.log("Applying schema manually...");
  await client.executeMultiple(sql);
  console.log("Done.");
}

main().catch(console.error);
