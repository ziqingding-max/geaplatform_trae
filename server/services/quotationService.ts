import { getDb } from "../db";
import { quotations, customers, salesLeads, billingEntities, users, salesDocuments } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { calculationService } from "./calculationService";
import { getExchangeRate } from "./exchangeRateService";
import { storagePut, storageGet, storageDelete } from "../storage";
import { generateQuotationPdf, generateQuotationPdfV2, BrandingInfo } from "./htmlPdfService";
import { countryGuidePdfService } from "./countryGuidePdfService";
import { mergePdfs } from "./contentMergeService";

// ── V1 Interfaces ──
interface QuotationItemInput {
  countryCode: string;
  regionCode?: string;
  headcount: number;
  salary: number;
  currency: string;
  serviceType: "eor" | "visa_eor" | "aor";
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
  includeCountryGuide?: boolean;
}

interface UpdateQuotationInput extends CreateQuotationInput {
  id: number;
  updatedBy: number;
}

// ── V2 Interfaces ──
interface V2ServiceFeeInput {
  countries: string[];
  serviceType: "eor" | "visa_eor" | "aor";
  serviceFee: number;
  oneTimeFee?: number;
}

interface V2CostEstimationInput {
  countryCode: string;
  regionCode?: string;
  salary: number;
  currency: string;
  headcount: number;
}

interface V2CountryGuideInput {
  countryCode: string;
}

interface CreateQuotationV2Input {
  leadId?: number;
  customerId?: number;
  serviceFees: V2ServiceFeeInput[];
  costEstimations: V2CostEstimationInput[];
  countryGuides: V2CountryGuideInput[];
  validUntil?: string;
  notes?: string;
  createdBy: number;
}

interface UpdateQuotationV2Input extends CreateQuotationV2Input {
  id: number;
  updatedBy: number;
}

// ── V2 Calculated Result Types ──
interface V2CalculatedServiceFee {
  countries: string[];
  serviceType: string;
  serviceFee: number;
  oneTimeFee?: number;
}

interface V2CalculatedCostEstimation {
  countryCode: string;
  regionCode?: string;
  salary: number;
  currency: string;
  headcount: number;
  employerCost: number;
  totalEmploymentCost: number;
  exchangeRate: number;
  usdEmploymentCost: number;
  monthlyCostPerPerson: number;
  monthlyTotal: number;
  calcDetails: any[];
}

// ── Shared Helper: Fetch billing entity & branding ──
async function fetchBrandingInfo(db: any): Promise<{ billingEntity: any; branding: BrandingInfo; }> {
  let billingEntity: any = undefined;
  let branding: BrandingInfo = {
    shortName: "GEA",
    fullName: "Global Employment Advisors",
    contactEmail: "support@bestgea.com",
  };

  let defaultBilling = await db.query.billingEntities.findFirst({
    where: eq(billingEntities.isDefault, true)
  });
  if (!defaultBilling) {
    defaultBilling = await db.query.billingEntities.findFirst({
      where: eq(billingEntities.isActive, true)
    }) ?? undefined;
  }
  if (defaultBilling) {
    const addressParts = [defaultBilling.address, defaultBilling.city, defaultBilling.country].filter(Boolean);
    const address = addressParts.join(", ") || undefined;
    billingEntity = {
      entityName: defaultBilling.entityName,
      legalName: defaultBilling.legalName,
      address,
      contactEmail: defaultBilling.contactEmail ?? undefined,
      contactPhone: defaultBilling.contactPhone ?? undefined,
      country: defaultBilling.country,
    };
    let resolvedLogoUrl = defaultBilling.logoUrl ?? null;
    if (defaultBilling.logoFileKey) {
      try {
        const { url: signedUrl } = await storageGet(defaultBilling.logoFileKey);
        resolvedLogoUrl = signedUrl;
      } catch (err) {
        console.warn("[QuotationService] Failed to sign logo URL:", err);
      }
    }
    branding = {
      shortName: defaultBilling.entityName,
      fullName: defaultBilling.legalName,
      logoUrl: resolvedLogoUrl,
      contactEmail: defaultBilling.contactEmail ?? null,
      address: address ?? null,
      legalName: defaultBilling.legalName,
    };
  }
  return { billingEntity, branding };
}

