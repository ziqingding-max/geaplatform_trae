/**
 * Seed script for Headhunter Toolkit data + Income Tax Rules
 *
 * Seeds: globalBenefits, hiringCompliance, salaryBenchmarks,
 *        documentTemplates, incomeTaxRules
 *
 * Usage (standalone):  npx tsx scripts/seedToolkitData.ts
 * Also called by seed-production.ts during deployment.
 *
 * Idempotent: uses upsert / onConflictDoNothing to avoid duplicates.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

import toolkitData from "../server/scripts/seedHeadhunterToolkit";
import { incomeTaxRulesData } from "../server/scripts/seedIncomeTaxRules";

// ── DB connection (reuse env var) ───────────────────────────────────────────
let db: ReturnType<typeof drizzle>;
let client: ReturnType<typeof postgres>;

function getConnection() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("Error: DATABASE_URL environment variable is not set.");
    process.exit(1);
  }
  client = postgres(DATABASE_URL, { max: 1 });
  db = drizzle(client, { schema });
  return db;
}

/**
 * Allow seed-production.ts to inject its own db instance
 * so we don't open a second connection.
 */
export function setDb(externalDb: typeof db) {
  db = externalDb;
}

// ── Seed Global Benefits ────────────────────────────────────────────────────
export async function seedGlobalBenefits() {
  console.log("🎁 Seeding Global Benefits...");
  const { benefitsData } = toolkitData;
  let count = 0;

  for (const b of benefitsData) {
    // Check existence by countryCode + nameEn to avoid duplicates
    const existing = await db
      .select({ id: schema.globalBenefits.id })
      .from(schema.globalBenefits)
      .where(
        and(
          eq(schema.globalBenefits.countryCode, b.countryCode),
          eq(schema.globalBenefits.nameEn, b.nameEn)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.globalBenefits).values({
        countryCode: b.countryCode,
        benefitType: b.benefitType,
        category: b.category,
        nameEn: b.nameEn,
        nameZh: b.nameZh,
        descriptionEn: b.descriptionEn,
        descriptionZh: b.descriptionZh,
        costIndication: b.costIndication || null,
        pitchCardEn: b.pitchCardEn || null,
        pitchCardZh: b.pitchCardZh || null,
        sortOrder: b.sortOrder,
        source: "ai_generated",
      });
      count++;
    }
  }
  console.log(`  ✅ Added ${count} new global benefits (${benefitsData.length} total in data).`);
}

// ── Seed Hiring Compliance ──────────────────────────────────────────────────
export async function seedHiringCompliance() {
  console.log("📋 Seeding Hiring Compliance...");
  const { complianceData } = toolkitData;
  let count = 0;

  for (const c of complianceData) {
    // hiringCompliance has unique constraint on countryCode
    const existing = await db
      .select({ id: schema.hiringCompliance.id })
      .from(schema.hiringCompliance)
      .where(eq(schema.hiringCompliance.countryCode, c.countryCode))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.hiringCompliance).values({
        countryCode: c.countryCode,
        probationRulesEn: c.probationRulesEn,
        probationRulesZh: c.probationRulesZh,
        noticePeriodRulesEn: c.noticePeriodRulesEn,
        noticePeriodRulesZh: c.noticePeriodRulesZh,
        backgroundCheckRulesEn: c.backgroundCheckRulesEn,
        backgroundCheckRulesZh: c.backgroundCheckRulesZh,
        severanceRulesEn: c.severanceRulesEn,
        severanceRulesZh: c.severanceRulesZh,
        nonCompeteRulesEn: c.nonCompeteRulesEn,
        nonCompeteRulesZh: c.nonCompeteRulesZh,
        workPermitRulesEn: c.workPermitRulesEn,
        workPermitRulesZh: c.workPermitRulesZh,
        additionalNotesEn: c.additionalNotesEn || null,
        additionalNotesZh: c.additionalNotesZh || null,
        source: "ai_generated",
      });
      count++;
    } else {
      // Update existing record
      await db
        .update(schema.hiringCompliance)
        .set({
          probationRulesEn: c.probationRulesEn,
          probationRulesZh: c.probationRulesZh,
          noticePeriodRulesEn: c.noticePeriodRulesEn,
          noticePeriodRulesZh: c.noticePeriodRulesZh,
          backgroundCheckRulesEn: c.backgroundCheckRulesEn,
          backgroundCheckRulesZh: c.backgroundCheckRulesZh,
          severanceRulesEn: c.severanceRulesEn,
          severanceRulesZh: c.severanceRulesZh,
          nonCompeteRulesEn: c.nonCompeteRulesEn,
          nonCompeteRulesZh: c.nonCompeteRulesZh,
          workPermitRulesEn: c.workPermitRulesEn,
          workPermitRulesZh: c.workPermitRulesZh,
          additionalNotesEn: c.additionalNotesEn || null,
          additionalNotesZh: c.additionalNotesZh || null,
        })
        .where(eq(schema.hiringCompliance.countryCode, c.countryCode));
    }
  }
  console.log(`  ✅ Upserted ${complianceData.length} hiring compliance records.`);
}

