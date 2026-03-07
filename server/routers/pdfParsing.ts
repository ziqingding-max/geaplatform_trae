import { z } from "zod";
import { router } from "../_core/trpc";
import { financeManagerProcedure } from "../procedures";
import { executeTaskLLM } from "../services/aiGatewayService";
import { storagePut, storageGet, storageDownload } from "../storage";
import {
  createVendorBill,
  createVendorBillItem,
  getVendorBillById,
  updateVendorBill,
  listVendors,
  createVendor,
  createBillInvoiceAllocation,
  recalcBillAllocation,
  recalcInvoiceCostAllocation,
  logAuditAction,
  getDb,
} from "../db";
import {
  employees,
  invoices,
  invoiceItems,
  vendors,
  customers,
} from "../../drizzle/schema";
import { eq, like, sql, and, inArray, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Helper: Build system context for AI (employees, customers, invoices for a given month)
async function buildSystemContext(serviceMonth?: string) {
  const db = await getDb();
  if (!db) return { employees: [], customers: [], invoices: [], summary: "No database available" };

  // Get all active employees with their customer info
  const empRows = await db
    .select({
      id: employees.id,
      employeeCode: employees.employeeCode,
      firstName: employees.firstName,
      lastName: employees.lastName,
      country: employees.country,
      customerId: employees.customerId,
      jobTitle: employees.jobTitle,
      baseSalary: employees.baseSalary,
      salaryCurrency: employees.salaryCurrency,
    })
    .from(employees)
    .where(eq(employees.status, "active"));

  // Get all active customers
  const custRows = await db
    .select({
      id: customers.id,
      clientCode: customers.clientCode,
      companyName: customers.companyName,
      country: customers.country,
      settlementCurrency: customers.settlementCurrency,
    })
    .from(customers)
    .where(eq(customers.status, "active"));

  // Get invoices for the service month (or recent invoices if no month specified)
  let invQuery = db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      customerId: invoices.customerId,
      invoiceType: invoices.invoiceType,
      currency: invoices.currency,
      total: invoices.total,
      status: invoices.status,
      invoiceMonth: invoices.invoiceMonth,
    })
    .from(invoices);

  let invRows;
  if (serviceMonth) {
    // serviceMonth is YYYY-MM, invoiceMonth is stored as date YYYY-MM-DD
    invRows = await invQuery
      .where(
        sql`strftime('%Y-%m', ${invoices.invoiceMonth}) = ${serviceMonth} OR strftime('%Y-%m', ${invoices.createdAt}, 'unixepoch') = ${serviceMonth}`
      )
      .orderBy(desc(invoices.createdAt))
      .limit(200);
  } else {
    invRows = await invQuery
      .orderBy(desc(invoices.createdAt))
      .limit(100);
  }

  // Get invoice items with employee links for matching
  const invIds = invRows.map((i) => i.id);
  let invItemRows: Array<{
    invoiceId: number;
    employeeId: number | null;
    description: string;
    amount: string | number;
    countryCode: string | null;
  }> = [];
  if (invIds.length > 0) {
    invItemRows = await db
      .select({
        invoiceId: invoiceItems.invoiceId,
        employeeId: invoiceItems.employeeId,
        description: invoiceItems.description,
        amount: invoiceItems.amount,
        countryCode: invoiceItems.countryCode,
      })
      .from(invoiceItems)
      .where(inArray(invoiceItems.invoiceId, invIds));
  }

  // Build employee-to-invoice mapping
  const empInvoiceMap: Record<number, Array<{ invoiceId: number; invoiceNumber: string; customerId: number; amount: string | number }>> = {};
  for (const item of invItemRows) {
    if (item.employeeId) {
      if (!empInvoiceMap[item.employeeId]) empInvoiceMap[item.employeeId] = [];
      const inv = invRows.find((i) => i.id === item.invoiceId);
      if (inv) {
        empInvoiceMap[item.employeeId].push({
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerId: inv.customerId,
          amount: item.amount,
        });
      }
    }
  }

  // Format context for AI
  const empContext = empRows.map((e) => ({
    id: e.id,
    code: e.employeeCode,
    name: `${e.firstName} ${e.lastName}`,
    country: e.country,
    customerId: e.customerId,
    customerName: custRows.find((c) => c.id === e.customerId)?.companyName || "Unknown",
    salary: `${e.salaryCurrency} ${e.baseSalary}`,
    linkedInvoices: empInvoiceMap[e.id] || [],
  }));

  const custContext = custRows.map((c) => ({
    id: c.id,
    code: c.clientCode,
    name: c.companyName,
    country: c.country,
    currency: c.settlementCurrency,
  }));

  const invContext = invRows.map((i) => ({
    id: i.id,
    number: i.invoiceNumber,
    customerId: i.customerId,
    customerName: custRows.find((c) => c.id === i.customerId)?.companyName || "Unknown",
    type: i.invoiceType,
    currency: i.currency,
    total: i.total,
    status: i.status,
    month: i.invoiceMonth,
  }));

  return {
    employees: empContext,
    customers: custContext,
    invoices: invContext,
    summary: `${empContext.length} active employees, ${custContext.length} active customers, ${invContext.length} invoices`,
  };
}



