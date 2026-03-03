import { calculationService } from "../services/calculationService";
import { quotationService } from "../services/quotationService";
import { getDb } from "../services/db/connection";
import { quotations, countryGuideChapters, salaryBenchmarks } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

async function runE2ETest() {
  const db = getDb();
  if (!db) {
    console.error("Failed to connect to DB");
    process.exit(1);
  }

  console.log("=== Starting E2E Flow Verification ===\n");

  // 1. Validate Social Insurance Calculation Engine (The Core)
  console.log("[1/4] Testing Calculation Engine...");
  try {
    // Test Case A: China Shanghai (High Salary - Capped)
    const cnResult = await calculationService.calculateSocialInsurance({
      countryCode: "CN",
      regionCode: "CN-SH",
      year: 2025,
      salary: 50000
    });
    
    if (parseFloat(cnResult.totalEmployer) > 0 && parseFloat(cnResult.totalCost) > 50000) {
       console.log(`  ✅ CN-SH Calculation: Base 50k -> Employer Cost ${cnResult.totalEmployer} (Pass)`);
    } else {
       console.error(`  ❌ CN-SH Calculation Failed: ${JSON.stringify(cnResult)}`);
    }

    // Test Case B: Singapore (Age based)
    const sgResult = await calculationService.calculateSocialInsurance({
        countryCode: "SG",
        year: 2025,
        salary: 6000,
        age: 30
    });
    if (parseFloat(sgResult.totalEmployer) > 0) {
        console.log(`  ✅ SG Calculation: Base 6k -> Employer Cost ${sgResult.totalEmployer} (Pass)`);
    } else {
        console.error(`  ❌ SG Calculation Failed`);
    }

  } catch (err) {
    console.error("  ❌ Engine Error:", err);
  }

  // 2. Validate Quotation System (Admin Side)
  console.log("\n[2/4] Testing Quotation System (Admin)...");
  let quotationId: number | undefined;
  try {
    const quote = await quotationService.createQuotation({
        createdBy: 1, // System User
        items: [
            {
                countryCode: "CN",
                regionCode: "CN-BJ",
                headcount: 1,
                salary: 30000,
                currency: "CNY",
                serviceType: "eor",
                serviceFee: 500
            },
            {
                countryCode: "US",
                headcount: 1,
                salary: 8000,
                currency: "USD",
                serviceType: "aor",
                serviceFee: 200
            }
        ]
    });
    quotationId = quote.id;
    console.log(`  ✅ Quotation Created: ID ${quote.id} (Pass)`);

    // Verify DB
    const dbQuote = await db.query.quotations.findFirst({ where: eq(quotations.id, quote.id) });
    if (dbQuote && dbQuote.snapshotData) {
        const items = JSON.parse(dbQuote.snapshotData as string);
        console.log(`  ✅ Snapshot Data: ${items.length} items preserved (Pass)`);
    } else {
        console.error(`  ❌ Quotation Persistence Failed`);
    }

  } catch (err) {
     console.error("  ❌ Quotation Error:", err);
  }

  // 3. Validate Portal Toolkit (Client Side Simulation)
  console.log("\n[3/4] Testing Portal Toolkit Data...");
  try {
    // Country Guide
    const guides = await db.select().from(countryGuideChapters).where(eq(countryGuideChapters.countryCode, "CN"));
    console.log(`  ✅ Country Guide (CN): Found ${guides.length} chapters`);

    // Benchmarks
    const benchmarks = await db.select().from(salaryBenchmarks).where(eq(salaryBenchmarks.countryCode, "CN"));
    console.log(`  ✅ Salary Benchmarks (CN): Found ${benchmarks.length} records`);

  } catch (err) {
    console.error("  ❌ Toolkit Error:", err);
  }

  console.log("\n=== E2E Verification Completed ===");
}

runE2ETest().catch(console.error);
