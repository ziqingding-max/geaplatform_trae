/**
 * Unified Seed Migration
 *
 * This is the SINGLE source of truth for all data initialization.
 * It runs automatically on every server startup via server/_core/index.ts.
 *
 * Seeds the following data (all idempotent - safe to run multiple times):
 *   1. System data: Countries, Leave Types, Public Holidays
 *   2. Social Insurance Rules (required for Employer Cost calculation)
 *   3. AI Provider Configurations
 *   4. Country Guide chapters
 *   5. Business migration data (customers, employees, invoices) — only in non-production
 */

import 'dotenv/config';
import { getDb } from './db';
import {
  customers, employees, invoices, invoiceItems,
  billingEntities, countriesConfig, leaveTypes, publicHolidays,
  countryGuideChapters, countrySocialInsuranceItems, aiProviderConfigs
} from '../drizzle/schema';
import { eq, and, not, inArray } from 'drizzle-orm';
import { socialInsuranceRules } from './seed/data/socialInsuranceRules';
// @ts-ignore
import seedData from '../data/seed-migration-data.json';
import { readFile } from 'fs/promises';
import { join } from 'path';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SeedCustomer {
  clientCode: string;
  companyName: string;
  country: string;
  primaryContactEmail: string;
  settlementCurrency: string;
  status: string;
  _oldCompanyId?: number;
}

interface SeedEmployee {
  employeeCode: string;
  customerIndex: number;
  firstName: string;
  lastName: string;
  email: string;
  nationality: string;
  country: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  baseSalary: number;
  salaryCurrency: string;
  status: string;
  _oldEmployeeId?: number;
  _oldCompanyId?: number;
}

interface SeedInvoice {
  invoiceNumber: string;
  customerIndex: number;
  employeeIndex: number;
  invoiceType: string;
  currency: string;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
  source?: string;
}

