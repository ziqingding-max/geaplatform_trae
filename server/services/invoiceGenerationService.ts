import { getDb, listCustomerPricing, getCountryConfig } from "../db";
import {
  customers,
  employees,
  payrollRuns,
  payrollItems,
  invoices,
  invoiceItems,
  countriesConfig,
  InsertInvoice,
  InsertInvoiceItem,
} from "../../drizzle/schema";
import { eq, and, sql, between } from "drizzle-orm";
import { getExchangeRate } from "./exchangeRateService";
import { generateInvoiceNumber } from "./invoiceNumberService";
import { getBillingEntityById } from "../db";

/**
 * Invoice Generation Service
 *
 * Architecture:
 * - Payroll Runs are organized by Country + Period (not by customer)
 * - One Payroll Run contains all active employees in that country across all customers
 * - Invoice generation aggregates payroll items per customer across all country runs for a given month
 * - Each invoice is in the customer's settlement currency, with exchange rate conversion from local currencies
 * - VAT is calculated per employee item using vatRate from countries_config (shown in Tax column, NOT as separate item)
 * - Service fees are calculated from customer pricing (global_discount or country_specific)
 * - Billing entity is associated via customer.billingEntityId
 *
 * SPLIT DIMENSIONS (5):
 * 1. Customer
 * 2. Employee Service Type (eor → monthly_eor, visa_eor → monthly_visa_eor, aor → monthly_aor)
 * 3. Country Code (employees in different countries → different invoices)
 * 4. Local Currency (salary currency of employees)
 * 5. Service Fee Rate (different rates → different invoices)
 *
 * IMPORTANT: Only approved payroll runs are included in invoice generation
 */

interface InvoiceGenerationResult {
  success: boolean;
  invoiceIds?: number[];
  message: string;
  error?: string;
  warnings?: string[];
}

// Map service type to invoice type
const SERVICE_TYPE_TO_INVOICE_TYPE: Record<string, string> = {
  eor: "monthly_eor",
  visa_eor: "monthly_visa_eor",
  aor: "monthly_aor",
};

// Map service type to service fee item type
const SERVICE_TYPE_TO_FEE_TYPE: Record<string, string> = {
  eor: "eor_service_fee",
  visa_eor: "visa_eor_service_fee",
  aor: "aor_service_fee",
};

// Map service type to display label
const SERVICE_TYPE_LABELS: Record<string, string> = {
  eor: "EOR Service Fee",
  visa_eor: "Visa EOR Service Fee",
  aor: "AOR Service Fee",
};

/**
 * Generate draft invoices for a specific payroll month
 *
 * Flow:
 * 1. Find all APPROVED payroll runs for the given month
 * 2. For each run, get all payroll items with employee data
 * 3. Group payroll items by: customer → serviceType → countryCode → localCurrency → serviceFeeRate
 * 4. For each group, create a separate invoice:
 *    a. Employment cost items (one per employee, with Tax column showing VAT rate)
 *    b. Service fee item (merged, Qty = number of employees, with Tax column showing VAT rate)
 *    c. VAT is per-item (in the Tax column), NOT as a separate line item
 */
