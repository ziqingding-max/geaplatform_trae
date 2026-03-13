#!/bin/sh
set -e

echo "[Entrypoint] Running database migrations..."

# Apply all migration SQL files in order
for sql_file in /app/drizzle/0*.sql; do
  if [ -f "$sql_file" ]; then
    echo "[Entrypoint] Applying migration: $(basename $sql_file)"
    # Extract DATABASE_URL path (remove file: prefix)
    DB_PATH=$(echo "$DATABASE_URL" | sed 's|^file:||')
    
    # Ensure the directory exists
    mkdir -p "$(dirname "$DB_PATH")" 2>/dev/null || true
    
    # Split SQL file by statement-breakpoint and execute each statement
    # Use node to run the migration since we need libsql
    node -e "
      const fs = require('fs');
      const { createClient } = require('@libsql/client');
      
      async function runMigration() {
        const client = createClient({ url: process.env.DATABASE_URL });
        const sql = fs.readFileSync('$sql_file', 'utf8');
        
        // Split by --> statement-breakpoint
        const statements = sql.split('--> statement-breakpoint')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        for (const stmt of statements) {
          try {
            await client.execute(stmt);
          } catch (err) {
            // Ignore 'already exists' and 'duplicate column' errors for idempotent migrations
            if (!err.message.includes('already exists') && !err.message.includes('duplicate column')) {
              console.warn('[Migration] Warning:', err.message.substring(0, 100));
            }
          }
        }
        client.close();
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
