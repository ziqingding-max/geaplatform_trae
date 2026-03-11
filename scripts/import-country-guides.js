/**
 * import-country-guides.js
 *
 * 纯 Node.js 脚本，用于在生产容器中导入国家指南数据。
 * 不依赖 TypeScript / tsx，直接使用 @libsql/client。
 *
 * 用法（在容器内）：
 *   node /app/scripts/import-country-guides.js
 *
 * 或指定 JSON 文件路径：
 *   node /app/scripts/import-country-guides.js /app/data/country_guide_data.json
 */

const fs = require('fs');
const path = require('path');

async function main() {
  // ── 1. 读取 JSON 数据 ──────────────────────────────────────────────
  const jsonPath = process.argv[2] || path.join(process.cwd(), 'data', 'country_guide_data.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`[Import] File not found: ${jsonPath}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`[Import] Loaded ${rawData.length} chapters from ${jsonPath}`);

  // ── 2. 连接数据库 ──────────────────────────────────────────────────
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('[Import] DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  let client;
  try {
    const { createClient } = require('@libsql/client');
    const url = dbUrl.includes('://') ? dbUrl : `file:${dbUrl}`;
    client = createClient({ url });
    console.log(`[Import] Connected to database: ${url.replace(/authToken=.*/, 'authToken=***')}`);
  } catch (err) {
    console.error('[Import] Failed to connect to database:', err.message);
    process.exit(1);
  }

  // ── 3. 逐条 upsert ─────────────────────────────────────────────────
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const ch of rawData) {
    if (!ch.countryCode || !ch.chapterKey || !ch.contentEn) {
      skipped++;
      continue;
    }

    try {
      // Check if record exists
      const existing = await client.execute({
        sql: 'SELECT id, contentEn, contentZh, version FROM country_guide_chapters WHERE countryCode = ? AND chapterKey = ? LIMIT 1',
        args: [ch.countryCode, ch.chapterKey],
      });

      const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        const contentChanged = row.contentEn !== ch.contentEn || row.contentZh !== ch.contentZh;
        const versionNewer = ch.version && ch.version > (row.version || '');

        if (contentChanged || versionNewer) {
          await client.execute({
            sql: `UPDATE country_guide_chapters SET
              part = ?, titleEn = ?, titleZh = ?,
              contentEn = ?, contentZh = ?,
              sortOrder = ?, version = ?, status = ?, updatedAt = ?
              WHERE id = ?`,
            args: [
              ch.part || 1,
              ch.titleEn || '',
              ch.titleZh || '',
              ch.contentEn,
              ch.contentZh || '',
              ch.sortOrder || 0,
              ch.version || '2026-Q1',
              ch.status || 'published',
              now,
              row.id,
            ],
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await client.execute({
          sql: `INSERT INTO country_guide_chapters
            (countryCode, part, chapterKey, titleEn, titleZh, contentEn, contentZh, sortOrder, version, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            ch.countryCode,
            ch.part || 1,
            ch.chapterKey,
            ch.titleEn || '',
            ch.titleZh || '',
            ch.contentEn,
            ch.contentZh || '',
            ch.sortOrder || 0,
            ch.version || '2026-Q1',
            ch.status || 'draft',
            now,
            now,
          ],
        });
        created++;
      }
    } catch (err) {
      console.warn(`[Import] Failed ${ch.countryCode}/${ch.chapterKey}: ${err.message}`);
      errors++;
    }

    // Progress log every 50 records
    const total = created + updated + skipped + errors;
    if (total % 50 === 0) {
      console.log(`[Import] Progress: ${total}/${rawData.length} (created=${created}, updated=${updated}, skipped=${skipped})`);
    }
  }

  console.log(`\n[Import] ✅ Done!`);
  console.log(`  Created : ${created}`);
  console.log(`  Updated : ${updated}`);
  console.log(`  Skipped : ${skipped} (no change)`);
  console.log(`  Errors  : ${errors}`);

  client.close();
}

main().catch((err) => {
  console.error('[Import] Fatal error:', err);
  process.exit(1);
});