interface SeedData {
  customers: SeedCustomer[];
  employees: SeedEmployee[];
  deposit_invoices: SeedInvoice[];
  inactive_deposits: SeedInvoice[];
  deposit_refunds: SeedInvoice[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function readJsonFile(relativePath: string) {
  // In production Docker, seed data is at /app/seed-data (not affected by volume mount).
  // In development, seed data is at ./data (relative to project root).
  const candidates = [
    join(process.cwd(), 'seed-data', relativePath),  // Docker production path
    join(process.cwd(), 'data', relativePath),        // Development / fallback path
  ];
  for (const path of candidates) {
    try {
      const content = await readFile(path, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Try next candidate
    }
  }
  console.warn(`[Seed] Could not read ${relativePath} from any known path. Skipping.`);
  return null;
}

function parseDates(obj: any, dateFields: string[]) {
  const newObj = { ...obj };
  for (const field of dateFields) {
    if (newObj[field]) {
      newObj[field] = new Date(newObj[field]);
    }
  }
  return newObj;
}

// ─── 1. System Data: Countries, Leave Types, Holidays ────────────────────────

async function seedSystemData(db: any) {
  console.log('[Seed] Checking system data (Countries, Leave Types, Holidays)...');

  // 1a. Countries
  const countries = await readJsonFile('data-exports/baseline/countries_config.json');
  if (countries) {
    let count = 0;
    for (const country of countries) {
      const { id, ...data } = country;
      const formatted = parseDates(data, ['createdAt', 'updatedAt']);

      await db.insert(countriesConfig)
        .values(formatted)
        .onConflictDoUpdate({
          target: countriesConfig.countryCode,
          set: {
            countryName: formatted.countryName,
            localCurrency: formatted.localCurrency,
            payrollCycle: formatted.payrollCycle,
            standardEorRate: formatted.standardEorRate,
            isActive: formatted.isActive,
            updatedAt: new Date(),
          },
        });
      count++;
    }
    console.log(`[Seed] Processed ${count} countries`);

    // Clean up any test/orphan countries not in baseline data
    const validCodes = new Set(countries.map((c: any) => c.countryCode || c.code));
    const allDbCountries = await db.select({ countryCode: countriesConfig.countryCode }).from(countriesConfig);
    const orphanCodes = allDbCountries
      .map((r: any) => r.countryCode)
      .filter((code: string) => !validCodes.has(code));
    if (orphanCodes.length > 0) {
      for (const code of orphanCodes) {
        await db.delete(countriesConfig).where(eq(countriesConfig.countryCode, code));
        console.log(`[Seed] Removed orphan/test country: ${code}`);
      }
      console.log(`[Seed] Cleaned up ${orphanCodes.length} orphan/test countries`);
    }
  }

  // 1b. Leave Types
  const ltData = await readJsonFile('data-exports/baseline/leave_types.json');
  if (ltData) {
    let count = 0;
    for (const lt of ltData) {
      const { id, ...data } = lt;
      const formatted = parseDates(data, ['createdAt', 'updatedAt']);

      const existing = await db.query.leaveTypes.findFirst({
        where: and(
          eq(leaveTypes.countryCode, formatted.countryCode),
          eq(leaveTypes.leaveTypeName, formatted.leaveTypeName)
        ),
      });

      if (!existing) {
        await db.insert(leaveTypes).values(formatted);
        count++;
      }
    }
    console.log(`[Seed] Added ${count} new leave types`);
  }

  // 1c. Public Holidays
  const holidays = await readJsonFile('data-exports/baseline/public_holidays.json');
  if (holidays) {
    let count = 0;
    for (const h of holidays) {
      const { id, ...data } = h;
      const formatted = parseDates(data, ['createdAt', 'updatedAt']);

      const existing = await db.query.publicHolidays.findFirst({
        where: and(
          eq(publicHolidays.countryCode, formatted.countryCode),
          eq(publicHolidays.year, formatted.year),
          eq(publicHolidays.holidayDate, formatted.holidayDate),
          eq(publicHolidays.holidayName, formatted.holidayName)
        ),
      });

      if (!existing) {
        await db.insert(publicHolidays).values(formatted);
        count++;
      }
    }
    console.log(`[Seed] Added ${count} new holidays`);
  }
}

// ─── 2. Social Insurance Rules (Critical for Employer Cost) ──────────────────

async function seedSocialInsuranceData(db: any) {
  console.log('[Seed] Checking social insurance rules...');

  let count = 0;
  for (const rule of socialInsuranceRules) {
    const existing = await db.select()
      .from(countrySocialInsuranceItems)
      .where(
        and(
          eq(countrySocialInsuranceItems.countryCode, rule.countryCode),
          eq(countrySocialInsuranceItems.itemKey, rule.itemKey),
          eq(countrySocialInsuranceItems.effectiveYear, rule.effectiveYear)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(countrySocialInsuranceItems).values(rule);
      count++;
    }
  }
  console.log(`[Seed] Added ${count} new social insurance rules (total defined: ${socialInsuranceRules.length})`);
}

// ─── 3. AI Provider Configurations ──────────────────────────────────────────

async function seedAIProviderConfigs(db: any) {
  console.log('[Seed] Checking AI provider configurations...');

  const providers = [
    {
      provider: "volcengine",
      displayName: "Volcengine Doubao",
      baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
      model: "doubao-seed-1-6-251015",
      apiKeyEnv: "ARK_API_KEY",
      isEnabled: true,
      priority: 1
    },
    {
      provider: "openai",
      displayName: "OpenAI",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o",
      apiKeyEnv: "OPENAI_API_KEY",
      isEnabled: true,
      priority: 10
    }
  ];

  for (const p of providers) {
    await db.insert(aiProviderConfigs)
      .values(p as any)
      .onConflictDoUpdate({
        target: aiProviderConfigs.provider,
        set: {
          displayName: p.displayName,
          baseUrl: p.baseUrl,
          model: p.model,
          apiKeyEnv: p.apiKeyEnv,
          isEnabled: p.isEnabled,
          priority: p.priority,
          updatedAt: new Date()
        }
      });
  }
  console.log(`[Seed] Processed ${providers.length} AI providers`);
}

// ─── 4. Country Guide Chapters ──────────────────────────────────────────────

async function seedCountryGuides(db: any) {
  const guideData = await readJsonFile('country_guide_data.json');
  if (!guideData || !Array.isArray(guideData) || guideData.length === 0) {
    console.log('[Seed] No country guide data found, skipping.');
    return;
  }

  console.log(`[Seed] Checking ${guideData.length} country guide chapters...`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const ch of guideData) {
    if (!ch.countryCode || !ch.chapterKey || !ch.contentEn) {
      skipped++;
      continue;
    }

    try {
      const existing = await db.query.countryGuideChapters.findFirst({
        where: and(
          eq(countryGuideChapters.countryCode, ch.countryCode),
          eq(countryGuideChapters.chapterKey, ch.chapterKey)
        ),
      });

      if (existing) {
        const contentChanged = existing.contentEn !== ch.contentEn || existing.contentZh !== ch.contentZh;
        const versionNewer = ch.version && ch.version > (existing.version || '');

        if (contentChanged || versionNewer) {
          await db.update(countryGuideChapters)
            .set({
              part: ch.part,
              titleEn: ch.titleEn,
              titleZh: ch.titleZh,
              contentEn: ch.contentEn,
              contentZh: ch.contentZh,
              sortOrder: ch.sortOrder,
              version: ch.version || '2026-Q1',
              status: ch.status || 'published',
              updatedAt: new Date(),
            })
            .where(eq(countryGuideChapters.id, existing.id));
          updated++;
        } else {
          skipped++;
        }
      } else {
        await db.insert(countryGuideChapters).values({
          countryCode: ch.countryCode,
          part: ch.part,
          chapterKey: ch.chapterKey,
          titleEn: ch.titleEn,
          titleZh: ch.titleZh,
          contentEn: ch.contentEn,
          contentZh: ch.contentZh,
          sortOrder: ch.sortOrder,
          version: ch.version || '2026-Q1',
          status: ch.status || 'published',
        });
        created++;
      }
    } catch (err: any) {
      console.warn(`[Seed] Failed to seed ${ch.countryCode}/${ch.chapterKey}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`[Seed] Country guides: ${created} created, ${updated} updated, ${skipped} skipped.`);
}

// ─── 5. Business Migration Data (non-production only) ────────────────────────

async function seedBusinessMigrationData(db: any) {
  const data = seedData as unknown as SeedData;

  console.log(`[Seed] Checking migration data:
  - ${data.customers.length} customers
  - ${data.employees.length} employees
  - ${data.deposit_invoices.length} deposit invoices
  `);

  const defaultBillingEntity = await db.query.billingEntities.findFirst();
  const billingEntityId = defaultBillingEntity?.id || null;

  const customerMap = new Map<number, number>();
  const employeeMap = new Map<number, number>();

  // Customers
  console.log('[Seed] Syncing Customers...');
  for (let i = 0; i < data.customers.length; i++) {
    const c = data.customers[i];
    const index = i + 1;

    const existing = await db.select({ id: customers.id }).from(customers).where(eq(customers.clientCode, c.clientCode)).limit(1);

    let customerId: number;

    if (existing.length > 0) {
      customerId = existing[0].id;
    } else {
      const result = await db.insert(customers).values({
        clientCode: c.clientCode,
        companyName: c.companyName,
        country: c.country,
        primaryContactEmail: c.primaryContactEmail,
        settlementCurrency: c.settlementCurrency,
        status: 'active',
        paymentTermDays: 30,
        language: 'en',
        depositMultiplier: 2,
        billingEntityId: billingEntityId,
        notes: `Imported from migration seed. Old ID: ${c._oldCompanyId}`,
      }).returning({ id: customers.id });

      customerId = result[0].id;
      console.log(`[Seed] Customer ${c.clientCode} created`);
    }
    customerMap.set(index, customerId);
  }

  // Employees
  console.log('[Seed] Syncing Employees...');
  for (let i = 0; i < data.employees.length; i++) {
    const e = data.employees[i];
    const index = i + 1;

    const dbCustomerId = customerMap.get(e.customerIndex);
    if (!dbCustomerId) continue;

    const existing = await db.select({ id: employees.id }).from(employees).where(eq(employees.employeeCode, e.employeeCode)).limit(1);

    let employeeId: number;

    if (existing.length > 0) {
      employeeId = existing[0].id;
    } else {
      let dbStatus: "active" | "terminated" | "pending_review" = "active";
      if (e.status === 'inactive') dbStatus = 'terminated';
      else if (e.status === 'active') dbStatus = 'active';

      const result = await db.insert(employees).values({
        employeeCode: e.employeeCode,
        customerId: dbCustomerId,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        nationality: e.nationality,
        country: e.country,
        jobTitle: e.jobTitle,
        startDate: e.startDate,
        endDate: e.endDate || null,
        baseSalary: e.baseSalary.toString(),
        salaryCurrency: e.salaryCurrency,
        status: dbStatus,
        serviceType: 'eor',
        employmentType: 'long_term',
        requiresVisa: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: employees.id });

      employeeId = result[0].id;
      console.log(`[Seed] Employee ${e.employeeCode} created`);
    }
    employeeMap.set(index, employeeId);
  }

  // Invoices
  const allInvoices = [
    ...data.deposit_invoices.map(inv => ({ ...inv, source: 'deposit_invoices' })),
    ...data.inactive_deposits.map(inv => ({ ...inv, source: 'inactive_deposits' })),
    ...data.deposit_refunds.map(inv => ({ ...inv, source: 'deposit_refunds' }))
  ];

  console.log(`[Seed] Syncing ${allInvoices.length} Invoices...`);

  for (const inv of allInvoices) {
    const dbCustomerId = customerMap.get(inv.customerIndex);
    const dbEmployeeId = employeeMap.get(inv.employeeIndex);

    if (!dbCustomerId || !dbEmployeeId) continue;

    const existing = await db.select({ id: invoices.id }).from(invoices).where(eq(invoices.invoiceNumber, inv.invoiceNumber)).limit(1);

    if (existing.length > 0) continue;

    let dbType: "deposit" | "deposit_refund" = "deposit";
    if (inv.invoiceType === 'deposit_refund') dbType = 'deposit_refund';

    let dbStatus: "draft" | "sent" | "paid" = "sent";
    if (inv.status === 'draft') dbStatus = 'draft';
    else if (inv.status === 'sent') dbStatus = 'sent';

    const invResult = await db.insert(invoices).values({
      invoiceNumber: inv.invoiceNumber,
      customerId: dbCustomerId,
      billingEntityId: billingEntityId,
      invoiceType: dbType,
      invoiceMonth: inv.issueDate,
      currency: inv.currency,
      subtotal: inv.total.toString(),
      total: inv.total.toString(),
      status: dbStatus,
      dueDate: inv.dueDate,
      sentDate: dbStatus === 'sent' ? new Date(inv.issueDate) : null,
      createdAt: new Date(inv.issueDate),
      notes: `Imported from ${inv.source}`,
    }).returning({ id: invoices.id });

    const invoiceId = invResult[0].id;

    await db.insert(invoiceItems).values({
      invoiceId: invoiceId,
      employeeId: dbEmployeeId,
      description: `${dbType === 'deposit' ? 'Security Deposit' : 'Deposit Refund'} - ${inv.invoiceNumber}`,
      quantity: "1.00",
      unitPrice: inv.total.toString(),
      amount: inv.total.toString(),
      itemType: "deposit",
      localCurrency: inv.currency,
      localAmount: inv.total.toString(),
    });
  }

  console.log('[Seed] Business migration data completed.');
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

export async function seedMigration() {
  const db = await getDb();
  if (!db) {
    console.warn('[Seed] Database connection failed, skipping migration seed');
    return;
  }

  // Always seed system reference data (idempotent, safe for all environments)
  await seedSystemData(db);
  await seedSocialInsuranceData(db);
  await seedAIProviderConfigs(db);
  await seedCountryGuides(db);

  // Only seed test business data in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    await seedBusinessMigrationData(db);
  } else {
    console.log('[Seed] Production mode: skipping test business data import.');
  }

  console.log('[Seed] All seed operations completed.');
}