async function fetchCustomerInfo(db: any, quotation: any): Promise<{ customerName: string; customerAddress: string }> {
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
  return { customerName, customerAddress };
}

async function fetchCreatorInfo(db: any, createdBy: number | null): Promise<{ createdByName?: string; createdByEmail?: string }> {
  if (!createdBy) return {};
  const creator = await db.query.users.findFirst({
    where: eq(users.id, createdBy)
  });
  if (creator) {
    return {
      createdByName: creator.name ?? undefined,
      createdByEmail: creator.email ?? undefined,
    };
  }
  return {};
}

// ── V2 Calculation Helper ──
async function calculateCostEstimations(costEstimations: V2CostEstimationInput[]): Promise<V2CalculatedCostEstimation[]> {
  const year = 2025; // TODO: dynamic year
  const results: V2CalculatedCostEstimation[] = [];

  for (const est of costEstimations) {
    const calcResult = await calculationService.calculateSocialInsurance({
      countryCode: est.countryCode,
      year,
      salary: est.salary,
      regionCode: est.regionCode,
    });

    const employerCost = parseFloat(calcResult.totalEmployer);
    const totalEmploymentCost = est.salary + employerCost;

    let exchangeRate = 1;
    let usdEmploymentCost = totalEmploymentCost;

    if (est.currency !== "USD") {
      const rateData = await getExchangeRate("USD", est.currency);
      if (rateData) {
        exchangeRate = rateData.rate;
        usdEmploymentCost = totalEmploymentCost / exchangeRate;
      }
    }

    const monthlyCostPerPerson = usdEmploymentCost;
    const monthlyTotal = monthlyCostPerPerson * est.headcount;

    results.push({
      countryCode: est.countryCode,
      regionCode: est.regionCode,
      salary: est.salary,
      currency: est.currency,
      headcount: est.headcount,
      employerCost,
      totalEmploymentCost,
      exchangeRate,
      usdEmploymentCost,
      monthlyCostPerPerson,
      monthlyTotal,
      calcDetails: calcResult.items,
    });
  }

  return results;
}

function calculateV2TotalMonthly(
  serviceFees: V2ServiceFeeInput[],
  calculatedCosts: V2CalculatedCostEstimation[]
): number {
  // Total = sum of all service fees + sum of all employment costs (salary + employer contributions)
  let total = 0;

  for (const sf of serviceFees) {
    total += sf.serviceFee;
  }

  for (const ce of calculatedCosts) {
    total += ce.monthlyTotal;
  }

  return total;
}