export const pdfParsingRouter = router({
  // Multi-file AI parse: Upload multiple files for one vendor, cross-validate, and suggest allocations
  parseMultiFile: financeManagerProcedure
    .input(
      z.object({
        files: z.array(
          z.object({
            fileUrl: z.string(),
            fileKey: z.string(),
            fileName: z.string(),
            fileType: z.enum(["invoice", "payment_receipt", "statement", "other"]).default("invoice"),
          })
        ).min(1).max(10),
        serviceMonth: z.string(), // YYYY-MM format
        vendorId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Step 1: Build system context
      const systemContext = await buildSystemContext(input.serviceMonth);

      // Step 2: Build file content messages for AI
      // Get signed URLs for all files (Qwen needs publicly accessible URL)
      // Note: If using internal/private OSS in a different region than DashScope, URL access might fail.
      // So we download the file content and send it as base64 to ensure it works regardless of region.
      const fileMessages: Array<any> = [];
      for (const f of input.files) {
        try {
          let base64Content = "";
          // Default mime type fallback
          let mimeType = "application/pdf";
          const ext = f.fileName.split(".").pop()?.toLowerCase();
          if (ext === "png") mimeType = "image/png";
          else if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";

          if (f.fileKey) {
            // Download from storage
            const { content, contentType } = await storageDownload(f.fileKey);
            base64Content = content.toString("base64");
            if (contentType) mimeType = contentType;
          } else if (f.fileUrl.startsWith("data:")) {
            // Already base64
            base64Content = f.fileUrl.split(",")[1];
            const meta = f.fileUrl.split(",")[0];
            const match = meta.match(/:(.*?);/);
            if (match) mimeType = match[1];
          } else {
             // It's a remote URL, try to fetch it
             const resp = await fetch(f.fileUrl);
             const arrayBuffer = await resp.arrayBuffer();
             base64Content = Buffer.from(arrayBuffer).toString("base64");
             const ct = resp.headers.get("content-type");
             if (ct) mimeType = ct;
          }
          
          fileMessages.push({
            type: "image_url" as const,
            image_url: {
              url: `data:${mimeType};base64,${base64Content}`,
            },
          });
        } catch (e) {
          console.warn(`Failed to process file ${f.fileName} for AI analysis`, e);
          // If download fails, try falling back to the URL method, though likely to fail too if region issue
          fileMessages.push({
            type: "image_url" as const,
            image_url: {
              url: f.fileUrl,
            },
          });
        }
      }

      // Step 3: Call AI with all files + system context
      const response = await executeTaskLLM("vendor_bill_parse", {
        messages: [
          {
            role: "system",
            content: `You are a senior financial analyst for an EOR (Employer of Record) company called Best GEA.
You are analyzing multiple documents from a SINGLE vendor for the service month ${input.serviceMonth}.
The documents may include invoices, payment receipts (POP), bank statements, or other supporting documents.

YOUR TASK:
1. Cross-reference ALL uploaded documents to extract and verify vendor bill information
2. Match line items to employees and customers in our system
3. Suggest cost allocations (link vendor costs to our customer invoices)
4. Report confidence levels and any discrepancies between documents

SYSTEM DATA (our active employees, customers, and invoices):
${JSON.stringify(systemContext.employees.slice(0, 200), null, 1)}

CUSTOMERS:
${JSON.stringify(systemContext.customers, null, 1)}

INVOICES FOR ${input.serviceMonth}:
${JSON.stringify(systemContext.invoices.slice(0, 100), null, 1)}

Return a JSON object with these fields:
- overallConfidence: number (0-100, how confident you are in the overall extraction)
- vendor: object with:
  - name: string (vendor company name)
  - legalName: string | null
  - country: string (vendor's country)
  - address: string | null
  - city: string | null
  - contactName: string | null
  - contactEmail: string | null
  - contactPhone: string | null
  - taxId: string | null
  - serviceType: string | null (e.g. "Payroll Processing", "Legal", "IT Services")
  - vendorType: string ("client_related" if costs relate to specific employees/customers, "operational" if general business cost)
  - confidence: number (0-100)
- bill: object with:
  - invoiceNumber: string
  - invoiceDate: string (YYYY-MM-DD)
  - dueDate: string | null (YYYY-MM-DD)
  - serviceMonth: string (YYYY-MM)
  - currency: string (3-letter code)
  - subtotal: number
  - tax: number
  - totalAmount: number
  - category: string (one of: payroll_processing, social_contributions, tax_filing, legal_compliance, visa_immigration, hr_advisory, it_services, office_rent, insurance, bank_charges, consulting, equipment, travel, marketing, other)
  - billType: string (one of: "operational", "deposit", "deposit_refund"). Use "deposit" if the bill is for a security deposit, guarantee deposit, or refundable advance payment to the vendor. Use "deposit_refund" if the vendor is returning a previously paid deposit. Use "operational" for all regular service/expense bills.
  - description: string
  - confidence: number (0-100)
- payment: object | null (if POP/receipt is included):
  - bankName: string
  - transactionReference: string
  - paymentDate: string (YYYY-MM-DD)
  - localCurrency: string
  - localAmount: number
  - usdAmount: number
  - exchangeRate: number | null
  - bankFee: number
  - confidence: number (0-100)
- lineItems: array of objects, each with:
  - description: string
  - employeeName: string | null (employee name as shown in document)
  - matchedEmployeeId: number | null (ID from our system if matched, from the SYSTEM DATA above)
  - matchedCustomerId: number | null (customer ID from our system if matched via employee)
  - matchedInvoiceId: number | null (invoice ID from our system if matched)
  - quantity: number
  - unitPrice: number
  - amount: number
  - countryCode: string | null (2-3 letter country code)
  - confidence: number (0-100)
  - allocationSuggestion: object | null (only for client_related vendor type):
    - invoiceId: number (from our system)
    - employeeId: number (from our system)
    - allocatedAmount: number
    - reason: string (why this allocation is suggested)
- crossValidation: object with:
  - invoiceVsPaymentMatch: boolean | null (do invoice total and payment amount match?)
  - invoiceVsPaymentDifference: number | null (difference if any)
  - lineItemsSumMatchesTotal: boolean (do line items sum to the total?)
  - lineItemsSumDifference: number (difference if any)
  - documentsAnalyzed: number (how many files were successfully parsed)
  - warnings: array of strings (any discrepancies or issues found)
  - notes: array of strings (any helpful observations)

IMPORTANT RULES:
- Match employees by name carefully. Names may appear in different orders (e.g. "John Smith" vs "Smith, John") or with slight variations.
- For matchedEmployeeId, ONLY use IDs from the SYSTEM DATA provided. If no match, use null.
- For matchedCustomerId, derive from the matched employee's customerId in SYSTEM DATA.
- For matchedInvoiceId, find the invoice linked to the matched employee for this service month.
- Be conservative with confidence scores. Use 90+ only when data is clearly readable and cross-validated.
- If a field is missing or unclear, use null and lower the confidence.
- For operational costs (bank fees, office rent, etc.), set vendorType to "operational" and skip allocation suggestions.`,
          },
          {
            role: "user",
            content: [
              ...fileMessages,
              {
                type: "text",
                text: `I'm uploading ${input.files.length} document(s) from a single vendor for service month ${input.serviceMonth}. File types: ${input.files.map((f) => `${f.fileName} (${f.fileType})`).join(", ")}. Please analyze all documents together, cross-validate the information, and provide structured extraction with confidence scores and allocation suggestions.`,
              },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "multi_file_vendor_parse",
            strict: true,
            schema: {
              type: "object",
              properties: {
                overallConfidence: { type: "number" },
                vendor: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    legalName: { type: ["string", "null"] },
                    country: { type: "string" },
                    address: { type: ["string", "null"] },
                    city: { type: ["string", "null"] },
                    contactName: { type: ["string", "null"] },
                    contactEmail: { type: ["string", "null"] },
                    contactPhone: { type: ["string", "null"] },
                    taxId: { type: ["string", "null"] },
                    serviceType: { type: ["string", "null"] },
                    vendorType: { type: "string" },
                    confidence: { type: "number" },
                  },
                  required: ["name", "legalName", "country", "address", "city", "contactName", "contactEmail", "contactPhone", "taxId", "serviceType", "vendorType", "confidence"],
                  additionalProperties: false,
                },
                bill: {
                  type: "object",
                  properties: {
                    invoiceNumber: { type: "string" },
                    invoiceDate: { type: "string" },
                    dueDate: { type: ["string", "null"] },
                    serviceMonth: { type: "string" },
                    currency: { type: "string" },
                    subtotal: { type: "number" },
                    tax: { type: "number" },
                    totalAmount: { type: "number" },
                    category: { type: "string" },
                    billType: { type: "string", enum: ["operational", "deposit", "deposit_refund"] },
                    description: { type: "string" },
                    confidence: { type: "number" },
                  },
                  required: ["invoiceNumber", "invoiceDate", "dueDate", "serviceMonth", "currency", "subtotal", "tax", "totalAmount", "category", "billType", "description", "confidence"],
                  additionalProperties: false,
                },
                payment: {
                  type: ["object", "null"],
                  properties: {
                    bankName: { type: "string" },
                    transactionReference: { type: "string" },
                    paymentDate: { type: "string" },
                    localCurrency: { type: "string" },
                    localAmount: { type: "number" },
                    usdAmount: { type: "number" },
                    exchangeRate: { type: ["number", "null"] },
                    bankFee: { type: "number" },
                    confidence: { type: "number" },
                  },
                  required: ["bankName", "transactionReference", "paymentDate", "localCurrency", "localAmount", "usdAmount", "exchangeRate", "bankFee", "confidence"],
                  additionalProperties: false,
                },
                lineItems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      employeeName: { type: ["string", "null"] },
                      matchedEmployeeId: { type: ["number", "null"] },
                      matchedCustomerId: { type: ["number", "null"] },
                      matchedInvoiceId: { type: ["number", "null"] },
                      quantity: { type: "number" },
                      unitPrice: { type: "number" },
                      amount: { type: "number" },
                      countryCode: { type: ["string", "null"] },
                      confidence: { type: "number" },
                      allocationSuggestion: {
                        type: ["object", "null"],
                        properties: {
                          invoiceId: { type: "number" },
                          employeeId: { type: "number" },
                          allocatedAmount: { type: "number" },
                          reason: { type: "string" },
                        },
                        required: ["invoiceId", "employeeId", "allocatedAmount", "reason"],
                        additionalProperties: false,
                      },
                    },
                    required: ["description", "employeeName", "matchedEmployeeId", "matchedCustomerId", "matchedInvoiceId", "quantity", "unitPrice", "amount", "countryCode", "confidence", "allocationSuggestion"],
                    additionalProperties: false,
                  },
                },
                crossValidation: {
                  type: "object",
                  properties: {
                    invoiceVsPaymentMatch: { type: ["boolean", "null"] },
                    invoiceVsPaymentDifference: { type: ["number", "null"] },
                    lineItemsSumMatchesTotal: { type: "boolean" },
                    lineItemsSumDifference: { type: "number" },
                    documentsAnalyzed: { type: "number" },
                    warnings: { type: "array", items: { type: "string" } },
                    notes: { type: "array", items: { type: "string" } },
                  },
                  required: ["invoiceVsPaymentMatch", "invoiceVsPaymentDifference", "lineItemsSumMatchesTotal", "lineItemsSumDifference", "documentsAnalyzed", "warnings", "notes"],
                  additionalProperties: false,
                },
              },
              required: ["overallConfidence", "vendor", "bill", "payment", "lineItems", "crossValidation"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI failed to parse documents" });
      }

      const parsed = JSON.parse(content);

      // Step 4: Try to match or auto-create vendor
      parsed.vendorMatch = null;
      if (parsed.vendor?.name && !input.vendorId) {
        const vendorList = await listVendors({ search: parsed.vendor.name }, 5, 0);
        if (vendorList.data.length > 0) {
          parsed.vendorMatch = {
            status: "matched",
            vendor: {
              id: vendorList.data[0].id,
              name: vendorList.data[0].name,
              vendorCode: vendorList.data[0].vendorCode,
              country: vendorList.data[0].country,
            },
          };
        } else {
          // Auto-create vendor
          try {
            const newVendorData: any = {
              name: parsed.vendor.name,
              legalName: parsed.vendor.legalName || undefined,
              country: parsed.vendor.country || "Unknown",
              address: parsed.vendor.address || undefined,
              city: parsed.vendor.city || undefined,
              contactName: parsed.vendor.contactName || undefined,
              contactEmail: parsed.vendor.contactEmail || undefined,
              contactPhone: parsed.vendor.contactPhone || undefined,
              taxId: parsed.vendor.taxId || undefined,
              serviceType: parsed.vendor.serviceType || undefined,
              vendorType: parsed.vendor.vendorType || "client_related",
              currency: parsed.bill?.currency || "USD",
              paymentTermDays: 30,
              status: "active" as const,
              notes: `Auto-created from AI parsing (${input.files.length} files, ${input.serviceMonth})`,
            };
            const newVendorId = await createVendor(newVendorData);
            const vendorCode = `VND-${String(newVendorId).padStart(4, "0")}`;

            parsed.vendorMatch = {
              status: "auto_created",
              vendor: {
                id: newVendorId,
                name: parsed.vendor.name,
                vendorCode,
                country: parsed.vendor.country || "Unknown",
              },
            };

            await logAuditAction({
              userId: ctx.user.id,
              userName: ctx.user.name || ctx.user.email || "Unknown",
              action: "create",
              entityType: "vendor",
              entityId: newVendorId,
              changes: { source: "ai_multi_file_parse", created: newVendorData },
            });
          } catch (err) {
            console.error("Auto-create vendor failed:", err);
            parsed.vendorMatch = { status: "not_found", vendor: null };
          }
        }
      } else if (input.vendorId) {
        const vendorList = await listVendors({}, 1, 0);
        const db = await getDb();
        if (db) {
          const vRows = await db.select().from(vendors).where(eq(vendors.id, input.vendorId)).limit(1);
          if (vRows[0]) {
            parsed.vendorMatch = {
              status: "pre_selected",
              vendor: {
                id: vRows[0].id,
                name: vRows[0].name,
                vendorCode: vRows[0].vendorCode,
                country: vRows[0].country,
              },
            };
          }
        }
      }

      return {
        parsed,
        files: input.files,
        serviceMonth: input.serviceMonth,
      };
    }),

  // Apply parsed multi-file result: create bill + items + optional allocations
  applyMultiFileParse: financeManagerProcedure
    .input(
      z.object({
        vendorId: z.number(),
        billNumber: z.string(),
        billDate: z.string(),
        dueDate: z.string().optional(),
        billMonth: z.string().optional(),
        currency: z.string().default("USD"),
        subtotal: z.string(),
        tax: z.string().default("0"),
        totalAmount: z.string(),
        category: z.enum([
          "payroll_processing", "social_contributions", "tax_filing",
          "legal_compliance", "visa_immigration", "hr_advisory",
          "it_services", "office_rent", "insurance", "bank_charges",
          "consulting", "equipment", "travel", "marketing", "other",
        ]).default("other"),
        billType: z.enum(["operational", "deposit", "deposit_refund"]).default("operational"),
        description: z.string().optional(),
        receiptFileUrl: z.string().optional(),
        receiptFileKey: z.string().optional(),
        // Payment info (from POP)
        paymentInfo: z.object({
          paidDate: z.string(),
          paidAmount: z.string(),
          bankReference: z.string(),
          bankName: z.string(),
          bankFee: z.string().default("0"),
        }).optional(),
        // Line items
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.string().default("1"),
            unitPrice: z.string(),
            amount: z.string(),
            relatedEmployeeId: z.number().optional(),
            relatedCustomerId: z.number().optional(),
            relatedCountryCode: z.string().optional(),
          })
        ).optional(),
        // Allocation suggestions to auto-create
        allocations: z.array(
          z.object({
            invoiceId: z.number(),
            employeeId: z.number(),
            allocatedAmount: z.string(),
            description: z.string().optional(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { items, allocations, paymentInfo, ...billData } = input;

      // Create the vendor bill
      const billValues: any = {
        ...billData,
        billDate: new Date(billData.billDate),
        dueDate: billData.dueDate ? new Date(billData.dueDate) : undefined,
        billMonth: billData.billMonth ? new Date(`${billData.billMonth}-01`) : undefined,
        submittedBy: ctx.user.id,
        submittedAt: new Date(),
        status: paymentInfo ? "paid" : "pending_approval",
      };

      // If payment info provided, add it
      if (paymentInfo) {
        billValues.paidDate = new Date(paymentInfo.paidDate);
        billValues.paidAmount = paymentInfo.paidAmount;
        billValues.bankReference = paymentInfo.bankReference;
        billValues.bankName = paymentInfo.bankName;
        billValues.bankFee = paymentInfo.bankFee;
      }

      const billId = await createVendorBill(billValues);

      // Create line items
      const itemIds: number[] = [];
      if (items && items.length > 0 && billId) {
        for (const item of items) {
          const itemId = await createVendorBillItem({
            vendorBillId: billId,
            ...item,
          });
          itemIds.push(itemId);
        }
      }

      // Create allocations
      let allocationsCreated = 0;
      if (allocations && allocations.length > 0 && billId) {
        const affectedInvoices: number[] = [];
        for (const alloc of allocations) {
          try {
            await createBillInvoiceAllocation({
              vendorBillId: billId,
              invoiceId: alloc.invoiceId,
              employeeId: alloc.employeeId,
              allocatedAmount: alloc.allocatedAmount,
              description: alloc.description || "Auto-allocated from AI parsing",
              allocatedBy: ctx.user.id,
            });
            allocationsCreated++;
            if (!affectedInvoices.includes(alloc.invoiceId)) {
              affectedInvoices.push(alloc.invoiceId);
            }
          } catch (err) {
            console.error("Failed to create allocation:", err);
          }
        }
        // Recalculate denormalized fields
        await recalcBillAllocation(billId);
        for (const invoiceId of affectedInvoices) {
          await recalcInvoiceCostAllocation(invoiceId);
        }
      }

      // If bank fee > 0 and payment info provided, create separate bank_charges bill
      if (paymentInfo && parseFloat(paymentInfo.bankFee) > 0) {
        const bankFeeBill: any = {
          vendorId: input.vendorId,
          billNumber: `FEE-${paymentInfo.bankReference}`,
          billDate: new Date(paymentInfo.paidDate),
          currency: "USD",
          subtotal: paymentInfo.bankFee,
          tax: "0",
          totalAmount: paymentInfo.bankFee,
          paidAmount: paymentInfo.bankFee,
          status: "paid",
          paidDate: new Date(paymentInfo.paidDate),
          category: "bank_charges",
          description: `Bank wire fee for ${billData.billNumber} via ${paymentInfo.bankName}`,
          bankReference: paymentInfo.bankReference,
          bankName: paymentInfo.bankName,
          submittedBy: ctx.user.id,
          submittedAt: new Date(),
        };
        await createVendorBill(bankFeeBill);
      }

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || "Unknown",
        action: "create",
        entityType: "vendor_bill",
        entityId: billId,
        changes: {
          source: "ai_multi_file_parse",
          created: { ...billData, itemCount: items?.length || 0, allocationsCreated },
        },
      });

      return {
        id: billId,
        itemsCreated: itemIds.length,
        allocationsCreated,
        message: "Vendor bill created from AI analysis",
      };
    }),

  // Upload file to S3 (generic helper for file uploads)
  uploadFile: financeManagerProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileBase64: z.string(),
        contentType: z.string().default("application/pdf"),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const randomSuffix = Math.random().toString(36).slice(2, 8);
      const fileKey = `vendor-docs/${Date.now()}-${randomSuffix}-${input.fileName}`;
      const { url, key } = await storagePut(fileKey, buffer, input.contentType);
      return { url, key };
    }),

  // Legacy: Single file parse (kept for backward compatibility)
  parseVendorInvoice: financeManagerProcedure
    .input(
      z.object({
        fileUrl: z.string(),
        fileKey: z.string(),
        vendorId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Redirect to multi-file parse with single file
      const response = await executeTaskLLM("vendor_bill_parse", {
        messages: [
          {
            role: "system",
            content: `You are a financial document parser specializing in vendor invoices for an EOR (Employer of Record) company.
Extract the following information from the vendor invoice.

Return a JSON object with these fields:
- vendorName: string
- vendorCountry: string
- invoiceNumber: string
- invoiceDate: string (YYYY-MM-DD)
- dueDate: string | null (YYYY-MM-DD)
- serviceMonth: string | null (YYYY-MM)
- currency: string (3-letter code)
- subtotal: number
- tax: number
- totalAmount: number
- category: string (one of: payroll_processing, social_contributions, tax_filing, legal_compliance, visa_immigration, hr_advisory, it_services, office_rent, insurance, bank_charges, consulting, equipment, travel, marketing, other)
- billType: string (one of: "operational", "deposit", "deposit_refund"). Use "deposit" if the bill is for a security deposit, guarantee deposit, or refundable advance payment. Use "deposit_refund" if the vendor is returning a previously paid deposit. Use "operational" for all regular service/expense bills.
- description: string
- lineItems: array of { description: string, employeeName: string | null, quantity: number, unitPrice: number, amount: number, countryCode: string | null }

Be precise with numbers. If a field is not found, use null.`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: input.fileUrl },
              },
              { type: "text", text: "Parse this vendor invoice." },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "vendor_invoice_parse",
            strict: true,
            schema: {
              type: "object",
              properties: {
                vendorName: { type: "string" },
                vendorCountry: { type: "string" },
                invoiceNumber: { type: "string" },
                invoiceDate: { type: "string" },
                dueDate: { type: ["string", "null"] },
                serviceMonth: { type: ["string", "null"] },
                currency: { type: "string" },
                subtotal: { type: "number" },
                tax: { type: "number" },
                totalAmount: { type: "number" },
                category: { type: "string" },
                billType: { type: "string", enum: ["operational", "deposit", "deposit_refund"] },
                description: { type: "string" },
                lineItems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      employeeName: { type: ["string", "null"] },
                      quantity: { type: "number" },
                      unitPrice: { type: "number" },
                      amount: { type: "number" },
                      countryCode: { type: ["string", "null"] },
                    },
                    required: ["description", "employeeName", "quantity", "unitPrice", "amount", "countryCode"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["vendorName", "vendorCountry", "invoiceNumber", "invoiceDate", "dueDate", "serviceMonth", "currency", "subtotal", "tax", "totalAmount", "category", "billType", "description", "lineItems"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse PDF" });
      }

      const parsed = JSON.parse(content);

      // Try to match vendor
      if (parsed.vendorName && !input.vendorId) {
        const vendorList = await listVendors({ search: parsed.vendorName }, 5, 0);
        parsed.matchedVendors = vendorList.data.map((v: any) => ({
          id: v.id,
          name: v.name,
          vendorCode: v.vendorCode,
          country: v.country,
        }));
      }

      return { parsed, fileUrl: input.fileUrl, fileKey: input.fileKey };
    }),

  // Legacy: Apply single vendor invoice (kept for backward compatibility)
  applyVendorInvoice: financeManagerProcedure
    .input(
      z.object({
        vendorId: z.number(),
        billNumber: z.string(),
        billDate: z.string(),
        dueDate: z.string().optional(),
        billMonth: z.string().optional(),
        currency: z.string().default("USD"),
        subtotal: z.string(),
        tax: z.string().default("0"),
        totalAmount: z.string(),
        category: z.enum([
          "payroll_processing", "social_contributions", "tax_filing",
          "legal_compliance", "visa_immigration", "hr_advisory",
          "it_services", "office_rent", "insurance", "bank_charges",
          "consulting", "equipment", "travel", "marketing", "other",
        ]).default("other"),
        billType: z.enum(["operational", "deposit", "deposit_refund"]).default("operational"),
        description: z.string().optional(),
        receiptFileUrl: z.string().optional(),
        receiptFileKey: z.string().optional(),
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.string().default("1"),
            unitPrice: z.string(),
            amount: z.string(),
            relatedEmployeeId: z.number().optional(),
            relatedCustomerId: z.number().optional(),
            relatedCountryCode: z.string().optional(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { items, ...billData } = input;
      const billValues: any = {
        ...billData,
        billDate: new Date(billData.billDate),
        dueDate: billData.dueDate ? new Date(billData.dueDate) : undefined,
        billMonth: billData.billMonth ? new Date(`${billData.billMonth}-01`) : undefined,
        submittedBy: ctx.user.id,
        submittedAt: new Date(),
        status: "pending_approval",
      };

      const insertId = await createVendorBill(billValues);

      if (items && items.length > 0 && insertId) {
        for (const item of items) {
          await createVendorBillItem({
            vendorBillId: insertId,
            ...item,
          });
        }
      }

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || "Unknown",
        action: "create",
        entityType: "vendor_bill",
        entityId: insertId,
        changes: { source: "pdf_parse", created: { ...billData, itemCount: items?.length || 0 } },
      });

      return { id: insertId, message: "Vendor bill created from parsed invoice" };
    }),
});
