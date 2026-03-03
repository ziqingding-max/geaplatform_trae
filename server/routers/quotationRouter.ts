import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { quotationService } from "../services/quotationService";
import { storageGet } from "../storage";
import { getDb } from "../db";
import { quotations } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const quotationRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        leadId: z.number().optional(),
        customerId: z.number().optional(),
        includeCountryGuide: z.boolean().optional(),
        items: z.array(
          z.object({
            countryCode: z.string(),
            regionCode: z.string().optional(),
            headcount: z.number().min(1),
            salary: z.number(),
            currency: z.string().default("USD"),
            serviceType: z.enum(["eor", "visa_eor", "aor"]),
            serviceFee: z.number(),
          })
        ),
        validUntil: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await quotationService.createQuotation({
        ...input,
        createdBy: ctx.user.id,
      });
    }),

  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new Error("Database connection failed");

      const items = await db.query.quotations.findMany({
        orderBy: (quotations, { desc }) => [desc(quotations.createdAt)],
        limit: input.limit,
        offset: input.offset,
        with: {
          customer: true,
          salesLead: true
        }
      });

      // Simple count for now, optimizing later if needed
      const allItems = await db.select().from(quotations);
      const total = allItems.length;

      return { items, total };
    }),

  get: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new Error("Database connection failed");

      const quotation = await db.query.quotations.findFirst({
        where: eq(quotations.id, input),
      });
      return quotation;
    }),

  downloadPdf: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = getDb();
      if (!db) throw new Error("Database connection failed");

      const quotation = await db.query.quotations.findFirst({
        where: eq(quotations.id, input),
      });

      if (!quotation) throw new Error("Quotation not found");

      if (!quotation.pdfKey) {
        // Try to regenerate
        try {
           await quotationService.generatePdf(quotation.id);
           const updated = await db.query.quotations.findFirst({ where: eq(quotations.id, input) });
           if (updated?.pdfKey) {
             const { url } = await storageGet(updated.pdfKey);
             return { url };
           }
        } catch (err) {
            console.error("Failed to regenerate PDF:", err);
            throw new Error("PDF generation failed");
        }
      }

      if (quotation.pdfKey) {
        const { url } = await storageGet(quotation.pdfKey);
        return { url };
      }
      
      throw new Error("PDF not available");
    }),
});
