#!/bin/sh
set -e

echo "[Entrypoint] Running database migrations..."

# Apply all migration SQL files in order using PostgreSQL
for sql_file in /app/drizzle/0*.sql; do
  if [ -f "$sql_file" ]; then
    echo "[Entrypoint] Applying migration: $(basename $sql_file)"
    
    # Use node with postgres.js to run the migration
    node -e "
      const postgres = require('postgres');
      const fs = require('fs');
      
      async function runMigration() {
        const sql = postgres(process.env.DATABASE_URL, { max: 1 });
        const content = fs.readFileSync('$sql_file', 'utf8');
        
        // Split by --> statement-breakpoint
        const statements = content.split('--> statement-breakpoint')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        for (const stmt of statements) {
          try {
            await sql.unsafe(stmt);
          } catch (err) {
            // Ignore known idempotent migration errors:
            // - 'already exists': table/index/column already created
            // - 'duplicate': duplicate key or column
            const msg = err.message || '';
            if (!msg.includes('already exists') && !msg.includes('duplicate')) {
              console.warn('[Migration] Warning:', msg.substring(0, 150));
            }
          }
        }
        await sql.end();
      }
      
      runMigration().catch(err => {
        console.error('[Migration] Error:', err.message);
        process.exit(1);
      });
    "
  fi
done

echo "[Entrypoint] Migrations complete. Starting application..."
exec node dist/index.js