// ── Seed Salary Benchmarks ──────────────────────────────────────────────────
export async function seedSalaryBenchmarks() {
  console.log("💰 Seeding Salary Benchmarks...");
  const { salaryBenchmarkData } = toolkitData;
  let count = 0;

  for (const s of salaryBenchmarkData) {
    // Check by countryCode + jobTitle + seniorityLevel
    const existing = await db
      .select({ id: schema.salaryBenchmarks.id })
      .from(schema.salaryBenchmarks)
      .where(
        and(
          eq(schema.salaryBenchmarks.countryCode, s.countryCode),
          eq(schema.salaryBenchmarks.jobTitle, s.jobTitle),
          eq(schema.salaryBenchmarks.seniorityLevel, s.seniorityLevel)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.salaryBenchmarks).values({
        countryCode: s.countryCode,
        jobCategory: s.jobCategory,
        jobTitle: s.jobTitle,
        seniorityLevel: s.seniorityLevel,
        salaryP25: s.salaryP25,
        salaryP50: s.salaryP50,
        salaryP75: s.salaryP75,
        currency: s.currency,
        dataYear: s.dataYear,
        source: "ai_generated",
      });
      count++;
    }
  }
  console.log(`  ✅ Added ${count} new salary benchmarks (${salaryBenchmarkData.length} total in data).`);
}

// ── Seed Document Templates ─────────────────────────────────────────────────
export async function seedDocumentTemplates() {
  console.log("📄 Seeding Document Templates...");
  const { documentTemplateData } = toolkitData;
  let count = 0;

  for (const d of documentTemplateData) {
    // Check by countryCode + documentType + titleEn
    const existing = await db
      .select({ id: schema.documentTemplates.id })
      .from(schema.documentTemplates)
      .where(
        and(
          eq(schema.documentTemplates.countryCode, d.countryCode),
          eq(schema.documentTemplates.documentType, d.documentType),
          eq(schema.documentTemplates.titleEn, d.titleEn)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.documentTemplates).values({
        countryCode: d.countryCode,
        documentType: d.documentType,
        titleEn: d.titleEn,
        titleZh: d.titleZh,
        descriptionEn: d.descriptionEn,
        descriptionZh: d.descriptionZh,
        fileUrl: d.fileUrl,
        fileName: d.fileName,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
        version: d.version,
        source: d.source,
      });
      count++;
    }
  }
  console.log(`  ✅ Added ${count} new document templates (${documentTemplateData.length} total in data).`);
}

// ── Seed Income Tax Rules ───────────────────────────────────────────────────
export async function seedIncomeTaxRules() {
  console.log("🧾 Seeding Income Tax Rules...");
  let count = 0;

  for (const r of incomeTaxRulesData) {
    // Unique index on (countryCode, taxYear, filingStatus)
    const existing = await db
      .select({ id: schema.incomeTaxRules.id })
      .from(schema.incomeTaxRules)
      .where(
        and(
          eq(schema.incomeTaxRules.countryCode, r.countryCode),
          eq(schema.incomeTaxRules.taxYear, r.taxYear),
          eq(schema.incomeTaxRules.filingStatus, r.filingStatus)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.incomeTaxRules).values({
        countryCode: r.countryCode,
        taxYear: r.taxYear,
        filingStatus: r.filingStatus,
        currency: r.currency,
        standardDeductionAnnual: r.standardDeductionAnnual,
        taxBrackets: r.taxBrackets,
        socialSecurityDeductible: r.socialSecurityDeductible,
        notes: r.notes,
        source: r.source,
      });
      count++;
    } else {
      // Update existing
      await db
        .update(schema.incomeTaxRules)
        .set({
          currency: r.currency,
          standardDeductionAnnual: r.standardDeductionAnnual,
          taxBrackets: r.taxBrackets,
          socialSecurityDeductible: r.socialSecurityDeductible,
          notes: r.notes,
          source: r.source,
        })
        .where(
          and(
            eq(schema.incomeTaxRules.countryCode, r.countryCode),
            eq(schema.incomeTaxRules.taxYear, r.taxYear),
            eq(schema.incomeTaxRules.filingStatus, r.filingStatus)
          )
        );
    }
  }
  console.log(`  ✅ Upserted ${incomeTaxRulesData.length} income tax rules.`);
}

// ── Main: run all toolkit seeds ─────────────────────────────────────────────
export async function seedAllToolkitData() {
  await seedGlobalBenefits();
  await seedHiringCompliance();
  await seedSalaryBenchmarks();
  await seedDocumentTemplates();
  await seedIncomeTaxRules();
}

// ── Standalone execution ────────────────────────────────────────────────────
if (require.main === module || process.argv[1]?.endsWith("seedToolkitData.ts")) {
  getConnection();
  seedAllToolkitData()
    .then(() => {
      console.log("🎉 Toolkit data seeding completed!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Toolkit seeding failed:", err);
      process.exit(1);
    });
}
