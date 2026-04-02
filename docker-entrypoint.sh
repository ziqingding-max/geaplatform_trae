#!/bin/sh
set -e

echo "[Entrypoint] Syncing database schema (drizzle-kit push)..."

# Use drizzle-kit push to ensure all tables/columns exist in PostgreSQL.
# This is idempotent: it compares schema.ts against the live database and
# only creates missing tables/columns. Existing data is never deleted.
# --force skips interactive confirmation prompts in CI/Docker.
npx drizzle-kit push \
  --dialect postgresql \
  --schema ./drizzle/schema.ts \
  --url "$DATABASE_URL" \
  --force

echo "[Entrypoint] Schema sync complete."

# Run toolkit data seed (idempotent: uses DELETE + INSERT)
if [ -f /app/dist/seedToolkitData.js ]; then
  echo "[Entrypoint] Seeding toolkit data..."
  node dist/seedToolkitData.js && echo "[Entrypoint] Toolkit data seeded successfully." || echo "[Entrypoint] Warning: Toolkit seed failed, continuing startup..."
else
  echo "[Entrypoint] No seed script found, skipping."
fi

echo "[Entrypoint] Starting application..."
exec node dist/index.js
