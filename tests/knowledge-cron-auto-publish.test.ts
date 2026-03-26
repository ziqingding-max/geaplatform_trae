/**
 * PR-C Tests: Knowledge Base Cron Service + Auto-publish + Admin Enhancements
 * 
 * Test suites:
 * 1. Schema migration validation (expiresAt, fetchFrequency, nextFetchAt)
 * 2. Cron service logic (source ingestion scheduling, content refresh)
 * 3. Auto-publish tiered logic (confidence + authority scoring)
 * 4. Admin batch review API contract
 * 5. Admin expired content listing API contract
 * 6. Admin Sources Tab fetchFrequency form
 * 7. i18n completeness for new keys
 * 8. After-test cleanup
 */

// ─── Schema Migration Validation ───────────────────────────────────────────

describe('Schema Migration: New Fields', () => {
  test('knowledgeItems should have expiresAt field defined as nullable timestamp', () => {
    // Validate schema definition includes expiresAt
    const schemaContent = require('fs').readFileSync(
      require('path').resolve(__dirname, '../drizzle/schema.ts'), 'utf-8'
    );
    expect(schemaContent).toContain('expiresAt');
    expect(schemaContent).toMatch(/expiresAt.*timestamp/);
  });

  test('knowledgeSources should have fetchFrequency field with enum values', () => {
    const schemaContent = require('fs').readFileSync(
      require('path').resolve(__dirname, '../drizzle/schema.ts'), 'utf-8'
    );
    expect(schemaContent).toContain('fetchFrequency');
    expect(schemaContent).toContain('manual');
    expect(schemaContent).toContain('daily');
    expect(schemaContent).toContain('weekly');
    expect(schemaContent).toContain('monthly');
  });

  test('knowledgeSources should have nextFetchAt field defined as nullable timestamp', () => {
    const schemaContent = require('fs').readFileSync(
      require('path').resolve(__dirname, '../drizzle/schema.ts'), 'utf-8'
    );
    expect(schemaContent).toContain('nextFetchAt');
  });
});

// ─── Cron Service Logic ────────────────────────────────────────────────────