export const quotationService = {
  // ── V1 Methods (backward compatible) ──
  createQuotation: async (input: CreateQuotationInput) => {
    const db = getDb();
    if (!db) throw new Error("Database connection failed");

    const calculatedItems = [];
    let totalMonthly = 0;
    const quotationCurrency = "USD";
    const year = 2025;

    for (const item of input.items) {
      if (item.serviceType === "aor") {
        const employerCost = 0;
        const totalEmploymentCostLocal = item.salary;
        let exchangeRate = 1;
        let usdEmploymentCost = totalEmploymentCostLocal;

        if (item.currency !== "USD") {
          const rateData = await getExchangeRate("USD", item.currency);
          if (rateData) {
            exchangeRate = rateData.rate;
            usdEmploymentCost = totalEmploymentCostLocal / exchangeRate;
          }
        }

        const subtotal = (usdEmploymentCost + item.serviceFee) * item.headcount;
        calculatedItems.push({
          ...item,
          employerCost,
          totalEmploymentCost: totalEmploymentCostLocal,
          exchangeRate,
          usdEmploymentCost,
          subtotal,
          calcDetails: []
        });
        totalMonthly += subtotal;
        continue;
      }

      const calcResult = await calculationService.calculateSocialInsurance({
        countryCode: item.countryCode,
        year,
        salary: item.salary,
        regionCode: item.regionCode,
      });

      const employerCost = parseFloat(calcResult.totalEmployer);
      const totalEmploymentCostLocal = item.salary + employerCost;
      let exchangeRate = 1;
      let usdEmploymentCost = totalEmploymentCostLocal;

      if (item.currency !== "USD") {
        const rateData = await getExchangeRate("USD", item.currency);
        if (rateData) {
          exchangeRate = rateData.rate;
          usdEmploymentCost = totalEmploymentCostLocal / exchangeRate;
        }
      }

      const subtotal = (usdEmploymentCost + item.serviceFee) * item.headcount;
      calculatedItems.push({
        ...item,
        employerCost,
        totalEmploymentCost: totalEmploymentCostLocal,
        exchangeRate,
        usdEmploymentCost,
        subtotal,
        calcDetails: calcResult.items
      });
      totalMonthly += subtotal;
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quotationNumber = `Q-${dateStr}-${randomSuffix}`;

    const [result] = await db.insert(quotations).values({
      quotationNumber,
      leadId: input.leadId,
      customerId: input.customerId,
      countries: JSON.stringify(calculatedItems),
      totalMonthly: totalMonthly.toFixed(2),
      currency: quotationCurrency,
      snapshotData: calculatedItems,
      validUntil: input.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: "draft",
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning({ id: quotations.id });

    try {
      await quotationService.generatePdf(result.id, input.includeCountryGuide);
    } catch (pdfErr) {
      console.error(`[Quotation] PDF generation failed for quotation #${result.id}, will retry on download:`, pdfErr);
    }

    return result;
  },

  updateQuotation: async (input: UpdateQuotationInput) => {
    const db = getDb();
    if (!db) throw new Error("Database connection failed");

    const existing = await db.query.quotations.findFirst({
      where: eq(quotations.id, input.id)
    });
    if (!existing) throw new Error("Quotation not found");
    if (existing.status !== "draft") throw new Error("Only draft quotations can be edited");

    const calculatedItems = [];
    let totalMonthly = 0;
    const quotationCurrency = "USD";
    const year = 2025;

    for (const item of input.items) {
      if (item.serviceType === "aor") {
        const employerCost = 0;
        const totalEmploymentCostLocal = item.salary;
        let exchangeRate = 1;
        let usdEmploymentCost = totalEmploymentCostLocal;

        if (item.currency !== "USD") {
          const rateData = await getExchangeRate("USD", item.currency);
          if (rateData) {
            exchangeRate = rateData.rate;
            usdEmploymentCost = totalEmploymentCostLocal / exchangeRate;
          }
        }

        const subtotal = (usdEmploymentCost + item.serviceFee) * item.headcount;
        calculatedItems.push({
          ...item,
          employerCost,
          totalEmploymentCost: totalEmploymentCostLocal,
          exchangeRate,
          usdEmploymentCost,
          subtotal,
          calcDetails: []
        });
        totalMonthly += subtotal;
        continue;
      }

      const calcResult = await calculationService.calculateSocialInsurance({
        countryCode: item.countryCode,
        year,
        salary: item.salary,
        regionCode: item.regionCode,
      });

      const employerCost = parseFloat(calcResult.totalEmployer);
      const totalEmploymentCostLocal = item.salary + employerCost;
      let exchangeRate = 1;
      let usdEmploymentCost = totalEmploymentCostLocal;

      if (item.currency !== "USD") {
        const rateData = await getExchangeRate("USD", item.currency);
        if (rateData) {
          exchangeRate = rateData.rate;
          usdEmploymentCost = totalEmploymentCostLocal / exchangeRate;
        }
      }

      const subtotal = (usdEmploymentCost + item.serviceFee) * item.headcount;
      calculatedItems.push({
        ...item,
        employerCost,
        totalEmploymentCost: totalEmploymentCostLocal,
        exchangeRate,
        usdEmploymentCost,
        subtotal,
        calcDetails: calcResult.items
      });
      totalMonthly += subtotal;
    }

    await db.update(quotations).set({
      leadId: input.leadId,
      customerId: input.customerId,
      countries: JSON.stringify(calculatedItems),
      totalMonthly: totalMonthly.toFixed(2),
      currency: quotationCurrency,
      snapshotData: calculatedItems,
      validUntil: input.validUntil,
      updatedAt: new Date().toISOString()
    }).where(eq(quotations.id, input.id));

    try {
      await quotationService.generatePdf(input.id, input.includeCountryGuide);
    } catch (pdfErr) {
      console.error(`[Quotation] PDF regeneration failed for quotation #${input.id}, will retry on download:`, pdfErr);
    }

    return { id: input.id };
  },

  // ── V2 Methods (three-part quotation) ──
  createQuotationV2: async (input: CreateQuotationV2Input) => {
    const db = getDb();
    if (!db) throw new Error("Database connection failed");

    // 1. Calculate employer costs for each cost estimation
    const calculatedCosts = await calculateCostEstimations(input.costEstimations);

    // 2. Calculate total monthly
    const totalMonthly = calculateV2TotalMonthly(input.serviceFees, calculatedCosts);
    const quotationCurrency = "USD";

    // 3. Generate quotation number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quotationNumber = `Q-${dateStr}-${randomSuffix}`;

    // 4. Build V2 snapshot data
    const snapshotData = {
      version: 2,
      serviceFees: input.serviceFees.map(sf => ({
        countries: sf.countries,
        serviceType: sf.serviceType,
        serviceFee: sf.serviceFee,
        oneTimeFee: sf.oneTimeFee,
      })),
      costEstimations: calculatedCosts,
      countryGuides: input.countryGuides.map(cg => ({
        countryCode: cg.countryCode,
      })),
      notes: input.notes,
    };

    // 5. Build countries string (all unique countries from all three parts)
    const allCountries = new Set<string>();
    input.serviceFees.forEach(sf => sf.countries.forEach(c => allCountries.add(c)));
    input.costEstimations.forEach(ce => allCountries.add(ce.countryCode));
    input.countryGuides.forEach(cg => allCountries.add(cg.countryCode));

    // 6. Create record
    const [result] = await db.insert(quotations).values({
      quotationNumber,
      leadId: input.leadId,
      customerId: input.customerId,
      countries: JSON.stringify(Array.from(allCountries)),
      totalMonthly: totalMonthly.toFixed(2),
      currency: quotationCurrency,
      snapshotData,
      validUntil: input.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: "draft",
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning({ id: quotations.id });

    // 7. Generate PDF (non-blocking)
    try {
      await quotationService.generatePdf(result.id);
    } catch (pdfErr) {
      console.error(`[Quotation V2] PDF generation failed for quotation #${result.id}, will retry on download:`, pdfErr);
    }

    return result;
  },

  updateQuotationV2: async (input: UpdateQuotationV2Input) => {
    const db = getDb();
    if (!db) throw new Error("Database connection failed");

    const existing = await db.query.quotations.findFirst({
      where: eq(quotations.id, input.id)
    });
    if (!existing) throw new Error("Quotation not found");
    if (existing.status !== "draft") throw new Error("Only draft quotations can be edited");

    // 1. Calculate employer costs
    const calculatedCosts = await calculateCostEstimations(input.costEstimations);

    // 2. Calculate total monthly
    const totalMonthly = calculateV2TotalMonthly(input.serviceFees, calculatedCosts);
    const quotationCurrency = "USD";

    // 3. Build V2 snapshot data
    const snapshotData = {
      version: 2,
      serviceFees: input.serviceFees.map(sf => ({
        countries: sf.countries,
        serviceType: sf.serviceType,
        serviceFee: sf.serviceFee,
        oneTimeFee: sf.oneTimeFee,
      })),
      costEstimations: calculatedCosts,
      countryGuides: input.countryGuides.map(cg => ({
        countryCode: cg.countryCode,
      })),
      notes: input.notes,
    };

    // 4. Build countries string
    const allCountries = new Set<string>();
    input.serviceFees.forEach(sf => sf.countries.forEach(c => allCountries.add(c)));
    input.costEstimations.forEach(ce => allCountries.add(ce.countryCode));
    input.countryGuides.forEach(cg => allCountries.add(cg.countryCode));

    // 5. Update record
    await db.update(quotations).set({
      leadId: input.leadId,
      customerId: input.customerId,
      countries: JSON.stringify(Array.from(allCountries)),
      totalMonthly: totalMonthly.toFixed(2),
      currency: quotationCurrency,
      snapshotData,
      validUntil: input.validUntil,
      updatedAt: new Date().toISOString()
    }).where(eq(quotations.id, input.id));

    // 6. Regenerate PDF (non-blocking)
    try {
      await quotationService.generatePdf(input.id);
    } catch (pdfErr) {
      console.error(`[Quotation V2] PDF regeneration failed for quotation #${input.id}, will retry on download:`, pdfErr);
    }

    return { id: input.id };
  },

  // ── Shared Methods ──
  deleteQuotation: async (quotationId: number) => {
    const db = getDb();
    if (!db) throw new Error("Database connection failed");

    const quotation = await db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId),
    });
    if (!quotation) throw new Error("Quotation not found");

    // Unlink associated salesDocuments
    await db.update(salesDocuments)
      .set({ quotationId: null })
      .where(eq(salesDocuments.quotationId, quotationId));

    // Clean up PDF from storage
    if (quotation.pdfKey) {
      try {
        await storageDelete(quotation.pdfKey);
      } catch (err) {
        console.warn(`[Quotation] Failed to delete PDF from storage for quotation #${quotationId}:`, err);
      }
    }

    // Hard delete
    await db.delete(quotations).where(eq(quotations.id, quotationId));
    return { success: true };
  },

  generatePdf: async (quotationId: number, includeCountryGuide = false) => {
    const db = getDb();
    if (!db) throw new Error("Database connection failed");

    const quotation = await db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId)
    });
    if (!quotation) throw new Error("Quotation not found");

    const { customerName, customerAddress } = await fetchCustomerInfo(db, quotation);
    const { billingEntity, branding } = await fetchBrandingInfo(db);
    const { createdByName, createdByEmail } = await fetchCreatorInfo(db, quotation.createdBy);

    // Detect V2 vs V1 snapshot
    const snapshot = typeof quotation.snapshotData === 'string'
      ? JSON.parse(quotation.snapshotData)
      : quotation.snapshotData;

    const isV2 = snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot) && snapshot.version === 2;

    let quotationBuffer: Buffer;
    let countryCodesForGuides: string[] = [];

    if (isV2) {
      // V2: Three-part PDF
      quotationBuffer = await generateQuotationPdfV2({
        quotationNumber: quotation.quotationNumber,
        customerName,
        customerAddress,
        serviceFees: snapshot.serviceFees || [],
        costEstimations: snapshot.costEstimations || [],
        totalMonthly: quotation.totalMonthly,
        currency: quotation.currency,
        validUntil: quotation.validUntil ?? undefined,
        notes: snapshot.notes,
        billingEntity,
        branding,
        createdByName,
        createdByEmail,
      });

      // Country guides from V2 snapshot
      countryCodesForGuides = (snapshot.countryGuides || []).map((cg: any) => cg.countryCode);
    } else {
      // V1: Legacy format
      const items = Array.isArray(snapshot) ? snapshot : [];
      quotationBuffer = await generateQuotationPdf({
        quotationNumber: quotation.quotationNumber,
        customerName,
        customerAddress,
        items: items as any[],
        totalMonthly: quotation.totalMonthly,
        currency: quotation.currency,
        validUntil: quotation.validUntil ?? undefined,
        billingEntity,
        branding,
        createdByName,
        createdByEmail,
      });

      // V1: country guides from includeCountryGuide flag
      if (includeCountryGuide) {
        countryCodesForGuides = Array.from(new Set(items.map((i: any) => i.countryCode)));
      }
    }

    // Merge with country guide PDFs
    const pdfsToMerge: Buffer[] = [quotationBuffer];

    if (countryCodesForGuides.length > 0) {
      for (const code of countryCodesForGuides) {
        try {
          const guideBuffer = await countryGuidePdfService.generatePdf(code);
          if (guideBuffer) pdfsToMerge.push(guideBuffer);
        } catch (err) {
          console.warn(`[Quotation] Failed to generate country guide for ${code}:`, err);
        }
      }
    }

    const finalPdfBuffer = await mergePdfs(pdfsToMerge, {
      addPageNumbers: false,
      metadata: {
        title: `Quotation ${quotation.quotationNumber}`,
        subject: `Proposal for ${customerName}`
      }
    });

    // Upload to S3
    const fileName = `Quotation-${quotation.quotationNumber}.pdf`;
    const { key, url } = await storagePut(`quotations/${fileName}`, finalPdfBuffer, "application/pdf");

    // Update DB
    await db.update(quotations)
      .set({ pdfKey: key, pdfUrl: url })
      .where(eq(quotations.id, quotationId));

    return { key, url, buffer: finalPdfBuffer };
  }
};

function formatMoney(amount: number) {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
