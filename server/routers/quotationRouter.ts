import { router } from "../_core/trpc";
import { crmProcedure, adminProcedure, userProcedure } from "../procedures";
import { z } from "zod";
import { quotationService } from "../services/quotationService";
import { storageGet, storageDownload } from "../storage";
import { getDb } from "../db";
import { quotations } from "../../drizzle/schema";
import { eq, desc, and, or, ne } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ── V1 Item Schema (backward compatible) ──
const v1ItemSchema = z.object({
  countryCode: z.string(),
  regionCode: z.string().optional(),
  headcount: z.number().min(1),
  salary: z.number(),
  currency: z.string().default("USD"),
  serviceType: z.enum(["eor", "visa_eor", "aor"]),
  serviceFee: z.number(),
  oneTimeFee: z.number().optional(),
});

// ── V2 Schemas (three-part quotation) ──
const v2ServiceFeeSchema = z.object({
  countries: z.array(z.string()).min(1),
  serviceType: z.enum(["eor", "visa_eor", "aor"]),
  serviceFee: z.number(),
  oneTimeFee: z.number().optional(),
});

const v2CostEstimationSchema = z.object({
  countryCode: z.string(),
  regionCode: z.string().optional(),
  salary: z.number(),
  currency: z.string().default("USD"),
  headcount: z.number().min(1).default(1), // headcount for cost estimation is per country
});

const v2CountryGuideSchema = z.object({
  countryCode: z.string(),
});

