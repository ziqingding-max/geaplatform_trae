import { quotationService } from "../services/quotationService";
import { getDb } from "../services/db/connection";
import { quotations } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

async function runTests() {
  const db = getDb();
  if (!db) {
    console.error("Failed to connect to DB");
    return;
  }

  console.log("=== Testing Quotation Creation ===");

  const userId = 1; // Assuming user 1 exists

  let createdId: number | undefined;

  try {
    const result = await quotationService.createQuotation({
      createdBy: userId,
      items: [
        {
          countryCode: "CN",
          regionCode: "CN-SH",
          headcount: 2,
          salary: 20000,
          currency: "CNY",
          serviceType: "eor",
          serviceFee: 500
        },
        {
          countryCode: "SG",
          headcount: 1,
          salary: 8000,
          currency: "SGD",
          serviceType: "eor",
          serviceFee: 600
        }
      ]
    });
    createdId = result.id;
    console.log("Quotation created with ID:", result.id);

  } catch (err) {
    console.error("Error creating quotation (expected if S3 missing):", err);
    // If it failed at PDF generation, the ID might not be returned, but record might exist.
    // We can query the latest quotation to check.
    const latest = await db.query.quotations.findFirst({
        orderBy: (quotations, { desc }) => [desc(quotations.id)]
    });
    if (latest) {
        createdId = latest.id;
        console.log("Found latest quotation ID:", createdId);
    }
  }

  if (createdId) {
    // Verify DB record
    const q = await db.query.quotations.findFirst({
      where: eq(quotations.id, createdId)
    });

    if (q) {
      console.log("Quotation Number:", q.quotationNumber);
      console.log("Total Monthly:", q.totalMonthly);
      console.log("Status:", q.status);
      console.log("PDF Key:", q.pdfKey || "Not generated (likely due to S3 missing)");
      
      const snapshot = JSON.parse(q.snapshotData as string);
      console.log("Snapshot Items:", snapshot.length);
      if (snapshot.length > 0) {
        console.log("Item 1 Employer Cost:", snapshot[0].employerCost);
        console.log("Item 1 Subtotal:", snapshot[0].subtotal);
      }
    } else {
      console.error("Quotation record not found!");
    }
  }
}

runTests().catch(console.error);
