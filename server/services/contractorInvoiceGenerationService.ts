
import { getDb } from "./db/connection";
import {
  contractors,
  contractorInvoices,
  contractorInvoiceItems,
  contractorMilestones,
  contractorAdjustments,
  InsertContractorInvoice,
  InsertContractorInvoiceItem,
} from "../../drizzle/schema";
import { eq, and, sql, isNull, or } from "drizzle-orm";

/**
 * Service to generate invoices for Contractors.
 * Handles:
 * 1. Monthly fixed payments (auto-generated on cycle)
 * 2. Approved Milestones (auto-generated when approved)
 */
export const ContractorInvoiceGenerationService = {
  /**
   * Main entry point to process all pending invoices.
   * Recommended to run via Cron daily.
   */
  async processAll(targetDate: Date = new Date()): Promise<{ generated: number; errors: string[] }> {
    const db = await getDb();
    if (!db) return { generated: 0, errors: ["DB Connection Failed"] };

    let generatedCount = 0;
    const errors: string[] = [];

    // 1. Process Monthly Contractors
    try {
      const monthlyCount = await this.processMonthlyInvoices(targetDate);
      generatedCount += monthlyCount;
    } catch (e) {
      errors.push(`Monthly Invoice Error: ${e instanceof Error ? e.message : String(e)}`);
    }

    // 2. Process Semi-Monthly Contractors
    try {
      const semiMonthlyCount = await this.processSemiMonthlyInvoices(targetDate);
      generatedCount += semiMonthlyCount;
    } catch (e) {
      errors.push(`Semi-Monthly Invoice Error: ${e instanceof Error ? e.message : String(e)}`);
    }

    // 3. Process Approved Milestones
    try {
      const milestoneCount = await this.processMilestoneInvoices(targetDate);
      generatedCount += milestoneCount;
    } catch (e) {
      errors.push(`Milestone Invoice Error: ${e instanceof Error ? e.message : String(e)}`);
    }

    return { generated: generatedCount, errors };
  },

  /**
   * Generate invoices for active contractors with 'semi_monthly' frequency.
   * Cycles:
   * 1. 1st - 15th (Run on 15th)
   * 2. 16th - End of Month (Run on Last Day)
   */
  async processSemiMonthlyInvoices(targetDate: Date): Promise<number> {
    const db = await getDb();
    if (!db) return 0;

    const d = targetDate.getDate();
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const lastDayOfMonth = new Date(y, m + 1, 0).getDate();

    let periodStart = "";
    let periodEnd = "";
    let isCycleRun = false;

    // Check if today is a run date
    if (d === 15) {
      // First cycle
      periodStart = new Date(Date.UTC(y, m, 1)).toISOString().split("T")[0];
      periodEnd = new Date(Date.UTC(y, m, 15)).toISOString().split("T")[0];
      isCycleRun = true;
    } else if (d === lastDayOfMonth) {
      // Second cycle
      periodStart = new Date(Date.UTC(y, m, 16)).toISOString().split("T")[0];
      periodEnd = new Date(Date.UTC(y, m + 1, 0)).toISOString().split("T")[0];
      isCycleRun = true;
    }

    // If not a cycle run date, skip (unless manual override logic is added later)
    if (!isCycleRun) return 0;

    const invoiceDate = targetDate.toISOString().split("T")[0];

    // 1. Find eligible contractors
    const eligibleContractors = await db
      .select()
      .from(contractors)
      .where(
        and(
          eq(contractors.status, "active"),
          eq(contractors.paymentFrequency, "semi_monthly"),
          or(eq(contractors.rateType, "fixed_monthly"))
        )
      );

    let count = 0;

    for (const contractor of eligibleContractors) {
      // 2. Check existence
      const existing = await db
        .select()
        .from(contractorInvoices)
        .where(
          and(
            eq(contractorInvoices.contractorId, contractor.id),
            eq(contractorInvoices.periodStart, periodStart),
            eq(contractorInvoices.periodEnd, periodEnd)
          )
        )
        .limit(1);

      if (existing.length > 0) continue;

      // 3. Create Invoice
      const invoiceNumber = `CTR-INV-${y}${String(m + 1).padStart(2, "0")}-${d === 15 ? "1" : "2"}-${contractor.id}-${Math.floor(Math.random() * 1000)}`;
      
      let totalAmount = 0;
      const currency = contractor.currency;
      const lineItems: InsertContractorInvoiceItem[] = [];

      // A. Half Monthly Rate
      if (contractor.rateAmount) {
        const amount = parseFloat(contractor.rateAmount);
        totalAmount += amount;
        lineItems.push({
          invoiceId: 0,
          description: `Semi-Monthly Service Fee - ${periodStart} to ${periodEnd}`,
          quantity: "1",
          unitPrice: amount.toFixed(2),
          amount: amount.toFixed(2),
          itemType: "service_fee",
        });
      }

      // B. Adjustments (Only for Second Cycle / End of Month)
      const adjustmentsToLink: number[] = [];
      
      // Only include adjustments if this is the second cycle (End of Month)
      if (d === lastDayOfMonth) {
        const pendingAdjustments = await db
          .select()
          .from(contractorAdjustments)
          .where(
            and(
              eq(contractorAdjustments.contractorId, contractor.id),
              eq(contractorAdjustments.status, "approved"),
              isNull(contractorAdjustments.invoiceId)
            )
          );

        for (const adj of pendingAdjustments) {
          if (adj.currency !== currency) continue;
          const amount = parseFloat(adj.amount);
          const isDeduction = adj.type === "deduction";
          const signedAmount = isDeduction ? -amount : amount;
          totalAmount += signedAmount;
          lineItems.push({
            invoiceId: 0,
            description: `${adj.type.toUpperCase()}: ${adj.description}`,
            quantity: "1",
            unitPrice: signedAmount.toFixed(2),
            amount: signedAmount.toFixed(2),
            itemType: isDeduction ? "adjustment" : (adj.type === "expense" ? "expense" : "adjustment"),
            adjustmentId: adj.id,
          });
          adjustmentsToLink.push(adj.id);
        }
      }

      if (lineItems.length === 0) continue;

      // Insert
      const invoiceData: InsertContractorInvoice = {
        invoiceNumber,
        contractorId: contractor.id,
        customerId: contractor.customerId,
        invoiceDate,
        periodStart,
        periodEnd,
        currency,
        totalAmount: totalAmount.toFixed(2),
        status: "draft",
      };

      const result = await db.insert(contractorInvoices).values(invoiceData).returning();
      const invoice = result[0];

      if (lineItems.length > 0) {
        const itemsWithId = lineItems.map(item => ({ ...item, invoiceId: invoice.id }));
        await db.insert(contractorInvoiceItems).values(itemsWithId);
      }

      for (const adjId of adjustmentsToLink) {
        await db.update(contractorAdjustments)
          .set({ invoiceId: invoice.id, status: "invoiced" })
          .where(eq(contractorAdjustments.id, adjId));
      }

      count++;
    }

    return count;
  },

  /**
   * Generate invoices for active contractors with 'monthly' frequency.
   * Generates one invoice per month containing:
   * - Fixed Monthly Rate
   * - Any approved, uninvoiced adjustments
   */
  async processMonthlyInvoices(targetDate: Date): Promise<number> {
    const db = await getDb();
    if (!db) return 0;

    let count = 0;
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth(); // 0-indexed
    // Invoice Period: First to Last day of current month
    const periodStart = new Date(Date.UTC(y, m, 1)).toISOString().split("T")[0];
    const periodEnd = new Date(Date.UTC(y, m + 1, 0)).toISOString().split("T")[0];
    const invoiceDate = targetDate.toISOString().split("T")[0]; // Issue date

    // 1. Find eligible contractors
    const eligibleContractors = await db
      .select()
      .from(contractors)
      .where(
        and(
          eq(contractors.status, "active"),
          eq(contractors.paymentFrequency, "monthly"),
          // Only process if rateType is fixed_monthly (otherwise they might be hourly which needs timesheets)
          or(eq(contractors.rateType, "fixed_monthly"))
        )
      );

    for (const contractor of eligibleContractors) {
      // 2. Check if invoice already exists for this period
      const existing = await db
        .select()
        .from(contractorInvoices)
        .where(
          and(
            eq(contractorInvoices.contractorId, contractor.id),
            eq(contractorInvoices.periodStart, periodStart),
            eq(contractorInvoices.periodEnd, periodEnd)
          )
        )
        .limit(1);

      if (existing.length > 0) continue; // Already generated

      // 3. Create Invoice Logic
      // Generate Invoice Number: CTR-INV-{Year}{Month}-{ContractorID}-{Random}
      const invoiceNumber = `CTR-INV-${y}${String(m + 1).padStart(2, "0")}-${contractor.id}-${Math.floor(Math.random() * 1000)}`;

      // Calculate Total
      let totalAmount = 0;
      const currency = contractor.currency;
      const lineItems: InsertContractorInvoiceItem[] = [];

      // A. Fixed Rate Item
      if (contractor.rateAmount) {
        const amount = parseFloat(contractor.rateAmount);
        totalAmount += amount;
        lineItems.push({
          invoiceId: 0, // Placeholder
          description: `Monthly Service Fee - ${periodStart} to ${periodEnd}`,
          quantity: "1",
          unitPrice: amount.toFixed(2),
          amount: amount.toFixed(2),
          itemType: "service_fee",
        });
      }

      // B. Approved Adjustments (Bonus/Expense)
      // Find adjustments that are approved, not invoiced
      const pendingAdjustments = await db
        .select()
        .from(contractorAdjustments)
        .where(
          and(
            eq(contractorAdjustments.contractorId, contractor.id),
            eq(contractorAdjustments.status, "approved"),
            isNull(contractorAdjustments.invoiceId)
          )
        );

      const adjustmentsToLink: number[] = [];

      for (const adj of pendingAdjustments) {
        // Simple currency check - skip if currency mismatch (should handle conversion in real app)
        if (adj.currency !== currency) continue;

        const amount = parseFloat(adj.amount);
        // type: bonus, expense, deduction
        // Deduction should subtract
        const isDeduction = adj.type === "deduction";
        const signedAmount = isDeduction ? -amount : amount;

        totalAmount += signedAmount;

        lineItems.push({
          invoiceId: 0, // Placeholder
          description: `${adj.type.toUpperCase()}: ${adj.description}`,
          quantity: "1",
          unitPrice: signedAmount.toFixed(2),
          amount: signedAmount.toFixed(2),
          itemType: isDeduction ? "adjustment" : (adj.type === "expense" ? "expense" : "adjustment"),
          adjustmentId: adj.id,
        });
        
        adjustmentsToLink.push(adj.id);
      }

      // If no items (e.g. no rate and no adjustments), skip
      if (lineItems.length === 0) continue;

      // Insert Invoice
      const invoiceData: InsertContractorInvoice = {
        invoiceNumber,
        contractorId: contractor.id,
        customerId: contractor.customerId,
        invoiceDate,
        periodStart,
        periodEnd,
        currency,
        totalAmount: totalAmount.toFixed(2),
        status: "draft",
      };

      const result = await db.insert(contractorInvoices).values(invoiceData).returning();
      const invoice = result[0];

      // Insert Items
      if (lineItems.length > 0) {
        const itemsWithId = lineItems.map(item => ({ ...item, invoiceId: invoice.id }));
        await db.insert(contractorInvoiceItems).values(itemsWithId);
      }

      // Update Adjustments to link to invoice
      for (const adjId of adjustmentsToLink) {
        await db.update(contractorAdjustments)
          .set({ invoiceId: invoice.id, status: "invoiced" })
          .where(eq(contractorAdjustments.id, adjId));
      }

      count++;
    }

    return count;
  },

  /**
   * Generate invoices for Approved Milestones.
   * Creates one invoice per milestone (plus any pending adjustments).
   */
  async processMilestoneInvoices(targetDate: Date): Promise<number> {
    const db = await getDb();
    if (!db) return 0;

    let count = 0;
    const invoiceDate = targetDate.toISOString().split("T")[0];

    // 1. Find Approved Milestones without Invoice
    const approvedMilestones = await db
      .select()
      .from(contractorMilestones)
      .where(
        and(
          eq(contractorMilestones.status, "approved"),
          isNull(contractorMilestones.invoiceId)
        )
      );

    for (const milestone of approvedMilestones) {
      // Get Contractor
      const contractorResult = await db.select().from(contractors).where(eq(contractors.id, milestone.contractorId)).limit(1);
      if (contractorResult.length === 0) continue;
      const contractor = contractorResult[0];

      // Create Invoice Number
      const invoiceNumber = `CTR-MIL-${milestone.id}-${Math.floor(Math.random() * 1000)}`;

      const lineItems: InsertContractorInvoiceItem[] = [];
      let totalAmount = parseFloat(milestone.amount);

      // A. Milestone Item
      lineItems.push({
        invoiceId: 0,
        description: `Milestone: ${milestone.title}`,
        quantity: "1",
        unitPrice: milestone.amount,
        amount: milestone.amount,
        itemType: "milestone",
        milestoneId: milestone.id,
      });

      // B. Sweep Pending Adjustments (Optional strategy: Attach to next invoice)
      // Only attach if currency matches
      const pendingAdjustments = await db
        .select()
        .from(contractorAdjustments)
        .where(
          and(
            eq(contractorAdjustments.contractorId, contractor.id),
            eq(contractorAdjustments.status, "approved"),
            isNull(contractorAdjustments.invoiceId)
          )
        );

      const adjustmentsToLink: number[] = [];

      for (const adj of pendingAdjustments) {
        if (adj.currency !== milestone.currency) continue;

        const amount = parseFloat(adj.amount);
        const isDeduction = adj.type === "deduction";
        const signedAmount = isDeduction ? -amount : amount;

        totalAmount += signedAmount;

        lineItems.push({
          invoiceId: 0,
          description: `${adj.type.toUpperCase()}: ${adj.description}`,
          quantity: "1",
          unitPrice: signedAmount.toFixed(2),
          amount: signedAmount.toFixed(2),
          itemType: isDeduction ? "adjustment" : (adj.type === "expense" ? "expense" : "adjustment"),
          adjustmentId: adj.id,
        });
        
        adjustmentsToLink.push(adj.id);
      }

      // Insert Invoice
      const invoiceData: InsertContractorInvoice = {
        invoiceNumber,
        contractorId: contractor.id,
        customerId: contractor.customerId,
        invoiceDate,
        currency: milestone.currency,
        totalAmount: totalAmount.toFixed(2),
        status: "draft",
      };

      const result = await db.insert(contractorInvoices).values(invoiceData).returning();
      const invoice = result[0];

      // Insert Items
      const itemsWithId = lineItems.map(item => ({ ...item, invoiceId: invoice.id }));
      await db.insert(contractorInvoiceItems).values(itemsWithId);

      // Update Milestone
      await db.update(contractorMilestones)
        .set({ invoiceId: invoice.id })
        .where(eq(contractorMilestones.id, milestone.id));

      // Update Adjustments
      for (const adjId of adjustmentsToLink) {
        await db.update(contractorAdjustments)
          .set({ invoiceId: invoice.id, status: "invoiced" })
          .where(eq(contractorAdjustments.id, adjId));
      }

      count++;
    }

    return count;
  }
};
