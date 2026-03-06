import { getDb } from "../db";
import { quotations, customers, salesLeads, billingEntities } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { calculationService } from "./calculationService";
import { storagePut } from "../storage";
import { createBrandedPdfDocument, drawCoverPage, drawHeader, drawFooter, smartText } from "./pdfBrandTemplateService";
import { mergePdfs } from "./contentMergeService";
import { countryGuidePdfService } from "./countryGuidePdfService";

interface QuotationItemInput {
  countryCode: string;
  regionCode?: string; // Added regionCode
  headcount: number;
  salary: number;
  currency: string;
  serviceType: "eor" | "visa_eor";
  serviceFee: number;
  oneTimeFee?: number;
}

interface CreateQuotationInput {
  leadId?: number;
  customerId?: number;
  items: QuotationItemInput[];
  validUntil?: string;
  createdBy: number;
  notes?: string;
  includeCountryGuide?: boolean; // New Flag
}

export const quotationService = {
  createQuotation: async (input: CreateQuotationInput) => {
    const db = getDb();
    if (!db) throw new Error("Database connection failed");

    // 1. Calculate costs for each item
    const calculatedItems = [];
    let totalMonthly = 0;
    const currency = input.items[0]?.currency || "USD"; // Assume single currency for now

    // TODO: Dynamic year selection based on validity. For now using 2025 as our seed data is 2025.
    // In production, this should fallback to the latest available rules if current year is not found.
    const year = 2025; 

    for (const item of input.items) {
      const calcResult = await calculationService.calculateSocialInsurance({
        countryCode: item.countryCode,
        year,
        salary: item.salary,
        regionCode: item.regionCode, // Pass regionCode
      });

      const employerCost = parseFloat(calcResult.totalEmployer);
      const totalEmploymentCost = item.salary + employerCost;
      const subtotal = (totalEmploymentCost + item.serviceFee) * item.headcount;

      calculatedItems.push({
        ...item,
        employerCost,
        totalEmploymentCost,
        subtotal,
        calcDetails: calcResult.items
      });

      totalMonthly += subtotal;
    }

    // 2. Generate Quotation Number
    // Format: Q-{YYYY}{MM}{DD}-{Random4}
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quotationNumber = `Q-${dateStr}-${randomSuffix}`;

    // 3. Create Record
    const [result] = await db.insert(quotations).values({
      quotationNumber,
      leadId: input.leadId,
      customerId: input.customerId,
      countries: JSON.stringify(calculatedItems),
      totalMonthly: totalMonthly.toFixed(2),
      currency,
      snapshotData: calculatedItems, // Full breakdown
      validUntil: input.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // Default 15 days
      status: "draft",
      createdBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning({ id: quotations.id });

    // 4. Generate PDF
    await quotationService.generatePdf(result.id, input.includeCountryGuide);

    return result;
  },

  generatePdf: async (quotationId: number, includeCountryGuide = false) => {
    const db = getDb();
    if (!db) throw new Error("Database connection failed");

    const quotation = await db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId)
    });
    if (!quotation) throw new Error("Quotation not found");

    let customerName = "Valued Customer";
    let customerAddress = "";
    
    if (quotation.customerId) {
      const customer = await db.query.customers.findFirst({
        where: eq(customers.id, quotation.customerId)
      });
      if (customer) {
        customerName = customer.companyName;
        customerAddress = [customer.address, customer.city, customer.country].filter(Boolean).join(", ");
      }
    } else if (quotation.leadId) {
      const lead = await db.query.salesLeads.findFirst({
        where: eq(salesLeads.id, quotation.leadId)
      });
      if (lead) {
        customerName = lead.companyName;
        customerAddress = lead.country || "";
      }
    }

    // Drizzle already parses JSON columns, so we don't need to parse it again if it's an object/array
    const items = Array.isArray(quotation.snapshotData) 
      ? quotation.snapshotData 
      : typeof quotation.snapshotData === 'string' 
        ? JSON.parse(quotation.snapshotData) 
        : [];
    
    // Step 1: Generate the Quotation PDF (Table)
    const { doc, cjkFontPath } = await createBrandedPdfDocument();

    const quotationBuffer = await new Promise<Buffer>((resolve, reject) => {
      const buffers: Buffer[] = [];
      doc.on("data", chunk => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // 1. Cover Page
      drawCoverPage(
        doc, 
        "Quotation Proposal", 
        `Ref: ${quotation.quotationNumber}`, 
        new Date().toLocaleDateString(), 
        cjkFontPath
      );

      // drawCoverPage calls addPage() at the end, so we are on Page 2 (Content)

      // 2. Header
      drawHeader(doc, `Quotation #${quotation.quotationNumber}`);

      // 3. Customer Info
      doc.moveDown();
      doc.fontSize(12).font("Helvetica-Bold").text("Prepared For:");
      doc.fontSize(10).font("Helvetica").text(customerName);
      if (customerAddress) doc.text(customerAddress);
      
      doc.moveDown(2);

      // 4. Table Header
      const tableTop = doc.y;
      const cols = {
        country: { x: 50, w: 80 },
        role: { x: 130, w: 100 },
        count: { x: 230, w: 40 },
        salary: { x: 270, w: 70 },
        employer: { x: 340, w: 70 },
        fee: { x: 410, w: 60 },
        subtotal: { x: 470, w: 70 }
      };

      doc.fontSize(8).font("Helvetica-Bold");
      doc.text("COUNTRY", cols.country.x, tableTop);
      doc.text("SERVICE", cols.role.x, tableTop);
      doc.text("QTY", cols.count.x, tableTop);
      doc.text("SALARY", cols.salary.x, tableTop, { align: "right" });
      doc.text("ER COST", cols.employer.x, tableTop, { align: "right" });
      doc.text("FEE", cols.fee.x, tableTop, { align: "right" });
      doc.text("SUBTOTAL", cols.subtotal.x, tableTop, { align: "right" });

      doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();

      let y = tableTop + 25;

      // 5. Table Rows
      for (const item of items) {
        if (y > 700) { // Leave space for footer
          drawFooter(doc, 1); // Draw footer for current page
          doc.addPage();
          drawHeader(doc, `Quotation #${quotation.quotationNumber}`);
          y = 50;
        }

        doc.fontSize(8).fillColor("black");
        smartText(doc, item.countryCode, cols.country.x, y, { width: cols.country.w }, cjkFontPath);
        smartText(doc, (item.serviceType || "").toUpperCase(), cols.role.x, y, { width: cols.role.w }, cjkFontPath);
        doc.text((item.headcount || 0).toString(), cols.count.x, y);
        doc.text(formatMoney(item.salary), cols.salary.x, y, { align: "right", width: cols.salary.w });
        doc.text(formatMoney(item.employerCost), cols.employer.x, y, { align: "right", width: cols.employer.w });
         doc.text(formatMoney(item.serviceFee), cols.fee.x, y, { align: "right", width: cols.fee.w });
         
         if (item.oneTimeFee) {
           doc.fontSize(6).text(`+ ${formatMoney(item.oneTimeFee)} (one-time)`, cols.fee.x, y + 10, { align: "right", width: cols.fee.w });
         }

         doc.font("Helvetica-Bold").text(formatMoney(item.subtotal), cols.subtotal.x, y, { align: "right", width: cols.subtotal.w });
         
         y += item.oneTimeFee ? 25 : 15;
      }

      doc.moveTo(50, y).lineTo(540, y).stroke();
      y += 10;

      // 6. Total
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text(`TOTAL MONTHLY (${quotation.currency})`, 300, y, { align: "right", width: 160 });
      doc.text(formatMoney(parseFloat(quotation.totalMonthly)), 470, y, { align: "right", width: 70 });

      // 7. Footer for last page
      drawFooter(doc, 1); // Todo: handle page numbers dynamically

      doc.end();
    });

    // Step 2: Fetch Additional PDFs (Country Guides)
    const pdfsToMerge: Buffer[] = [quotationBuffer];
    
    if (includeCountryGuide) {
        const countries = Array.from(new Set(items.map((i: any) => i.countryCode)));
        for (const code of countries) {
          const guideBuffer = await countryGuidePdfService.generatePdf(code as string);
          if (guideBuffer) pdfsToMerge.push(guideBuffer);
        }
    }

    // Step 3: Merge
    const finalPdfBuffer = await mergePdfs(pdfsToMerge, { 
      addPageNumbers: true,
      metadata: {
        title: `Quotation ${quotation.quotationNumber}`,
        subject: `Proposal for ${customerName}`
      }
    });

    // Step 4: Upload to S3
    const fileName = `Quotation-${quotation.quotationNumber}.pdf`;
    const { key, url } = await storagePut(`quotations/${fileName}`, finalPdfBuffer, "application/pdf");

    // Update DB
    await db.update(quotations)
      .set({ pdfKey: key, pdfUrl: url })
      .where(eq(quotations.id, quotationId));
    
    return { key, url };
  }
};

function formatMoney(amount: number) {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
