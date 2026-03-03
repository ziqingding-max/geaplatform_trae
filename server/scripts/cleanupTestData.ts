
import "dotenv/config";
import { like, count, eq } from "drizzle-orm";
import { getDb } from "../db";
import { quotations } from "../../drizzle/schema";

async function cleanupTestData() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  console.log("Starting Test Data Cleanup...");
  console.log("--------------------------------------------------");

  // 1. Cleanup Quotations starting with 'TEST-'
  const quotationsToDelete = await db
    .select({ count: count() })
    .from(quotations)
    .where(like(quotations.quotationNumber, "TEST-%"));
  
  const countToDelete = quotationsToDelete[0]?.count || 0;
  console.log(`Found ${countToDelete} quotations with number starting with 'TEST-'`);

  if (countToDelete > 0) {
    const deletedResult = await db
      .delete(quotations)
      .where(like(quotations.quotationNumber, "TEST-%"))
      .returning({ id: quotations.id });
    
    console.log(`Deleted ${deletedResult.length} quotations.`);
  } else {
    console.log("No test quotations found to delete.");
  }

  // Future: Add cleanup for other entities if needed (e.g., employees, invoices)
  // For now, we only target quotations as requested.
  console.warn("Note: Only 'TEST-' quotations are currently targeted for cleanup.");

  console.log("--------------------------------------------------");
  console.log("Cleanup Completed.");
}

cleanupTestData().catch((err) => {
  console.error("Error running cleanup:", err);
  process.exit(1);
});