export async function generateInvoicesFromPayroll(
  payrollMonth: Date
): Promise<InvoiceGenerationResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available", error: "DB_ERROR" };
  }

  try {
    const warnings: string[] = [];

    const y = payrollMonth.getUTCFullYear();
    const m = String(payrollMonth.getUTCMonth() + 1).padStart(2, "0");
    const d = String(payrollMonth.getUTCDate()).padStart(2, "0");
    const payrollMonthStr = `${y}-${m}-${d}`;

    // Format month for descriptions (e.g., "Jan 2026")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthLabel = `${monthNames[payrollMonth.getUTCMonth()]} ${y}`;

    // 1. Get only APPROVED payroll runs for this month
    const payrollRunsData = await db
      .select()
      .from(payrollRuns)
      .where(
        and(
          sql`DATE(${payrollRuns.payrollMonth}) = ${payrollMonthStr}`,
          eq(payrollRuns.status, "approved")
        )
      );

    if (payrollRunsData.length === 0) {
      return {
        success: false,
        message: `No approved payroll runs found for ${payrollMonthStr}. Only approved payroll runs can generate invoices.`,
        error: "NO_APPROVED_PAYROLL",
      };
    }

    // Check for non-approved runs
    const allRunsForMonth = await db
      .select()
      .from(payrollRuns)
      .where(sql`DATE(${payrollRuns.payrollMonth}) = ${payrollMonthStr}`);

    const nonApprovedRuns = allRunsForMonth.filter((r) => r.status !== "approved");
    if (nonApprovedRuns.length > 0) {
      warnings.push(
        `${nonApprovedRuns.length} payroll run(s) for this month are not yet approved and were excluded from invoice generation.`
      );
    }

    // 2. Collect all payroll items with employee + customer info
    interface PayrollEntry {
      item: any;
      employee: any;
      run: any;
      customer: any;
      countryConfig: any;
    }

    const allEntries: PayrollEntry[] = [];
    const customerCache = new Map<number, any>();
    const countryConfigCache = new Map<string, any>();

    for (const run of payrollRunsData) {
      const items = await db
        .select()
        .from(payrollItems)
        .where(eq(payrollItems.payrollRunId, run.id));

      if (items.length === 0) continue;

      // Cache country config
      if (!countryConfigCache.has(run.countryCode)) {
        const cc = await getCountryConfig(run.countryCode);
        countryConfigCache.set(run.countryCode, cc);
      }

      for (const item of items) {
        const empData = await db
          .select()
          .from(employees)
          .where(eq(employees.id, item.employeeId))
          .limit(1);

        if (empData.length === 0) continue;
        const emp = empData[0];

        // Cache customer
        if (!customerCache.has(emp.customerId)) {
          const custData = await db
            .select()
            .from(customers)
            .where(eq(customers.id, emp.customerId))
            .limit(1);
          if (custData.length === 0) continue;
          customerCache.set(emp.customerId, custData[0]);
        }

        allEntries.push({
          item,
          employee: emp,
          run,
          customer: customerCache.get(emp.customerId)!,
          countryConfig: countryConfigCache.get(run.countryCode),
        });
      }
    }

    // 3. Group by: customerId → serviceType → countryCode → localCurrency → serviceFeeRate
    // Key format: "customerId|serviceType|countryCode|localCurrency|serviceFeeRate"
    const invoiceGroups = new Map<string, PayrollEntry[]>();

    for (const entry of allEntries) {
      const customerId = entry.employee.customerId;
      const serviceType = entry.employee.serviceType || "eor";
      const countryCode = entry.run.countryCode;
      const localCurrency = entry.run.currency || entry.employee.salaryCurrency || "USD";

      // Calculate service fee rate for this employee to determine grouping
      const serviceFeeRate = await getServiceFeeRate(
        customerId,
        countryCode,
        serviceType,
        entry.countryConfig,
        entry.customer.settlementCurrency || "USD",
        warnings
      );

      const key = `${customerId}|${serviceType}|${countryCode}|${localCurrency}|${serviceFeeRate.toFixed(2)}`;

      if (!invoiceGroups.has(key)) {
        invoiceGroups.set(key, []);
      }
      invoiceGroups.get(key)!.push(entry);
    }

    // 4. Create one invoice per group (with duplicate prevention)
    const invoiceIds: number[] = [];
    let skippedDuplicates = 0;

    // Pre-fetch existing invoices for this month to check for duplicates
    const existingInvoicesForMonth = await db
      .select()
      .from(invoices)
      .where(
        and(
          sql`${invoices.invoiceMonth} = ${payrollMonthStr}`,
          sql`${invoices.status} != 'cancelled'`,
          sql`${invoices.status} != 'void'`
        )
      );

    for (const [key, entries] of Array.from(invoiceGroups.entries())) {
      const [customerIdStr, serviceType, countryCode, localCurrency, serviceFeeRateStr] = key.split("|");
      const customerId = parseInt(customerIdStr);
      const customer = customerCache.get(customerId)!;
      const serviceFeeRate = parseFloat(serviceFeeRateStr);

      // Check for duplicate: same customer + month + invoice type + country + currency
      const invoiceType = SERVICE_TYPE_TO_INVOICE_TYPE[serviceType] || "monthly_eor";
      const duplicate = existingInvoicesForMonth.find(
        (inv) =>
          inv.customerId === customerId &&
          inv.invoiceType === invoiceType &&
          inv.currency === localCurrency
      );

      if (duplicate) {
        skippedDuplicates++;
        warnings.push(
          `Skipped: Invoice for ${customer.companyName} (${invoiceType}, ${countryCode}, ${localCurrency}) already exists for this month (Invoice #${duplicate.invoiceNumber}).`
        );
        continue;
      }

      const invoiceId = await createGroupInvoice(
        customerId,
        customer,
        serviceType,
        countryCode,
        localCurrency,
        serviceFeeRate,
        entries,
        payrollMonth,
        monthLabel,
        warnings
      );

      if (invoiceId) {
        invoiceIds.push(invoiceId);
      }
    }

    if (skippedDuplicates > 0 && invoiceIds.length === 0) {
      return {
        success: true,
        invoiceIds: [],
        message: `All invoices for this month already exist. ${skippedDuplicates} duplicate(s) skipped.`,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    }

    return {
      success: true,
      invoiceIds,
      message: `Successfully generated ${invoiceIds.length} draft invoice(s) from ${payrollRunsData.length} approved payroll run(s)`,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error("[InvoiceGeneration] Error generating invoices:", error);
    return {
      success: false,
      message: "Failed to generate invoices",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

/**
 * Calculate the service fee rate for a single employee (in settlement currency)
 */
async function getServiceFeeRate(
  customerId: number,
  countryCode: string,
  serviceType: string,
  countryConfig: any,
  settlementCurrency: string,
  warnings: string[]
): Promise<number> {
  const customerPricingData = await listCustomerPricing(customerId);

  // Priority: country_specific pricing > global_discount > standard rate
  const countrySpecificPricing = customerPricingData?.find(
    (p: any) =>
      p.pricingType === "country_specific" &&
      p.countryCode === countryCode &&
      p.serviceType === serviceType &&
      p.isActive
  );

  if (countrySpecificPricing && countrySpecificPricing.fixedPrice) {
    const perEmployeeFee = parseFloat(countrySpecificPricing.fixedPrice?.toString() ?? "0");
    const pricingCurrency = countrySpecificPricing.currency || "USD";
    let feeInSettlement = perEmployeeFee;
    if (pricingCurrency !== settlementCurrency) {
      const feeRate = await getExchangeRate(pricingCurrency, settlementCurrency);
      if (feeRate) {
        feeInSettlement = perEmployeeFee * feeRate.rate;
      }
    }
    return feeInSettlement;
  }

  const globalDiscount = customerPricingData?.find(
    (p: any) => p.pricingType === "global_discount" && p.isActive
  );

  let standardRate = 0;
  if (countryConfig) {
    if (serviceType === "eor") {
      standardRate = parseFloat(countryConfig.standardEorRate?.toString() ?? "0");
    } else if (serviceType === "visa_eor") {
      standardRate = parseFloat(countryConfig.standardVisaEorRate?.toString() ?? "0");
    } else if (serviceType === "aor") {
      standardRate = parseFloat(countryConfig.standardAorRate?.toString() ?? "0");
    }
  }

  if (globalDiscount) {
    const discountPct = parseFloat(globalDiscount.globalDiscountPercent?.toString() ?? "0");
    standardRate = standardRate * (1 - discountPct / 100);
  }

  const rateCurrency = countryConfig?.standardRateCurrency || "USD";
  let feeInSettlement = standardRate;
  if (rateCurrency !== settlementCurrency) {
    const feeRate = await getExchangeRate(rateCurrency, settlementCurrency);
    if (feeRate) {
      feeInSettlement = standardRate * feeRate.rate;
    }
  }

  return feeInSettlement;
}

/**
 * Create a single invoice for a group of employees
 * (same customer + serviceType + countryCode + localCurrency + serviceFeeRate)
 *
 * TAX HANDLING:
 * - VAT is stored per line item in the vatRate column
 * - Tax amount is calculated per item: amount * (vatRate / 100)
 * - Tax is NOT a separate line item — it's a column on each item
 * - Invoice total = subtotal + tax (where subtotal includes employment costs + service fees)
 */
async function createGroupInvoice(
  customerId: number,
  customer: any,
  serviceType: string,
  countryCode: string,
  localCurrency: string,
  serviceFeeRate: number,
  entries: Array<{ item: any; employee: any; run: any; customer: any; countryConfig: any }>,
  payrollMonth: Date,
  monthLabel: string,
  warnings: string[]
): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const settlementCurrency = customer.settlementCurrency || "USD";
    const invoiceType = SERVICE_TYPE_TO_INVOICE_TYPE[serviceType] || "monthly_eor";
    const feeItemType = SERVICE_TYPE_TO_FEE_TYPE[serviceType] || "eor_service_fee";
    const feeLabel = SERVICE_TYPE_LABELS[serviceType] || "Service Fee";

    // Get country config for VAT rate (all entries in this group share the same country)
    const countryConfig = entries[0].countryConfig;
    const vatApplicable = countryConfig?.vatApplicable ?? false;
    const vatRate = vatApplicable ? parseFloat(countryConfig?.vatRate?.toString() ?? "0") : 0;

    let totalSubtotal = 0; // Sum of all item amounts (employment costs + service fees)
    let totalTax = 0;
    const lineItems: InsertInvoiceItem[] = [];

    // Get exchange rate for this local currency
    let exchangeRate = 1;
    let rateWithMarkup = 1;

    if (localCurrency !== settlementCurrency) {
      const rateData = await getExchangeRate(localCurrency, settlementCurrency);
      if (rateData) {
        exchangeRate = rateData.rate;
        rateWithMarkup = rateData.rateWithMarkup;
      } else {
        warnings.push(
          `No exchange rate found for ${localCurrency} → ${settlementCurrency}. Using 1:1 rate.`
        );
      }
    }

    // Create Employment Cost items (one per employee)
    // Each item has its own vatRate in the Tax column
    for (const entry of entries) {
      const emp = entry.employee;
      const totalCostLocal = parseFloat(entry.item.totalEmploymentCost?.toString() ?? "0");
      const costInSettlement = totalCostLocal * rateWithMarkup;

      // Tax is calculated on the settlement currency amount
      const taxAmount = costInSettlement * (vatRate / 100);

      totalSubtotal += costInSettlement;
      totalTax += taxAmount;

      const empCode = emp.employeeCode || `EMP${emp.id}`;
      const empName = `${emp.firstName} ${emp.lastName}`;

      lineItems.push({
        invoiceId: 0,
        employeeId: entry.item.employeeId,
        description: `${empCode} ${empName} - ${monthLabel}`,
        quantity: "1",
        unitPrice: totalCostLocal.toFixed(2),
        amount: totalCostLocal.toFixed(2),
        itemType: "employment_cost",
        vatRate: vatRate.toFixed(2),
        countryCode: entry.run.countryCode,
        localCurrency,
        localAmount: totalCostLocal.toFixed(2),
        exchangeRate: exchangeRate.toString(),
        exchangeRateWithMarkup: rateWithMarkup.toString(),
      });
    }

    // Create Service Fee item (merged, Qty = number of employees)
    // Service fees are NOT subject to VAT (vatRate = 0)
    if (serviceFeeRate > 0) {
      const totalFee = serviceFeeRate * entries.length;
      // No VAT on service fees

      totalSubtotal += totalFee;
      // totalTax unchanged — service fees do not attract VAT

      lineItems.push({
        invoiceId: 0,
        description: `${feeLabel} - ${monthLabel}`,
        quantity: entries.length.toString(),
        unitPrice: serviceFeeRate.toFixed(2),
        amount: totalFee.toFixed(2),
        itemType: feeItemType as any,
        vatRate: "0.00",
        countryCode,
      });
    }

    // Total = subtotal + tax (NO separate serviceFeeTotal — service fees are part of subtotal)
    const total = totalSubtotal + totalTax;

    // Generate invoice number
    const billingEntityId = customer.billingEntityId || null;
    const invoiceNumber = await generateInvoiceNumber(billingEntityId, payrollMonth);

    // Due Date = Issue Date + Customer Payment Term Days
    const issueDate = new Date();
    const termDays = customer.paymentTermDays || 30;
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + termDays);

    // Get country name for notes
    const countryName = countryConfig?.countryName || countryCode;

    const invoiceData: InsertInvoice = {
      customerId,
      billingEntityId,
      invoiceNumber,
      invoiceType: invoiceType as any,
      invoiceMonth: payrollMonthStr, // text column: use YYYY-MM-DD string
      currency: settlementCurrency,
      exchangeRate: exchangeRate.toString(),
      exchangeRateWithMarkup: rateWithMarkup.toString(),
      subtotal: totalSubtotal.toFixed(2),
      serviceFeeTotal: "0.00", // Service fees are included in subtotal
      tax: totalTax.toFixed(2),
      total: total.toFixed(2),
      status: "draft",
      dueDate: dueDate.toISOString().slice(0, 10), // text column: use YYYY-MM-DD string
      amountDue: total.toFixed(2),
      notes: `Auto-generated ${feeLabel.replace(" Fee", "")} invoice for ${monthLabel} — ${countryName}`,
    };

    const invoiceInsertResult = await db.insert(invoices).values(invoiceData);
    const invoiceId = (invoiceInsertResult as any)[0]?.insertId as number;

    // Set invoiceId on all line items
    const finalLineItems = lineItems.map((li) => ({ ...li, invoiceId }));

    if (finalLineItems.length > 0) {
      await db.insert(invoiceItems).values(finalLineItems);
    }

    return invoiceId;
  } catch (error) {
    console.error("[InvoiceGeneration] Error creating group invoice:", error);
    return null;
  }
}

/**
 * Get invoice generation status for a payroll month
 */
export async function getInvoiceGenerationStatus(payrollMonth: Date) {
  const db = await getDb();
  if (!db) return null;
  const y = payrollMonth.getUTCFullYear();
  const m = String(payrollMonth.getUTCMonth() + 1).padStart(2, "0");
  const d = String(payrollMonth.getUTCDate()).padStart(2, "0");
  const monthStr = `${y}-${m}-${d}`;
  const invoicesData = await db
    .select()
    .from(invoices)
    .where(sql`DATE(${invoices.invoiceMonth}) = ${monthStr}`);

  return {
    payrollMonth: payrollMonth.toISOString().split("T")[0],
    totalInvoices: invoicesData.length,
    byStatus: {
      draft: invoicesData.filter((i) => i.status === "draft").length,
      sent: invoicesData.filter((i) => i.status === "sent").length,
      paid: invoicesData.filter((i) => i.status === "paid").length,
      overdue: invoicesData.filter((i) => i.status === "overdue").length,
    },
  };
}

/**
 * Regenerate invoices for a payroll month (deletes old drafts and creates new ones)
 */
/**
 * Regenerate a single invoice: delete its items and recreate from payroll data
 * Only works for draft auto-generated invoices
 */
export async function regenerateSingleInvoice(
  invoiceId: number
): Promise<InvoiceGenerationResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available", error: "DB_ERROR" };
  }

  try {
    // Get the invoice
    const invoiceData = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
    if (invoiceData.length === 0) {
      return { success: false, message: "Invoice not found", error: "NOT_FOUND" };
    }

    const invoice = invoiceData[0];
    if (invoice.status !== "draft") {
      return { success: false, message: "Only draft invoices can be regenerated", error: "INVALID_STATUS" };
    }

    if (!invoice.invoiceMonth) {
      return { success: false, message: "Invoice has no invoice month, cannot regenerate", error: "NO_MONTH" };
    }

    // Delete existing items
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
    // Delete the invoice itself
    await db.delete(invoices).where(eq(invoices.id, invoiceId));

    // Regenerate all invoices for that month (will recreate this one along with others)
    const result = await generateInvoicesFromPayroll(new Date(invoice.invoiceMonth));

    return {
      ...result,
      message: result.success
        ? `Invoice #${invoice.invoiceNumber} regenerated successfully (${result.invoiceIds?.length || 0} invoices created for the month)`
        : result.message,
    };
  } catch (error) {
    console.error("[InvoiceGeneration] Error regenerating single invoice:", error);
    return {
      success: false,
      message: "Failed to regenerate invoice",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

/**
 * Regenerate invoices for a payroll month (deletes old drafts and creates new ones)
 */
export async function regenerateInvoices(
  payrollMonth: Date
): Promise<InvoiceGenerationResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available", error: "DB_ERROR" };
  }

  try {
    const ry = payrollMonth.getUTCFullYear();
    const rm = String(payrollMonth.getUTCMonth() + 1).padStart(2, "0");
    const rd = String(payrollMonth.getUTCDate()).padStart(2, "0");
    const regenMonthStr = `${ry}-${rm}-${rd}`;
    const draftInvoices = await db
      .select()
      .from(invoices)
      .where(
        and(
          sql`DATE(${invoices.invoiceMonth}) = ${regenMonthStr}`,
          eq(invoices.status, "draft")
        )
      );

    for (const invoice of draftInvoices) {
      if (invoice.id) {
        await db
          .delete(invoiceItems)
          .where(eq(invoiceItems.invoiceId, invoice.id));
        await db.delete(invoices).where(eq(invoices.id, invoice.id));
      }
    }

    return await generateInvoicesFromPayroll(payrollMonth);
  } catch (error) {
    console.error("[InvoiceGeneration] Error regenerating invoices:", error);
    return {
      success: false,
      message: "Failed to regenerate invoices",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}
