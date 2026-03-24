import { z } from "zod";
import { router } from "../_core/trpc";
import { financeManagerProcedure } from "../procedures";
import { getDb } from "../db";
import {
  invoices as invoicesTable,
  invoiceItems as invoiceItemsTable,
  vendorBills as vendorBillsTable,
  vendors as vendorsTable,
  customers as customersTable,
  billInvoiceAllocations,
  employees as employeesTable,
} from "../../drizzle/schema";
import { eq, and, sql, gte, lt, inArray, count } from "drizzle-orm";

/**
 * Helper: get last N months as "YYYY-MM" strings
 */
function getLastNMonths(n: number, fromDate?: Date): string[] {
  const d = fromDate ? new Date(fromDate) : new Date();
  const months: string[] = [];
  for (let i = 0; i < n; i++) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    months.unshift(`${y}-${String(m).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return months;
}

/**
 * Service-fee itemTypes: pure USD-denominated service charges (no FX component)
 */
const SERVICE_FEE_ITEM_TYPES = [
  "eor_service_fee",
  "visa_eor_service_fee",
  "aor_service_fee",
] as const;

/**
 * Non-recurring revenue itemTypes: one-off charges billed to clients
 */
const NON_RECURRING_ITEM_TYPES = [
  "equipment_procurement_fee",
  "onboarding_fee",
  "offboarding_fee",
  "admin_setup_fee",
  "contract_termination_fee",
  "payroll_processing_fee",
  "tax_filing_fee",
  "hr_advisory_fee",
  "legal_compliance_fee",
  "visa_immigration_fee",
  "relocation_fee",
  "benefits_admin_fee",
  "bank_transfer_fee",
  "consulting_fee",
  "management_consulting_fee",
] as const;

/**
 * Pass-through itemTypes: funds collected from clients on behalf of employees/governments
 * (employment_cost is the main one; deposit is excluded from revenue entirely)
 */
const PASS_THROUGH_ITEM_TYPES = [
  "employment_cost",
] as const;

/** Round to 2 decimal places */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const reportsRouter = router({
  /**
   * Profit & Loss Report — Net-Basis (全局代收代付净额法)
   *
   * Revenue side (from invoices):
   *   1. Service Fee Revenue = SUM of service-fee itemTypes (pure USD)
   *   2. Non-recurring Revenue = SUM of non-recurring itemTypes
   *   3. Pass-through Collected = SUM of employment_cost itemTypes (USD collected from clients)
   *
   * Cost side (from vendor bills, using COALESCE(settlementAmount, totalAmount) for backward compat):
   *   4a. Pass-through Paid = SUM of pass_through billType settlements
   *   4b. Non-recurring Costs = SUM of non_recurring billType settlements
   *   (passThroughPaid = 4a + 4b for backward compatibility)
   *   5. Direct COGS = SUM of vendor_service_fee billType settlements + SUM of all settlementBankFee
   *   6. Operational Expenses = SUM of operational billType settlements
   *
   * Derived:
   *   - FX & Markup Profit = (Pass-through Collected + Non-recurring Revenue) - Pass-through Paid
   *   - Net Revenue = Service Fee Revenue + FX & Markup Profit + (Non-recurring Revenue already captured in FX calc)
   *   - Gross Profit = Net Revenue - Direct COGS
   *   - Net Profit = Gross Profit - Operational Expenses
   */
  profitAndLoss: financeManagerProcedure
    .input(
      z.object({
        startMonth: z.string().optional(), // YYYY-MM
        endMonth: z.string().optional(), // YYYY-MM
        months: z.number().default(12), // Default last 12 months
        currency: z.string().default("USD"), // Reporting currency
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          summary: {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            profitMargin: 0,
            // New net-basis fields
            serviceFeeRevenue: 0,
            nonRecurringRevenue: 0,
            passThroughCollected: 0,
            passThroughPaid: 0,
            fxMarkupProfit: 0,
            netRevenue: 0,
            directCOGS: 0,
            grossProfit: 0,
            operationalExpenses: 0,
            totalUnallocated: 0,
            bankFees: 0,
            nonRecurringCosts: 0,
          },
          monthlyBreakdown: [] as {
            month: string;
            revenue: number;
            expenses: number;
            netProfit: number;
            invoiceCount: number;
            billCount: number;
            serviceFeeRevenue: number;
            nonRecurringRevenue: number;
            passThroughCollected: number;
            passThroughPaid: number;
            fxMarkupProfit: number;
            netRevenue: number;
            directCOGS: number;
            grossProfit: number;
            operationalExpenses: number;
          }[],
          revenueByType: [] as { type: string; amount: number }[],
          expensesByCategory: [] as { category: string; amount: number }[],
          expensesByVendor: [] as { vendorId: number; vendorName: string; amount: number }[],
          revenueByCustomer: [] as { customerId: number; customerName: string; amount: number }[],
          customerProfit: [] as { customerId: number; customerName: string; revenue: number; costAllocated: number; profit: number; margin: number; isLoss: boolean }[],
        };
      }

      // Determine month range
      let months: string[];
      if (input.startMonth && input.endMonth) {
        months = [];
        const [sy, sm] = input.startMonth.split("-").map(Number);
        const [ey, em] = input.endMonth.split("-").map(Number);
        let cy = sy, cm = sm;
        while (cy < ey || (cy === ey && cm <= em)) {
          months.push(`${cy}-${String(cm).padStart(2, "0")}`);
          cm++;
          if (cm > 12) { cm = 1; cy++; }
        }
      } else {
        months = getLastNMonths(input.months);
      }

      // ── Reusable SQL expression: actual cost = COALESCE(settlementAmount, totalAmount) ──
      const actualCostExpr = sql<string>`COALESCE(${vendorBillsTable.settlementAmount}, ${vendorBillsTable.totalAmount})`;
      const bankFeeExpr = sql<string>`COALESCE(${vendorBillsTable.settlementBankFee}, ${vendorBillsTable.bankFee}, '0')`;

      const monthlyBreakdown: {
        month: string;
        revenue: number;
        expenses: number;
        netProfit: number;
        invoiceCount: number;
        billCount: number;
        serviceFeeRevenue: number;
        nonRecurringRevenue: number;
        passThroughCollected: number;
        passThroughPaid: number;
        fxMarkupProfit: number;
        netRevenue: number;
        directCOGS: number;
        grossProfit: number;
        operationalExpenses: number;
      }[] = [];

      // Accumulators for summary
      let totalServiceFee = 0;
      let totalNonRecurring = 0;
      let totalPassThroughCollected = 0;
      let totalPassThroughPaid = 0;
      let totalDirectCOGS = 0;
      let totalOperational = 0;
      let totalRevenue = 0;
      let totalExpenses = 0;
      let totalBankFees = 0;
      let totalNonRecurringCosts = 0;

      for (const m of months) {
        const [y, mo] = m.split("-").map(Number);
        const monthStart = `${m}-01`;
        const nextMonth = mo === 12 ? `${y + 1}-01-01` : `${y}-${String(mo + 1).padStart(2, "0")}-01`;

        // ── 1. Service Fee Revenue (from invoice items) ──
        const [sfResult] = await db
          .select({
            total: sql<string>`COALESCE(SUM(CAST(${invoiceItemsTable.amount} AS REAL)), 0)`,
          })
          .from(invoiceItemsTable)
          .innerJoin(invoicesTable, eq(invoiceItemsTable.invoiceId, invoicesTable.id))
          .where(
            and(
              eq(invoicesTable.status, "paid"),
              sql`${invoicesTable.invoiceMonth} >= ${monthStart}`,
              sql`${invoicesTable.invoiceMonth} < ${nextMonth}`,
              sql`${invoicesTable.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`,
              sql`${invoiceItemsTable.itemType} IN (${sql.join(SERVICE_FEE_ITEM_TYPES.map(t => sql`${t}`), sql`, `)})`
            )
          );
        const serviceFee = parseFloat(sfResult?.total ?? "0");

        // ── 2. Non-recurring Revenue (from invoice items) ──
        const [nrResult] = await db
          .select({
            total: sql<string>`COALESCE(SUM(CAST(${invoiceItemsTable.amount} AS REAL)), 0)`,
          })
          .from(invoiceItemsTable)
          .innerJoin(invoicesTable, eq(invoiceItemsTable.invoiceId, invoicesTable.id))
          .where(
            and(
              eq(invoicesTable.status, "paid"),
              sql`${invoicesTable.invoiceMonth} >= ${monthStart}`,
              sql`${invoicesTable.invoiceMonth} < ${nextMonth}`,
              sql`${invoicesTable.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`,
              sql`${invoiceItemsTable.itemType} IN (${sql.join(NON_RECURRING_ITEM_TYPES.map(t => sql`${t}`), sql`, `)})`
            )
          );
        const nonRecurring = parseFloat(nrResult?.total ?? "0");

        // ── 3. Pass-through Collected (employment_cost from invoice items — USD collected from clients) ──
        const [ptcResult] = await db
          .select({
            total: sql<string>`COALESCE(SUM(CAST(${invoiceItemsTable.amount} AS REAL)), 0)`,
          })
          .from(invoiceItemsTable)
          .innerJoin(invoicesTable, eq(invoiceItemsTable.invoiceId, invoicesTable.id))
          .where(
            and(
              eq(invoicesTable.status, "paid"),
              sql`${invoicesTable.invoiceMonth} >= ${monthStart}`,
              sql`${invoicesTable.invoiceMonth} < ${nextMonth}`,
              sql`${invoicesTable.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`,
              sql`${invoiceItemsTable.itemType} IN (${sql.join(PASS_THROUGH_ITEM_TYPES.map(t => sql`${t}`), sql`, `)})`
            )
          );
        const passThroughCollected = parseFloat(ptcResult?.total ?? "0");

        // ── 4a. Pass-through Paid (vendor bills: pass_through billType only) ──
        const [ptpResult] = await db
          .select({
            total: sql<string>`COALESCE(SUM(CAST(${actualCostExpr} AS REAL)), 0)`,
          })
          .from(vendorBillsTable)
          .where(
            and(
              inArray(vendorBillsTable.status, ["paid", "partially_paid"]),
              sql`${vendorBillsTable.billMonth} >= ${monthStart}`,
              sql`${vendorBillsTable.billMonth} < ${nextMonth}`,
              sql`${vendorBillsTable.billType} = 'pass_through'`
            )
          );
        const passThroughPaidOnly = parseFloat(ptpResult?.total ?? "0");

        // ── 4b. Non-recurring Costs (vendor bills: non_recurring billType) ──
        const [nrCostResult] = await db
          .select({
            total: sql<string>`COALESCE(SUM(CAST(${actualCostExpr} AS REAL)), 0)`,
          })
          .from(vendorBillsTable)
          .where(
            and(
              inArray(vendorBillsTable.status, ["paid", "partially_paid"]),
              sql`${vendorBillsTable.billMonth} >= ${monthStart}`,
              sql`${vendorBillsTable.billMonth} < ${nextMonth}`,
              sql`${vendorBillsTable.billType} = 'non_recurring'`
            )
          );
        const nonRecurringCosts = parseFloat(nrCostResult?.total ?? "0");
        const passThroughPaid = passThroughPaidOnly + nonRecurringCosts;

        // ── 5. Direct COGS (vendor_service_fee bills + all bank fees) ──
        const [vsResult] = await db
          .select({
            total: sql<string>`COALESCE(SUM(CAST(${actualCostExpr} AS REAL)), 0)`,
          })
          .from(vendorBillsTable)
          .where(
            and(
              inArray(vendorBillsTable.status, ["paid", "partially_paid"]),
              sql`${vendorBillsTable.billMonth} >= ${monthStart}`,
              sql`${vendorBillsTable.billMonth} < ${nextMonth}`,
              sql`${vendorBillsTable.billType} = 'vendor_service_fee'`
            )
          );
        const vendorServiceCost = parseFloat(vsResult?.total ?? "0");

        // Bank fees from all paid bills in this month
        const [bfResult] = await db
          .select({
            total: sql<string>`COALESCE(SUM(CAST(${bankFeeExpr} AS REAL)), 0)`,
          })
          .from(vendorBillsTable)
          .where(
            and(
              inArray(vendorBillsTable.status, ["paid", "partially_paid"]),
              sql`${vendorBillsTable.billMonth} >= ${monthStart}`,
              sql`${vendorBillsTable.billMonth} < ${nextMonth}`
            )
          );
        const totalBankFees_month = parseFloat(bfResult?.total ?? "0");

        const directCOGS = vendorServiceCost + totalBankFees_month;

        // ── 6. Operational Expenses (operational billType) ──
        const [opResult] = await db
          .select({
            total: sql<string>`COALESCE(SUM(CAST(${actualCostExpr} AS REAL)), 0)`,
          })
          .from(vendorBillsTable)
          .where(
            and(
              inArray(vendorBillsTable.status, ["paid", "approved", "partially_paid"]),
              sql`${vendorBillsTable.billMonth} >= ${monthStart}`,
              sql`${vendorBillsTable.billMonth} < ${nextMonth}`,
              sql`${vendorBillsTable.billType} = 'operational'`
            )
          );
        const operationalExpenses = parseFloat(opResult?.total ?? "0");

        // ── Invoice & bill counts ──
        const [invCount] = await db
          .select({ cnt: count() })
          .from(invoicesTable)
          .where(
            and(
              eq(invoicesTable.status, "paid"),
              sql`${invoicesTable.invoiceMonth} >= ${monthStart}`,
              sql`${invoicesTable.invoiceMonth} < ${nextMonth}`,
              sql`${invoicesTable.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
            )
          );
        const [billCount] = await db
          .select({ cnt: count() })
          .from(vendorBillsTable)
          .where(
            and(
              inArray(vendorBillsTable.status, ["paid", "approved", "partially_paid"]),
              sql`${vendorBillsTable.billMonth} >= ${monthStart}`,
              sql`${vendorBillsTable.billMonth} < ${nextMonth}`
            )
          );

        // ── Derived metrics ──
        const fxMarkupProfit = (passThroughCollected + nonRecurring) - passThroughPaid;
        const netRevenue = serviceFee + fxMarkupProfit;
        const grossProfit = netRevenue - directCOGS;
        const netProfit = grossProfit - operationalExpenses;

        // Legacy compatible: totalRevenue = all invoice revenue, totalExpenses = all vendor bill costs
        const monthRevenue = serviceFee + nonRecurring + passThroughCollected;
        const monthExpenses = passThroughPaid + directCOGS + operationalExpenses;

        monthlyBreakdown.push({
          month: m,
          revenue: r2(monthRevenue),
          expenses: r2(monthExpenses),
          netProfit: r2(netProfit),
          invoiceCount: invCount?.cnt ?? 0,
          billCount: billCount?.cnt ?? 0,
          serviceFeeRevenue: r2(serviceFee),
          nonRecurringRevenue: r2(nonRecurring),
          passThroughCollected: r2(passThroughCollected),
          passThroughPaid: r2(passThroughPaid),
          fxMarkupProfit: r2(fxMarkupProfit),
          netRevenue: r2(netRevenue),
          directCOGS: r2(directCOGS),
          grossProfit: r2(grossProfit),
          operationalExpenses: r2(operationalExpenses),
        });

        totalServiceFee += serviceFee;
        totalNonRecurring += nonRecurring;
        totalPassThroughCollected += passThroughCollected;
        totalPassThroughPaid += passThroughPaid;
        totalDirectCOGS += directCOGS;
        totalOperational += operationalExpenses;
        totalRevenue += monthRevenue;
        totalExpenses += monthExpenses;
        totalBankFees += totalBankFees_month;
        totalNonRecurringCosts += nonRecurringCosts;
      }

      const totalFxProfit = (totalPassThroughCollected + totalNonRecurring) - totalPassThroughPaid;
      const totalNetRevenue = totalServiceFee + totalFxProfit;
      const totalGrossProfit = totalNetRevenue - totalDirectCOGS;
      const totalNetProfit = totalGrossProfit - totalOperational;
      const profitMargin = totalNetRevenue > 0 ? (totalNetProfit / totalNetRevenue) * 100 : 0;

      // ── Revenue breakdown by invoice type (legacy compatible) ──
      const globalStart = `${months[0]}-01`;
      const lastMonth = months[months.length - 1].split("-").map(Number);
      const globalEnd = lastMonth[1] === 12
        ? `${lastMonth[0] + 1}-01-01`
        : `${lastMonth[0]}-${String(lastMonth[1] + 1).padStart(2, "0")}-01`;

      const revenueByTypeResult = await db
        .select({
          type: invoicesTable.invoiceType,
          amount: sql<string>`COALESCE(SUM(${invoicesTable.total}), 0)`,
        })
        .from(invoicesTable)
        .where(
          and(
            eq(invoicesTable.status, "paid"),
            sql`${invoicesTable.invoiceMonth} >= ${globalStart}`,
            sql`${invoicesTable.invoiceMonth} < ${globalEnd}`,
            sql`${invoicesTable.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
          )
        )
        .groupBy(invoicesTable.invoiceType);

      // ── Expense breakdown by category (using actual settlement amounts) ──
      const expensesByCategoryResult = await db
        .select({
          category: vendorBillsTable.category,
          amount: sql<string>`COALESCE(SUM(CAST(${actualCostExpr} AS REAL)), 0)`,
        })
        .from(vendorBillsTable)
        .where(
          and(
            inArray(vendorBillsTable.status, ["paid", "approved", "partially_paid"]),
            sql`${vendorBillsTable.billMonth} >= ${globalStart}`,
            sql`${vendorBillsTable.billMonth} < ${globalEnd}`
          )
        )
        .groupBy(vendorBillsTable.category);

      // ── Expense breakdown by vendor (using actual settlement amounts) ──
      const expensesByVendorResult = await db
        .select({
          vendorId: vendorBillsTable.vendorId,
          vendorName: vendorsTable.name,
          amount: sql<string>`COALESCE(SUM(CAST(${actualCostExpr} AS REAL)), 0)`,
        })
        .from(vendorBillsTable)
        .innerJoin(vendorsTable, eq(vendorBillsTable.vendorId, vendorsTable.id))
        .where(
          and(
            inArray(vendorBillsTable.status, ["paid", "approved", "partially_paid"]),
            sql`${vendorBillsTable.billMonth} >= ${globalStart}`,
            sql`${vendorBillsTable.billMonth} < ${globalEnd}`
          )
        )
        .groupBy(vendorBillsTable.vendorId, vendorsTable.name);

      // ── Revenue breakdown by customer ──
      const revenueByCustomerResult = await db
        .select({
          customerId: invoicesTable.customerId,
          customerName: customersTable.companyName,
          amount: sql<string>`COALESCE(SUM(${invoicesTable.total}), 0)`,
        })
        .from(invoicesTable)
        .innerJoin(customersTable, eq(invoicesTable.customerId, customersTable.id))
        .where(
          and(
            eq(invoicesTable.status, "paid"),
            sql`${invoicesTable.invoiceMonth} >= ${globalStart}`,
            sql`${invoicesTable.invoiceMonth} < ${globalEnd}`,
            sql`${invoicesTable.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
          )
        )
        .groupBy(invoicesTable.customerId, customersTable.companyName);

      // ── Customer Profit Analysis (via allocations — kept as-is) ──
      const customerProfitResult = await db
        .select({
          customerId: invoicesTable.customerId,
          customerName: customersTable.companyName,
          revenue: sql<string>`COALESCE(SUM(DISTINCT ${invoicesTable.total}), 0)`,
          costAllocated: sql<string>`COALESCE(SUM(${billInvoiceAllocations.allocatedAmount}), 0)`,
        })
        .from(invoicesTable)
        .innerJoin(customersTable, eq(invoicesTable.customerId, customersTable.id))
        .leftJoin(billInvoiceAllocations, eq(billInvoiceAllocations.invoiceId, invoicesTable.id))
        .where(
          and(
            eq(invoicesTable.status, "paid"),
            sql`${invoicesTable.invoiceMonth} >= ${globalStart}`,
            sql`${invoicesTable.invoiceMonth} < ${globalEnd}`,
            sql`${invoicesTable.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
          )
        )
        .groupBy(invoicesTable.customerId, customersTable.companyName);

      // ── Unallocated expenses (operational costs — kept as-is) ──
      const unallocatedResult = await db
        .select({
          total: sql<string>`COALESCE(SUM(CAST(${sql`COALESCE(${vendorBillsTable.unallocatedAmount}, '0')`} AS REAL)), 0)`,
        })
        .from(vendorBillsTable)
        .where(
          and(
            inArray(vendorBillsTable.status, ["paid", "approved", "partially_paid"]),
            sql`${vendorBillsTable.billMonth} >= ${globalStart}`,
            sql`${vendorBillsTable.billMonth} < ${globalEnd}`
          )
        );

      const totalUnallocated = r2(parseFloat(unallocatedResult[0]?.total ?? "0"));

      return {
        summary: {
          // Legacy fields (backward compatible — frontend still reads these)
          totalRevenue: r2(totalRevenue),
          totalExpenses: r2(totalExpenses),
          netProfit: r2(totalNetProfit),
          profitMargin: r2(profitMargin),
          totalUnallocated,
          // New net-basis P&L fields
          serviceFeeRevenue: r2(totalServiceFee),
          nonRecurringRevenue: r2(totalNonRecurring),
          passThroughCollected: r2(totalPassThroughCollected),
          passThroughPaid: r2(totalPassThroughPaid),
          fxMarkupProfit: r2(totalFxProfit),
          netRevenue: r2(totalNetRevenue),
          directCOGS: r2(totalDirectCOGS),
          grossProfit: r2(totalGrossProfit),
          operationalExpenses: r2(totalOperational),
          // Detailed cost breakdown for waterfall chart
          bankFees: r2(totalBankFees),
          nonRecurringCosts: r2(totalNonRecurringCosts),
        },
        monthlyBreakdown,
        revenueByType: revenueByTypeResult.map((r) => ({
          type: r.type || "unknown",
          amount: r2(parseFloat(r.amount)),
        })),
        expensesByCategory: expensesByCategoryResult.map((r) => ({
          category: r.category || "other",
          amount: r2(parseFloat(r.amount)),
        })),
        expensesByVendor: expensesByVendorResult.map((r) => ({
          vendorId: r.vendorId,
          vendorName: r.vendorName || "Unknown",
          amount: r2(parseFloat(r.amount)),
        })),
        revenueByCustomer: revenueByCustomerResult.map((r) => ({
          customerId: r.customerId,
          customerName: r.customerName || "Unknown",
          amount: r2(parseFloat(r.amount)),
        })),
        customerProfit: customerProfitResult.map((r) => {
          const rev = r2(parseFloat(r.revenue));
          const cost = r2(parseFloat(r.costAllocated));
          const profit = r2(rev - cost);
          const margin = rev > 0 ? r2((profit / rev) * 100) : 0;
          return {
            customerId: r.customerId,
            customerName: r.customerName || "Unknown",
            revenue: rev,
            costAllocated: cost,
            profit,
            margin,
            isLoss: profit < 0,
          };
        }).sort((a, b) => b.revenue - a.revenue),
      };
    }),

  /**
   * Quick financial summary for dashboard integration
   * Uses COALESCE(settlementAmount, totalAmount) for backward compatibility
   */
  financialSummary: financeManagerProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        currentMonthRevenue: 0,
        currentMonthExpenses: 0,
        currentMonthProfit: 0,
        previousMonthRevenue: 0,
        previousMonthExpenses: 0,
        previousMonthProfit: 0,
        totalOutstandingBills: 0,
        totalOutstandingInvoices: 0,
      };
    }

    const actualCostExpr = sql<string>`COALESCE(${vendorBillsTable.settlementAmount}, ${vendorBillsTable.totalAmount})`;

    const now = new Date();
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const nextMonthStart = now.getMonth() === 11
      ? `${now.getFullYear() + 1}-01-01`
      : `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, "0")}-01`;

    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStart = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}-01`;

    // Current month revenue
    const [curRevenue] = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoicesTable.total}), 0)` })
      .from(invoicesTable)
      .where(
        and(
          eq(invoicesTable.status, "paid"),
          sql`${invoicesTable.invoiceMonth} >= ${currentMonthStart}`,
          sql`${invoicesTable.invoiceMonth} < ${nextMonthStart}`,
          sql`${invoicesTable.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
        )
      );

    // Current month expenses (using actual settlement amounts)
    const [curExpenses] = await db
      .select({ total: sql<string>`COALESCE(SUM(CAST(${actualCostExpr} AS REAL)), 0)` })
      .from(vendorBillsTable)
      .where(
        and(
          inArray(vendorBillsTable.status, ["paid", "approved", "partially_paid"]),
          sql`${vendorBillsTable.billMonth} >= ${currentMonthStart}`,
          sql`${vendorBillsTable.billMonth} < ${nextMonthStart}`
        )
      );

    // Previous month revenue
    const [prevRevenue] = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoicesTable.total}), 0)` })
      .from(invoicesTable)
      .where(
        and(
          eq(invoicesTable.status, "paid"),
          sql`${invoicesTable.invoiceMonth} >= ${prevMonthStart}`,
          sql`${invoicesTable.invoiceMonth} < ${currentMonthStart}`,
          sql`${invoicesTable.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
        )
      );

    // Previous month expenses (using actual settlement amounts)
    const [prevExpenses] = await db
      .select({ total: sql<string>`COALESCE(SUM(CAST(${actualCostExpr} AS REAL)), 0)` })
      .from(vendorBillsTable)
      .where(
        and(
          inArray(vendorBillsTable.status, ["paid", "approved", "partially_paid"]),
          sql`${vendorBillsTable.billMonth} >= ${prevMonthStart}`,
          sql`${vendorBillsTable.billMonth} < ${currentMonthStart}`
        )
      );

    // Outstanding bills (pending_approval + approved + overdue)
    const [outstandingBills] = await db
      .select({ total: sql<string>`COALESCE(SUM(CAST(${vendorBillsTable.totalAmount} AS REAL)), 0)` })
      .from(vendorBillsTable)
      .where(inArray(vendorBillsTable.status, ["pending_approval", "approved", "overdue"]));

    // Outstanding invoices (sent + overdue)
    const [outstandingInvoices] = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoicesTable.total}), 0)` })
      .from(invoicesTable)
      .where(
        and(
          inArray(invoicesTable.status, ["sent", "overdue"]),
          sql`${invoicesTable.invoiceType} NOT IN ('deposit', 'deposit_refund', 'credit_note')`
        )
      );

    const curRev = parseFloat(curRevenue?.total ?? "0");
    const curExp = parseFloat(curExpenses?.total ?? "0");
    const prevRev = parseFloat(prevRevenue?.total ?? "0");
    const prevExp = parseFloat(prevExpenses?.total ?? "0");

    return {
      currentMonthRevenue: r2(curRev),
      currentMonthExpenses: r2(curExp),
      currentMonthProfit: r2(curRev - curExp),
      previousMonthRevenue: r2(prevRev),
      previousMonthExpenses: r2(prevExp),
      previousMonthProfit: r2(prevRev - prevExp),
      totalOutstandingBills: r2(parseFloat(outstandingBills?.total ?? "0")),
      totalOutstandingInvoices: r2(parseFloat(outstandingInvoices?.total ?? "0")),
    };
  }),
});