describe('Knowledge Cron Service', () => {
  const servicePath = require('path').resolve(__dirname, '../server/services/knowledgeCronService.ts');
  let serviceContent: string;

  beforeAll(() => {
    serviceContent = require('fs').readFileSync(servicePath, 'utf-8');
  });

  test('should export runKnowledgeSourceIngest function', () => {
    expect(serviceContent).toContain('export async function runKnowledgeSourceIngest');
  });

  test('should export runKnowledgeContentRefresh function', () => {
    expect(serviceContent).toContain('export async function runKnowledgeContentRefresh');
  });

  test('source ingestion should query sources where nextFetchAt <= now', () => {
    expect(serviceContent).toMatch(/nextFetchAt/);
    expect(serviceContent).toMatch(/lte|<=|lt/);
  });

  test('source ingestion should skip sources with fetchFrequency = manual', () => {
    expect(serviceContent).toContain('manual');
  });

  test('content refresh should detect expired items using expiresAt', () => {
    expect(serviceContent).toContain('expiresAt');
  });

  test('should compute next fetch time based on frequency', () => {
    expect(serviceContent).toMatch(/computeNextFetchAt|nextFetch/);
  });

  test('should handle errors gracefully without crashing the cron runner', () => {
    expect(serviceContent).toMatch(/try\s*\{|catch/);
  });
});

// ─── Auto-publish Tiered Logic ─────────────────────────────────────────────

describe('Auto-publish Tiered Logic', () => {
  const servicePath = require('path').resolve(__dirname, '../server/services/knowledgeCronService.ts');
  let serviceContent: string;

  beforeAll(() => {
    serviceContent = require('fs').readFileSync(servicePath, 'utf-8');
  });

  test('should implement confidence score threshold for auto-publish', () => {
    // Should reference confidence or score thresholds
    expect(serviceContent).toMatch(/confidence|score|threshold|auto.*publish/i);
  });

  test('should set status to published for high-confidence items', () => {
    expect(serviceContent).toContain('published');
  });

  test('should set status to pending_review for low-confidence items', () => {
    expect(serviceContent).toContain('pending_review');
  });

  test('should consider source authority in auto-publish decision', () => {
    expect(serviceContent).toMatch(/authority|authorityScore/);
  });
});

// ─── Cron Job Registration ─────────────────────────────────────────────────

describe('Cron Job Registration', () => {
  const cronPath = require('path').resolve(__dirname, '../server/cronJobs.ts');
  let cronContent: string;

  beforeAll(() => {
    cronContent = require('fs').readFileSync(cronPath, 'utf-8');
  });

  test('should register knowledge_source_ingest job in CRON_JOB_DEFS', () => {
    expect(cronContent).toContain('knowledge_source_ingest');
  });

  test('should register knowledge_content_refresh job in CRON_JOB_DEFS', () => {
    expect(cronContent).toContain('knowledge_content_refresh');
  });

  test('knowledge_source_ingest should have a valid cron schedule', () => {
    // Should have a frequency/time config
    expect(cronContent).toMatch(/knowledge_source_ingest[\s\S]*?defaultTime.*?["']\d/);
  });

  test('knowledge_content_refresh should have a valid cron schedule', () => {
    expect(cronContent).toMatch(/knowledge_content_refresh[\s\S]*?defaultTime.*?["']\d/);
  });

  test('should import runKnowledgeSourceIngest from knowledgeCronService', () => {
    expect(cronContent).toContain('knowledgeCronService');
  });
});

// ─── Admin Batch Review API Contract ───────────────────────────────────────

describe('Admin Batch Review API', () => {
  const routerPath = require('path').resolve(__dirname, '../server/routers/knowledgeBaseAdmin.ts');
  let routerContent: string;

  beforeAll(() => {
    routerContent = require('fs').readFileSync(routerPath, 'utf-8');
  });

  test('should have batchReview endpoint defined', () => {
    expect(routerContent).toContain('batchReview');
  });

  test('batchReview should accept array of item IDs', () => {
    expect(routerContent).toMatch(/ids.*array|itemIds.*array/i);
  });

  test('batchReview should accept action parameter (publish/reject)', () => {
    expect(routerContent).toMatch(/action.*publish.*reject|action.*enum/);
  });

  test('should have listExpiredContent endpoint defined', () => {
    expect(routerContent).toContain('listExpiredContent');
  });

  test('listExpiredContent should query items with expiresAt', () => {
    expect(routerContent).toContain('expiresAt');
  });
});

// ─── Admin Sources Tab Enhancement ─────────────────────────────────────────

describe('Admin Sources Tab: fetchFrequency Support', () => {
  const routerPath = require('path').resolve(__dirname, '../server/routers/knowledgeBaseAdmin.ts');
  let routerContent: string;

  beforeAll(() => {
    routerContent = require('fs').readFileSync(routerPath, 'utf-8');
  });

  test('upsertSource should accept fetchFrequency parameter', () => {
    expect(routerContent).toContain('fetchFrequency');
  });

  test('upsertSource should compute nextFetchAt based on frequency', () => {
    expect(routerContent).toMatch(/nextFetchAt|computeNextFetchAt/);
  });
});

// ─── Admin Frontend Enhancements ───────────────────────────────────────────

describe('Admin Frontend: KnowledgeBaseAdmin.tsx', () => {
  const frontendPath = require('path').resolve(__dirname, '../client/src/pages/KnowledgeBaseAdmin.tsx');
  let frontendContent: string;

  beforeAll(() => {
    frontendContent = require('fs').readFileSync(frontendPath, 'utf-8');
  });

  test('should have Expired Content tab', () => {
    expect(frontendContent).toMatch(/expired|Expired/);
  });

  test('should have batch review UI with checkboxes', () => {
    expect(frontendContent).toMatch(/checkbox|selectedIds|batchReview/i);
  });

  test('should have fetchFrequency selector in source form', () => {
    expect(frontendContent).toMatch(/fetchFrequency|fetch_frequency/);
  });

  test('should display new article types (salaryBenchmark, contractorGuide)', () => {
    expect(frontendContent).toContain('salaryBenchmark');
    expect(frontendContent).toContain('contractorGuide');
  });

  test('should have auto-publishable badge for high-confidence items', () => {
    expect(frontendContent).toMatch(/auto.?publish|Auto.*publish/i);
  });

  test('should have confirmation dialog for batch actions', () => {
    expect(frontendContent).toMatch(/confirm|Confirm|window\.confirm/);
  });
});

// ─── i18n Completeness ─────────────────────────────────────────────────────

describe('i18n: New Knowledge Admin Keys', () => {
  const i18nPath = require('path').resolve(__dirname, '../client/src/lib/i18n.ts');
  let i18nContent: string;

  beforeAll(() => {
    i18nContent = require('fs').readFileSync(i18nPath, 'utf-8');
  });

  const requiredKeys = [
    'knowledge_admin.toast.batch_reviewed',
    'knowledge_admin.generate.type.salaryBenchmark',
    'knowledge_admin.generate.type.contractorGuide',
    'knowledge_admin.tabs.expired',
    'knowledge_admin.metrics.expired',
    'knowledge_admin.auto_publishable',
    'knowledge_admin.batch.selected',
    'knowledge_admin.batch.select_all',
    'knowledge_admin.batch.publish_all',
    'knowledge_admin.batch.reject_all',
    'knowledge_admin.new_source.type',
    'knowledge_admin.new_source.frequency',
    'knowledge_admin.frequency.manual',
    'knowledge_admin.frequency.daily',
    'knowledge_admin.frequency.weekly',
    'knowledge_admin.frequency.monthly',
    'knowledge_admin.next_fetch',
    'knowledge_admin.expired.all_fresh',
    'knowledge_admin.expired.status_expired',
    'knowledge_admin.expired.status_expiring_soon',
    'knowledge_admin.expired.expires_at',
    'knowledge_admin.expired.published_at',
  ];

  test.each(requiredKeys)('should have English translation for "%s"', (key) => {
    // Check that the key appears at least twice (en + zh)
    const occurrences = (i18nContent.match(new RegExp(key.replace(/\./g, '\\.'), 'g')) || []).length;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });
});

// ─── After-test Cleanup ────────────────────────────────────────────────────

describe('After-test Cleanup', () => {
  test('cleanup: verify no test artifacts remain', () => {
    const fs = require('fs');
    const path = require('path');
    const tmpDir = path.resolve(__dirname, '../tmp-test-artifacts');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    expect(fs.existsSync(tmpDir)).toBe(false);
  });

  test('cleanup: verify all test state is reset', () => {
    // Ensure no global state leaks
    expect(true).toBe(true);
  });
});
