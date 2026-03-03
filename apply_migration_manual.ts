
import { getDb } from "./server/services/db/connection";
import { sql } from "drizzle-orm";

async function main() {
  const db = getDb();
  if (!db) {
    console.error("Failed to connect to DB");
    process.exit(1);
  }

  console.log("Applying manual migration 0004...");

  try {
    await db.run(sql`ALTER TABLE contractor_milestones ADD approvedBy integer`);
    console.log("Added approvedBy to contractor_milestones");
  } catch (e) {
    console.warn("Error adding approvedBy (maybe exists):", e);
  }

  try {
    await db.run(sql`ALTER TABLE contractors ADD defaultApproverId integer`);
    console.log("Added defaultApproverId to contractors");
  } catch (e) {
    console.warn("Error adding defaultApproverId (maybe exists):", e);
  }

  console.log("Done.");
}

main();
