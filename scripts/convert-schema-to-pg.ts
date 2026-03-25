/**
 * Automated Schema Conversion Script: SQLite → PostgreSQL
 * 
 * This script reads schema.ts and aor-schema.ts and performs the following transformations:
 * 1. Import: drizzle-orm/sqlite-core → drizzle-orm/pg-core
 * 2. sqliteTable → pgTable
 * 3. integer("col", { mode: "boolean" }) → boolean("col")
 * 4. integer("col", { mode: "timestamp_ms" }) → timestamp("col", { withTimezone: true, mode: "date" })
 *    - .defaultNow() stays as-is (pgTable timestamp supports it natively)
 * 5. integer("col", { mode: "timestamp" }) → timestamp("col", { withTimezone: true, mode: "date" })
 * 6. integer("col").primaryKey({ autoIncrement: true }) → serial("col").primaryKey()
 * 7. text("col", { mode: "json" }) → jsonb("col")
 * 8. real("col") → doublePrecision("col")
 * 9. Update imports to include new pg-core types
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function convertSchemaFile(filePath: string): void {
  let content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  console.log(`\n=== Converting ${fileName} ===`);

  // 1. Replace import source
  content = content.replace(
    /from\s+["']drizzle-orm\/sqlite-core["']/g,
    'from "drizzle-orm/pg-core"'
  );
  console.log('  ✓ Import source: sqlite-core → pg-core');

  // 2. Replace sqliteTable → pgTable
  content = content.replace(/sqliteTable/g, 'pgTable');
  console.log('  ✓ sqliteTable → pgTable');

  // 3. Replace integer("col", { mode: "boolean" }) → boolean("col")
  // Pattern: integer("colName", { mode: "boolean" })
  content = content.replace(
    /integer\("(\w+)",\s*\{\s*mode:\s*"boolean"\s*\}\)/g,
    'boolean("$1")'
  );
  console.log('  ✓ integer({ mode: "boolean" }) → boolean()');

  // 4. Replace integer("col", { mode: "timestamp_ms" }) → timestamp("col", { withTimezone: true, mode: "date" })
  content = content.replace(
    /integer\("(\w+)",\s*\{\s*mode:\s*"timestamp_ms"\s*\}\)/g,
    'timestamp("$1", { withTimezone: true, mode: "date" })'
  );
  console.log('  ✓ integer({ mode: "timestamp_ms" }) → timestamp({ withTimezone: true })');

  // 5. Replace integer("col", { mode: "timestamp" }) → timestamp("col", { withTimezone: true, mode: "date" })
  content = content.replace(
    /integer\("(\w+)",\s*\{\s*mode:\s*"timestamp"\s*\}\)/g,
    'timestamp("$1", { withTimezone: true, mode: "date" })'
  );
  console.log('  ✓ integer({ mode: "timestamp" }) → timestamp({ withTimezone: true })');

  // 6. Replace integer("col").primaryKey({ autoIncrement: true }) → serial("col").primaryKey()
  content = content.replace(
    /integer\("(\w+)"\)\.primaryKey\(\{\s*autoIncrement:\s*true\s*\}\)/g,
    'serial("$1").primaryKey()'
  );
  console.log('  ✓ integer().primaryKey({ autoIncrement: true }) → serial().primaryKey()');

  // 7. Replace text("col", { mode: "json" }) → jsonb("col")
  content = content.replace(
    /text\("(\w+)",\s*\{\s*mode:\s*"json"\s*\}\)/g,
    'jsonb("$1")'
  );
  console.log('  ✓ text({ mode: "json" }) → jsonb()');

  // 8. Replace real("col") → doublePrecision("col")
  content = content.replace(
    /real\("(\w+)"\)/g,
    'doublePrecision("$1")'
  );
  console.log('  ✓ real() → doublePrecision()');

  // 9. Update import block to include new pg-core types
  // We need: serial, boolean, timestamp, jsonb, doublePrecision, pgTable, text, integer, uniqueIndex, index
  const needsSerial = content.includes('serial(');
  const needsBoolean = content.includes('boolean(');
  const needsTimestamp = content.includes('timestamp(');
  const needsJsonb = content.includes('jsonb(');
  const needsDoublePrecision = content.includes('doublePrecision(');
  const needsInteger = content.includes('integer(');
  const needsText = content.includes('text(');
  const needsReal = content.includes('real('); // should be gone after conversion
  const needsUniqueIndex = content.includes('uniqueIndex(');
  const needsIndex = content.includes('index(');

  const imports: string[] = [];
  if (needsSerial) imports.push('serial');
  if (needsInteger) imports.push('integer');
  if (needsBoolean) imports.push('boolean');
  if (needsTimestamp) imports.push('timestamp');
  if (needsText) imports.push('text');
  if (needsJsonb) imports.push('jsonb');
  if (needsDoublePrecision) imports.push('doublePrecision');
  if (needsReal) imports.push('real');
  imports.push('pgTable');
  if (needsUniqueIndex) imports.push('uniqueIndex');
  if (needsIndex) imports.push('index');

  // Replace the existing import block
  const importRegex = /import\s*\{[^}]+\}\s*from\s*"drizzle-orm\/pg-core";/;
  const newImport = `import {\n  ${imports.join(',\n  ')},\n} from "drizzle-orm/pg-core";`;
  content = content.replace(importRegex, newImport);
  console.log(`  ✓ Updated imports: ${imports.join(', ')}`);

  // Write back
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  ✓ Written to ${filePath}`);

  // Stats
  const pgTableCount = (content.match(/pgTable\(/g) || []).length;
  const booleanCount = (content.match(/boolean\("/g) || []).length;
  const timestampCount = (content.match(/timestamp\("/g) || []).length;
  const serialCount = (content.match(/serial\("/g) || []).length;
  const jsonbCount = (content.match(/jsonb\("/g) || []).length;
  console.log(`  Stats: ${pgTableCount} tables, ${serialCount} serial PKs, ${booleanCount} booleans, ${timestampCount} timestamps, ${jsonbCount} jsonb`);
}

// Convert both schema files
convertSchemaFile(path.resolve(__dirname, '../drizzle/schema.ts'));
convertSchemaFile(path.resolve(__dirname, '../drizzle/aor-schema.ts'));

console.log('\n=== Conversion complete! ===');