export const quotationRouter = router({
  create: crmProcedure
    .input(
      z.object({
        leadId: z.number().optional(),
        customerId: z.number().optional(),
        includeCountryGuide: z.boolean().optional(),
        // V1 format (backward compatible)
        items: z.array(v1ItemSchema).optional(),
        // V2 format (three-part quotation)
        version: z.literal(2).optional(),
        serviceFees: z.array(v2ServiceFeeSchema).optional(),
        costEstimations: z.array(v2CostEstimationSchema).optional(),
        countryGuides: z.array(v2CountryGuideSchema).optional(),
        validUntil: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.version === 2) {
        // V2 three-part quotation
        return await quotationService.createQuotationV2({
          leadId: input.leadId,
          customerId: input.customerId,
          serviceFees: input.serviceFees || [],
          costEstimations: input.costEstimations || [],
          countryGuides: input.countryGuides || [],
          validUntil: input.validUntil,
          notes: input.notes,
          createdBy: ctx.user.id,
        });
      } else {
        // V1 backward compatible
        return await quotationService.createQuotation({
          leadId: input.leadId,
          customerId: input.customerId,
          items: input.items || [],
          includeCountryGuide: input.includeCountryGuide,
          validUntil: input.validUntil,
          notes: input.notes,
          createdBy: ctx.user.id,
        });
      }
    }),

  update: crmProcedure
    .input(
      z.object({
        id: z.number(),
        leadId: z.number().optional(),
        customerId: z.number().optional(),
        includeCountryGuide: z.boolean().optional(),
        // V1 format
        items: z.array(v1ItemSchema).optional(),
        // V2 format
        version: z.literal(2).optional(),
        serviceFees: z.array(v2ServiceFeeSchema).optional(),
        costEstimations: z.array(v2CostEstimationSchema).optional(),
        countryGuides: z.array(v2CountryGuideSchema).optional(),
        validUntil: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // B7: Backend draft status validation (defense-in-depth)
      const db = getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      const existing = await db.query.quotations.findFirst({
        where: eq(quotations.id, input.id),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });
      if (existing.status !== "draft") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only draft quotations can be edited.",
        });
      }

      if (input.version === 2) {
        return await quotationService.updateQuotationV2({
          id: input.id,
          leadId: input.leadId,
          customerId: input.customerId,
          serviceFees: input.serviceFees || [],
          costEstimations: input.costEstimations || [],
          countryGuides: input.countryGuides || [],
          validUntil: input.validUntil,
          notes: input.notes,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        });
      } else {
        return await quotationService.updateQuotation({
          id: input.id,
          leadId: input.leadId,
          customerId: input.customerId,
          items: input.items || [],
          includeCountryGuide: input.includeCountryGuide,
          validUntil: input.validUntil,
          notes: input.notes,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        });
      }
    }),

  list: userProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        search: z.string().optional(),
        customerId: z.number().optional(),
        leadId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const items = await db.query.quotations.findMany({
        where: (quotations, { eq, and, like }) => {
            const conditions = [];
            if (input.customerId) conditions.push(eq(quotations.customerId, input.customerId));
            if (input.leadId) conditions.push(eq(quotations.leadId, input.leadId));
            if (input.search) {
                conditions.push(like(quotations.quotationNumber, `%${input.search}%`));
            }
            return and(...conditions);
        },
        orderBy: (quotations, { desc }) => [desc(quotations.createdAt)],
        limit: input.limit,
        offset: input.offset,
        with: {
          customer: true,
          salesLead: true
        }
      });

      return { items, total: items.length };
    }),

  get: userProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const quotation = await db.query.quotations.findFirst({
        where: eq(quotations.id, input.id),
        with: {
          customer: true,
          salesLead: true
        }
      });

      if (!quotation) throw new TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });
      return quotation;
    }),

  // B4: Update status with accepted mutual exclusion + B5: manual expired + B6: sentAt maintenance
  updateStatus: crmProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const current = await db.query.quotations.findFirst({
        where: eq(quotations.id, input.id),
      });
      if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });

      // Validate status transitions
      const allowedTransitions: Record<string, string[]> = {
        draft: ["sent", "accepted", "rejected", "expired"],
        sent: ["accepted", "rejected", "expired"],
        accepted: [],   // Terminal state
        rejected: [],   // Terminal state
        expired: [],    // Terminal state
      };

      const allowed = allowedTransitions[current.status] || [];
      if (!allowed.includes(input.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot transition from "${current.status}" to "${input.status}".`,
        });
      }

      // B6: Maintain sentAt/sentBy when transitioning to "sent"
      const updateData: Record<string, any> = {
        status: input.status,
        updatedAt: new Date(),
      };
      if (input.status === "sent") {
        updateData.sentAt = new Date();
        updateData.sentBy = ctx.user.id;
      }

      await db.update(quotations)
        .set(updateData)
        .where(eq(quotations.id, input.id));

      // B4: When accepting a quotation, auto-expire all other non-terminal quotations for the same lead
      if (input.status === "accepted" && current.leadId) {
        await db.update(quotations)
          .set({ status: "expired", updatedAt: new Date() })
          .where(
            and(
              eq(quotations.leadId, current.leadId),
              ne(quotations.id, input.id),
              or(
                eq(quotations.status, "draft"),
                eq(quotations.status, "sent")
              )
            )
          );
      }

      return { success: true };
    }),

  // B3c: Delete with permission check — draft: any CRM user; non-draft: admin only
  delete: crmProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const quotation = await db.query.quotations.findFirst({
        where: eq(quotations.id, input.id),
      });
      if (!quotation) throw new TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });

      // Non-draft quotations can only be deleted by admin
      if (quotation.status !== "draft") {
        const userRoles = (ctx.user.role || "").split(",").map((r: string) => r.trim().toLowerCase());
        if (!userRoles.includes("admin")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only administrators can delete non-draft quotations.",
          });
        }
      }

      return await quotationService.deleteQuotation(input.id);
    }),

  downloadPdf: userProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const quotation = await db.query.quotations.findFirst({
        where: eq(quotations.id, input.id),
      });
      if (!quotation) throw new TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });

      // If PDF exists, return signed URL
      if (quotation.pdfKey) {
        try {
          const { url } = await storageGet(quotation.pdfKey);
          return { url };
        } catch {
          // PDF key exists but file not found in storage, regenerate
        }
      }

      // Regenerate PDF
      const includeGuide = !!(quotation.snapshotData as any)?.countryGuides?.length;
      const result = await quotationService.generatePdf(quotation.id, includeGuide);
      return { url: result.url };
    }),
});
