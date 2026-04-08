import { z } from "zod";
import { router } from "../_core/trpc";
import { financeAndOpsProcedure } from "../procedures";
import { executeTaskLLM, uploadFileToDashScope } from "../services/aiGatewayService";
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
  contractors,
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
      jobDescription: employees.jobDescription,
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
        sql`LEFT(${invoices.invoiceMonth}, 7) = ${serviceMonth} OR to_char(${invoices.createdAt}, 'YYYY-MM') = ${serviceMonth}`
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
    contractorId: number | null;
    description: string;
    amount: string | number;
    countryCode: string | null;
  }> = [];
  if (invIds.length > 0) {
    invItemRows = await db
      .select({
        invoiceId: invoiceItems.invoiceId,
        employeeId: invoiceItems.employeeId,
        contractorId: invoiceItems.contractorId,
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

  // Build contractor-to-invoice mapping
  const ctrInvoiceMap: Record<number, Array<{ invoiceId: number; invoiceNumber: string; customerId: number; amount: string | number }>> = {};
  for (const item of invItemRows) {
    if (item.contractorId) {
      if (!ctrInvoiceMap[item.contractorId]) ctrInvoiceMap[item.contractorId] = [];
      const inv = invRows.find((i) => i.id === item.invoiceId);
      if (inv) {
        ctrInvoiceMap[item.contractorId].push({
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerId: inv.customerId,
          amount: item.amount,
        });
      }
    }
  }

  // Get all active contractors
  const ctrRows = await db
    .select({
      id: contractors.id,
      contractorCode: contractors.contractorCode,
      firstName: contractors.firstName,
      lastName: contractors.lastName,
      country: contractors.country,
      customerId: contractors.customerId,
    })
    .from(contractors)
    .where(eq(contractors.status, "active"));

  // Format context for AI
  const empContext = empRows.map((e) => ({
    id: e.id,
    type: 'employee' as const,
    code: e.employeeCode,
    name: `${e.firstName} ${e.lastName}`,
    country: e.country,
    customerId: e.customerId,
    customerName: custRows.find((c) => c.id === e.customerId)?.companyName || "Unknown",
    salary: `${e.salaryCurrency} ${e.baseSalary}`,
    linkedInvoices: empInvoiceMap[e.id] || [],
  }));

  const ctrContext = ctrRows.map((c) => ({
    id: c.id,
    type: 'contractor' as const,
    code: c.contractorCode,
    name: `${c.firstName} ${c.lastName}`,
    country: c.country,
    customerId: c.customerId,
    customerName: custRows.find((cu) => cu.id === c.customerId)?.companyName || "Unknown",
    linkedInvoices: ctrInvoiceMap[c.id] || [],
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
    contractors: ctrContext,
    customers: custContext,
    invoices: invContext,
    summary: `${empContext.length} active employees, ${ctrContext.length} active contractors, ${custContext.length} active customers, ${invContext.length} invoices`,
  };
}

/**
 * Helper: Download file content from various sources (storage key, data URL, or remote URL)
 * and upload to DashScope Files API to get a file-id for Qwen-Long.
 */
async function uploadFileForAI(fileUrl: string, fileKey: string, fileName: string): Promise<string> {
  let fileBuffer: Buffer;

  if (fileKey) {
    const { content } = await storageDownload(fileKey);
    fileBuffer = content;
  } else if (fileUrl.startsWith("data:")) {
    const base64Content = fileUrl.split(",")[1];
    fileBuffer = Buffer.from(base64Content, "base64");
  } else {
    const resp = await fetch(fileUrl);
    const arrayBuffer = await resp.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
  }

  // Upload to DashScope Files API (OpenAI-compatible endpoint)
  // Returns a file-id that can be referenced as fileid://<id> in system messages
  return await uploadFileToDashScope(fileBuffer, fileName);
}



export const pdfParsingRouter = router({
  // Multi-file AI parse: Upload multiple files for one vendor, cross-validate, and suggest allocations
  parseMultiFile: financeAndOpsProcedure
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

      // Step 2: Upload ALL files to DashScope and collect file-ids
      // Qwen-Long uses fileid:// references in system messages for document understanding.
      // This works for ALL file types: PDF, Excel, images, etc.
      const fileIds: string[] = [];
      const fileUploadErrors: string[] = [];
      
      for (const f of input.files) {
        try {
          const fileId = await uploadFileForAI(f.fileUrl, f.fileKey, f.fileName);
          fileIds.push(fileId);
        } catch (e: any) {
          console.warn(`Failed to upload file ${f.fileName} to DashScope:`, e?.message);
          fileUploadErrors.push(`${f.fileName}: ${e?.message || "upload failed"}`);
        }
      }

      if (fileIds.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `All file uploads failed: ${fileUploadErrors.join("; ")}`,
        });
      }

      // Step 3: Upload system context data as a JSON file to DashScope
      // This avoids the "Single round file-content exceeds token limit" error
      // by moving large structured data out of the system message into a fileid reference.
      const systemContextData = {
        serviceMonth: input.serviceMonth,
        employees: systemContext.employees.slice(0, 200),
        contractors: (systemContext as any).contractors?.slice(0, 100) || [],
        customers: systemContext.customers,
        invoices: systemContext.invoices.slice(0, 100),
      };
      const contextJsonBuffer = Buffer.from(JSON.stringify(systemContextData), "utf-8");

      let contextFileId: string | null = null;
      try {
        contextFileId = await uploadFileToDashScope(contextJsonBuffer, `system_context_${input.serviceMonth}.json`);
      } catch (e: any) {
        console.warn("Failed to upload system context to DashScope, will inline data:", e?.message);
      }

      // Step 4: Build Qwen-Long messages
      // Qwen-Long message format (per DashScope docs):
      //   - 1st system message: role definition + task instructions (compact, no large data)
      //   - Subsequent system messages: ONE fileid:// reference per message
      //     (DashScope requires each document in a SEPARATE system message)
      //   - user message: the actual question
      const fileIdSystemMessages: Array<{ role: "system"; content: string }> = [];
      if (contextFileId) {
        fileIdSystemMessages.push({ role: "system", content: `fileid://${contextFileId}` });
      }
      for (const id of fileIds) {
        fileIdSystemMessages.push({ role: "system", content: `fileid://${id}` });
      }

      // Build the system prompt — instructions only, no inline data.
      // When context upload fails, we fall back to a compact inline summary.
      const inlineDataFallback = contextFileId ? "" : `

FALLBACK — SYSTEM DATA (context file upload failed, providing compact inline data):
Employees (${systemContextData.employees.length}): ${JSON.stringify(systemContextData.employees.map((e: any) => ({id:e.id,code:e.code,name:e.name,country:e.country,custId:e.customerId})))}
Contractors (${systemContextData.contractors.length}): ${JSON.stringify(systemContextData.contractors.map((c: any) => ({id:c.id,code:c.code,name:c.name,country:c.country,custId:c.customerId})))}
Customers (${systemContextData.customers.length}): ${JSON.stringify(systemContextData.customers.map((c: any) => ({id:c.id,code:c.code,name:c.name,country:c.country})))}
Invoices (${systemContextData.invoices.length}): ${JSON.stringify(systemContextData.invoices.map((i: any) => ({id:i.id,num:i.number,custId:i.customerId,total:i.total,currency:i.currency})))}`;

      const response = await executeTaskLLM("vendor_bill_parse", {
        messages: [
          {
            role: "system",
            content: `You are a senior financial analyst for Best GEA, an EOR (Employer of Record) company.
Analyze the uploaded vendor documents for service month ${input.serviceMonth}.

DOCUMENTS: The uploaded files may include invoices, payment receipts (POP), bank statements, or supporting documents — all from a SINGLE vendor.

SYSTEM DATA: ${contextFileId ? "The file \"system_context_" + input.serviceMonth + ".json\" contains" : "See FALLBACK section below for"} our active employees, contractors, customers, and invoices for matching. Each employee/contractor has: id, code (e.g. EMP-0001/CTR-0001), name, country, customerId, customerName, linkedInvoices.

TASKS:
1. Extract and cross-validate vendor bill information from ALL documents
2. Match line items to employees/contractors in our system data
3. Classify each line item type and suggest cost allocations
4. Report confidence levels and discrepancies

OUTPUT FORMAT — Return a single JSON object:
{
  "overallConfidence": number (0-100),
  "vendor": {
    "name": string, "legalName": string|null, "country": string,
    "address": string|null, "city": string|null,
    "contactName": string|null, "contactEmail": string|null, "contactPhone": string|null,
    "taxId": string|null, "serviceType": string|null,
    "vendorType": "eor_vendor"|"bank_financial"|"recruitment_agency"|"equipment_provider"|"professional_service"|"client_related"|"operational",
    "confidence": number
  },
  "bill": {
    "invoiceNumber": string, "invoiceDate": "YYYY-MM-DD", "dueDate": "YYYY-MM-DD"|null,
    "serviceMonth": "YYYY-MM", "currency": "XXX",
    "subtotal": number, "tax": number, "totalAmount": number,
    "category": "payroll_processing"|"social_contributions"|"visa_immigration"|"consulting"|"equipment"|"insurance"|"other",
    "billType": "pass_through"|"vendor_service_fee"|"non_recurring"|"operational"|"mixed",
    "description": string, "confidence": number
  },
  "payment": null | {
    "bankName": string, "transactionReference": string, "paymentDate": "YYYY-MM-DD",
    "localCurrency": string, "localAmount": number, "usdAmount": number,
    "exchangeRate": number|null, "bankFee": number, "confidence": number
  },
  "lineItems": [{
    "description": string, "employeeName": string|null,
    "matchedEmployeeId": number|null, "matchedEmployeeCode": string|null,
    "matchedCustomerId": number|null, "matchedInvoiceId": number|null,
    "itemType": "employment_cost"|"service_fee"|"visa_fee"|"equipment_purchase"|"other",
    "quantity": number, "unitPrice": number, "amount": number,
    "countryCode": string|null, "confidence": number,
    "matchConfidence": number, "matchReason": string|null,
    "allocationSuggestion": null | {
      "invoiceId": number, "employeeId": number|null, "contractorId": number|null,
      "allocatedAmount": number, "reason": string
    }
  }],
  "crossValidation": {
    "invoiceVsPaymentMatch": boolean|null, "invoiceVsPaymentDifference": number|null,
    "lineItemsSumMatchesTotal": boolean, "lineItemsSumDifference": number,
    "documentsAnalyzed": number,
    "warnings": [string], "notes": [string]
  }
}

CLASSIFICATION RULES:
- category: "payroll_processing" for payroll/tax filing, "social_contributions" for social security/pension, "consulting" for HR advisory/legal, "other" for everything else.
- billType: "pass_through" for salary/social/tax paid on behalf of employees, "vendor_service_fee" for vendor's own fee, "non_recurring" for one-off costs (visa, equipment), "operational" for internal costs, "mixed" when a bill contains BOTH pass-through AND vendor fees.
- itemType (REQUIRED per line item): "employment_cost" for salary/wages/social/tax/pension, "service_fee" for vendor processing/management fee, "visa_fee" for visa/immigration, "equipment_purchase" for hardware, "other" otherwise. If bundled, classify as "employment_cost" and add warning.

MATCHING RULES:
- Employee/Contractor code (EMP-xxxx / CTR-xxxx) is the MOST RELIABLE identifier.
- Match by name if no code found. Names may appear in different orders or local scripts.
- NEVER guess. If matchConfidence < 50, set matchedEmployeeId/matchedContractorId to null.
- Only use IDs from system data. Derive matchedCustomerId from matched employee/contractor.
- In allocationSuggestion, set employeeId for EOR workers OR contractorId for AOR contractors, never both.

CONFIDENCE RULES:
- 90+: clearly readable, unambiguous, cross-validated across documents.
- 70-89: readable but minor ambiguity or not cross-validated.
- 50-69: requires inference or interpretation.
- <50: uncertain — set field to null and explain in matchReason or warnings.

GRACEFUL DEGRADATION: If a document is unreadable or partially parseable, still return the best extraction possible with low confidence scores and detailed warnings. Never return an empty result.${inlineDataFallback}`,
          },
          // Subsequent system messages: one fileid:// reference per message.
          // Per DashScope docs: "place the content of each document in a separate system message."
          ...fileIdSystemMessages,
          {
            role: "user",
            content: `Analyze ${input.files.length} document(s) for service month ${input.serviceMonth}: ${input.files.map((f) => `${f.fileName} (${f.fileType})`).join(", ")}. Cross-validate, extract structured data, match employees, and suggest allocations.`,
          },
        ],
        // IMPORTANT: qwen-long-latest only supports json_object mode, NOT json_schema.
        // Per DashScope docs (2026-02-24), json_schema is only supported by qwen-max/plus/flash series.
        response_format: {
          type: "json_object",
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI failed to parse documents" });
      }

      const parsed = JSON.parse(content);

      // Validate essential fields since json_object mode doesn't enforce schema
      if (!parsed.vendor || !parsed.bill || !Array.isArray(parsed.lineItems)) {
        console.error("[AI Parse] Missing required fields in AI response:", {
          hasVendor: !!parsed.vendor,
          hasBill: !!parsed.bill,
          hasLineItems: Array.isArray(parsed.lineItems),
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI response is missing required fields (vendor, bill, or lineItems). Please try again.",
        });
      }

      // Flatten bill fields to top level for frontend compatibility.
      // Frontend accesses p.billNumber, p.category, p.currency etc. at the top level,
      // while AI returns them nested under bill.invoiceNumber, bill.category, etc.
      if (parsed.bill) {
        parsed.billNumber = parsed.billNumber || parsed.bill.invoiceNumber;
        parsed.billDate = parsed.billDate || parsed.bill.invoiceDate;
        parsed.dueDate = parsed.dueDate || parsed.bill.dueDate;
        parsed.category = parsed.category || parsed.bill.category;
        parsed.billType = parsed.billType || parsed.bill.billType;
        parsed.currency = parsed.currency || parsed.bill.currency;
        parsed.subtotal = parsed.subtotal ?? parsed.bill.subtotal;
        parsed.tax = parsed.tax ?? parsed.bill.tax;
        parsed.totalAmount = parsed.totalAmount ?? parsed.bill.totalAmount;
        parsed.description = parsed.description || parsed.bill.description;
      }

      // Flatten lineItem fields for frontend compatibility.
      // Frontend expects relatedEmployeeId/relatedContractorId/relatedCountryCode,
      // while AI returns matchedEmployeeId/matchedContractorId/countryCode.
      if (parsed.lineItems) {
        parsed.lineItems = parsed.lineItems.map((item: any) => ({
          ...item,
          relatedEmployeeId: item.relatedEmployeeId ?? item.matchedEmployeeId ?? null,
          relatedContractorId: item.relatedContractorId ?? item.matchedContractorId ?? null,
          relatedCountryCode: item.relatedCountryCode || item.countryCode || null,
        }));
      }

      // Build suggestedAllocations from lineItem allocationSuggestions for frontend.
      // Frontend expects p.suggestedAllocations as a top-level array.
      // We enrich each allocation with human-readable names from systemContext
      // so the frontend can display worker name, customer name, and invoice number
      // instead of raw internal IDs.
      if (!parsed.suggestedAllocations && parsed.lineItems) {
        parsed.suggestedAllocations = parsed.lineItems
          .filter((item: any) => item.allocationSuggestion && item.allocationSuggestion.invoiceId)
          .map((item: any) => {
            const alloc = item.allocationSuggestion;
            const empId = alloc.employeeId || null;
            const ctrId = alloc.contractorId || null;
            const invId = alloc.invoiceId;

            // Resolve worker name and type from systemContext
            let workerName: string | null = null;
            let workerType: "employee" | "contractor" | null = null;
            let customerName: string | null = null;
            if (empId) {
              const emp = systemContextData.employees.find((e: any) => e.id === empId);
              workerName = emp?.name || item.employeeName || null;
              workerType = "employee";
              customerName = emp?.customerName || null;
            } else if (ctrId) {
              const ctr = systemContextData.contractors.find((c: any) => c.id === ctrId);
              workerName = ctr?.name || null;
              workerType = "contractor";
              customerName = ctr?.customerName || null;
            }

            // Resolve invoice number from systemContext
            const inv = systemContextData.invoices.find((i: any) => i.id === invId);
            const invoiceNumber = inv?.number || null;

            // If customerName not resolved from worker, try from invoice
            if (!customerName && inv) {
              const cust = systemContextData.customers.find((c: any) => c.id === inv.customerId);
              customerName = cust?.name || null;
            }

            return {
              invoiceId: invId,
              invoiceNumber,
              employeeId: empId,
              contractorId: ctrId,
              workerName,
              workerType,
              customerName,
              allocatedAmount: alloc.allocatedAmount,
              reason: alloc.reason || item.description || "",
            };
          });
      }

      // Ensure payment object has hasPaymentInfo flag for frontend compatibility
      if (parsed.payment && typeof parsed.payment === "object" && parsed.payment.hasPaymentInfo === undefined) {
        // Legacy format: payment was null when no info, or object when present
        parsed.payment.hasPaymentInfo = true;
      }
      if (!parsed.payment || parsed.payment === null) {
        parsed.payment = { hasPaymentInfo: false };
      }

      // Ensure lineItems have allocationSuggestion with hasAllocation flag
      if (parsed.lineItems) {
        parsed.lineItems = parsed.lineItems.map((item: any) => {
          if (!item.allocationSuggestion || item.allocationSuggestion === null) {
            item.allocationSuggestion = { hasAllocation: false, invoiceId: null, employeeId: null, contractorId: null, allocatedAmount: null, reason: null };
          } else if (item.allocationSuggestion.hasAllocation === undefined) {
            item.allocationSuggestion.hasAllocation = !!(item.allocationSuggestion.invoiceId || item.allocationSuggestion.employeeId || item.allocationSuggestion.contractorId);
          }
          return item;
        });
      }

      // Ensure crossValidation exists with defaults
      if (!parsed.crossValidation) {
        parsed.crossValidation = {
          invoiceVsPaymentMatch: null,
          invoiceVsPaymentDifference: null,
          lineItemsSumMatchesTotal: false,
          lineItemsSumDifference: 0,
          documentsAnalyzed: input.files.length,
          warnings: ["Cross-validation data was not provided by AI"],
          notes: [],
        };
      }

      // Step 4: Try to match or auto-create vendor
      parsed.vendorMatch = null;
      if (parsed.vendor?.name && !input.vendorId) {
        const vendorList = await listVendors({ search: parsed.vendor.name, pageSize: 5 });
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
        const vendorList = await listVendors({ pageSize: 1 });
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

      // Flatten matchedVendorId for frontend compatibility.
      // Frontend accesses p.matchedVendorId at the top level.
      if (parsed.vendorMatch?.vendor?.id) {
        parsed.matchedVendorId = parsed.vendorMatch.vendor.id;
      }

      return {
        parsed,
        files: input.files,
        serviceMonth: input.serviceMonth,
      };
    }),

  // Apply parsed multi-file result: create bill + items + optional allocations
  applyMultiFileParse: financeAndOpsProcedure
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
          "payroll_processing", "social_contributions", "visa_immigration",
          "consulting", "equipment", "insurance", "other",
        ]).default("other"),
        billType: z.enum(["operational", "pass_through", "vendor_service_fee", "non_recurring", "mixed"]).default("operational"),
        description: z.string().optional(),
        receiptFileUrl: z.string().optional(),
        receiptFileKey: z.string().optional(),
        // Payment info (from POP)
        paymentInfo: z.object({
          paidDate: z.string(),
          paidAmount: z.string(),
          bankReference: z.string().optional().default(""),
          bankName: z.string().optional().default(""),
          bankFee: z.string().default("0"),
        }).optional(),
        // Line items
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.string().default("1"),
            unitPrice: z.string(),
            amount: z.string(),
            itemType: z.enum(["employment_cost", "service_fee", "visa_fee", "equipment_purchase", "other"]).default("other"),
            relatedEmployeeId: z.number().optional(),
            relatedCustomerId: z.number().optional(),
            relatedCountryCode: z.string().optional(),
          })
        ).optional(),
        // Allocation suggestions to auto-create
        allocations: z.array(
          z.object({
            invoiceId: z.number(),
            employeeId: z.number().optional(),
            contractorId: z.number().optional(),
            allocatedAmount: z.string(),
            description: z.string().optional(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { items, allocations, paymentInfo, ...billData } = input;

      // Create the vendor bill — keep date fields as text strings (DB columns are text type)
      const billValues: any = {
        ...billData,
        billDate: billData.billDate,
        dueDate: billData.dueDate || undefined,
        billMonth: billData.billMonth ? `${billData.billMonth}-01` : undefined,
        submittedBy: ctx.user.id,
        submittedAt: new Date().toISOString(),
        status: paymentInfo ? "paid" : "pending_approval",
      };

      // If payment info provided, add it
      if (paymentInfo) {
        billValues.paidDate = paymentInfo.paidDate;
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
          if (itemId) itemIds.push(itemId);
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
              employeeId: alloc.employeeId || null,
              contractorId: alloc.contractorId || null,
              allocatedAmount: alloc.allocatedAmount,
              description: alloc.description || "Auto-allocated from AI parsing",
              allocatedBy: ctx.user.id,
            } as any);
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
          billNumber: `FEE-${paymentInfo.bankReference || billData.billNumber}`,
          billDate: paymentInfo.paidDate,
          currency: "USD",
          subtotal: paymentInfo.bankFee,
          tax: "0",
          totalAmount: paymentInfo.bankFee,
          paidAmount: paymentInfo.bankFee,
          status: "paid",
          paidDate: paymentInfo.paidDate,
          category: "other",
          description: `Bank wire fee for ${billData.billNumber} via ${paymentInfo.bankName || "bank"}`,
          bankReference: paymentInfo.bankReference,
          bankName: paymentInfo.bankName,
          submittedBy: ctx.user.id,
          submittedAt: new Date().toISOString(),
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
  uploadFile: financeAndOpsProcedure
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
  // Now uses Qwen-Long with fileid:// for document understanding
  parseVendorInvoice: financeAndOpsProcedure
    .input(
      z.object({
        fileUrl: z.string(),
        fileKey: z.string(),
        vendorId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Upload file to DashScope for Qwen-Long processing
      let fileId: string;
      try {
        fileId = await uploadFileForAI(input.fileUrl, input.fileKey, "vendor-invoice");
      } catch (e: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to upload file for AI processing: ${e?.message}`,
        });
      }

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
- category: string (one of: payroll_processing, social_contributions, visa_immigration, consulting, equipment, insurance, other). Use "payroll_processing" for payroll and tax filing. Use "social_contributions" for social security/pension. Use "consulting" for consulting, HR advisory, or legal services. Use "other" for IT, office rent, bank charges, travel, marketing, or anything else.
- billType: string (one of: "pass_through", "vendor_service_fee", "non_recurring", "operational", "mixed"). Use "pass_through" for payroll/salary/social contributions/tax paid on behalf of employees. Use "vendor_service_fee" for the vendor's own management/processing fee. Use "non_recurring" for one-off costs like visa, equipment. Use "operational" for internal business costs. Use "mixed" when a single bill contains BOTH pass-through employment costs AND vendor service fees in the same invoice.
- description: string
- lineItems: array of { description: string, employeeName: string | null, quantity: number, unitPrice: number, amount: number, countryCode: string | null }

Be precise with numbers. If a field is not found, use null.`,
          },
          {
            // 2nd system message: document content via fileid://
            role: "system",
            content: `fileid://${fileId}`,
          },
          {
            role: "user",
            content: "Parse this vendor invoice.",
          },
        ],
        // IMPORTANT: qwen-long-latest only supports json_object mode, NOT json_schema.
        response_format: {
          type: "json_object",
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse PDF" });
      }

      const parsed = JSON.parse(content);

      // Try to match vendor
      if (parsed.vendorName && !input.vendorId) {
        const vendorList = await listVendors({ search: parsed.vendorName, pageSize: 5 });
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
  applyVendorInvoice: financeAndOpsProcedure
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
          "payroll_processing", "social_contributions", "visa_immigration",
          "consulting", "equipment", "insurance", "other",
        ]).default("other"),
        billType: z.enum(["operational", "pass_through", "vendor_service_fee", "non_recurring", "mixed"]).default("operational"),
        description: z.string().optional(),
        receiptFileUrl: z.string().optional(),
        receiptFileKey: z.string().optional(),
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.string().default("1"),
            unitPrice: z.string(),
            amount: z.string(),
            itemType: z.enum(["employment_cost", "service_fee", "visa_fee", "equipment_purchase", "other"]).default("other"),
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
        submittedAt: new Date().toISOString(),
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
