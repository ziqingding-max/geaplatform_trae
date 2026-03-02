import { z } from "zod";
import { router } from "../_core/trpc";
import { customerManagerProcedure, userProcedure } from "../procedures";
import {
  createSalesLead,
  getSalesLeadById,
  listSalesLeads,
  updateSalesLead,
  deleteSalesLead,
  createSalesActivity,
  listSalesActivities,
  deleteSalesActivity,
  createCustomer,
  createCustomerContact,
  logAuditAction,
  listUsers,
  listEmployees,
} from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Pipeline stages (in order):
 *   discovery       – Only contact info, no clear demand yet
 *   leads           – Clear demand identified (intended services + target countries)
 *   quotation_sent  – Quotation has been sent to the prospect
 *   msa_sent        – MSA (Master Service Agreement) sent to the prospect
 *   msa_signed      – MSA signed by both parties → customer is created in Customers module
 *   closed_won      – First employee status becomes "onboarding" → deal is won
 *   closed_lost     – Deal lost at any stage
 */

const PIPELINE_STATUSES = [
  "discovery",
  "leads",
  "quotation_sent",
  "msa_sent",
  "msa_signed",
  "closed_won",
  "closed_lost",
] as const;

// Statuses that are still "active" in the pipeline (not terminal)
const ACTIVE_STATUSES = ["discovery", "leads", "quotation_sent", "msa_sent", "msa_signed"] as const;

export const salesRouter = router({
  // ── List all sales leads ──────────────────────────────────────────────
  list: userProcedure
    .input(
      z.object({
        status: z.string().optional(),
        assignedTo: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await listSalesLeads(
        {
          status: input.status,
          assignedTo: input.assignedTo,
          search: input.search,
        },
        input.limit,
        input.offset
      );
    }),

  // ── Get single lead by ID ────────────────────────────────────────────
  get: userProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const lead = await getSalesLeadById(input.id);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Sales lead not found" });
      return lead;
    }),

  // ── Create a new sales lead ──────────────────────────────────────────
  create: customerManagerProcedure
    .input(
      z.object({
        companyName: z.string().min(1, "Company name is required"),
        contactName: z.string().optional(),
        contactEmail: z.union([z.literal(""), z.string().email("Invalid email address")]).optional().transform(v => v || undefined),
        contactPhone: z.string().optional(),
        country: z.string().optional(),
        industry: z.string().optional(),
        estimatedEmployees: z.number().min(0).optional(),
        estimatedRevenue: z.string().optional(),
        currency: z.string().default("USD"),
        source: z.string().optional(),
        intendedServices: z.string().optional(),
        targetCountries: z.string().optional(),
        assignedTo: z.number().optional(),
        notes: z.string().optional(),
        expectedCloseDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createSalesLead({
        companyName: input.companyName,
        contactName: input.contactName || null,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        country: input.country || null,
        industry: input.industry || null,
        estimatedEmployees: input.estimatedEmployees ?? null,
        estimatedRevenue: input.estimatedRevenue || null,
        currency: input.currency,
        source: input.source || null,
        intendedServices: input.intendedServices || null,
        targetCountries: input.targetCountries || null,
        createdBy: ctx.user.id,
        assignedTo: input.assignedTo ?? null,
        notes: input.notes || null,
        expectedCloseDate: input.expectedCloseDate
          ? new Date(input.expectedCloseDate + "T00:00:00Z")
          : null,
        status: "discovery",
      });

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "create",
        entityType: "sales_lead",
        changes: JSON.stringify(input),
      });

      return result;
    }),

  // ── Update a sales lead ──────────────────────────────────────────────
  update: customerManagerProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          companyName: z.string().optional(),
          contactName: z.string().optional(),
          contactEmail: z.union([z.literal(""), z.string().email()]).optional().transform(v => v || undefined),
          contactPhone: z.string().optional(),
          country: z.string().optional(),
          industry: z.string().optional(),
          estimatedEmployees: z.number().optional(),
          estimatedRevenue: z.string().optional(),
          currency: z.string().optional(),
          source: z.string().optional(),
          intendedServices: z.string().optional(),
          targetCountries: z.string().optional(),
          status: z
            .enum([
              "discovery",
              "leads",
              "quotation_sent",
              "msa_sent",
              "msa_signed",
              "closed_won",
              "closed_lost",
            ])
            .optional(),
          lostReason: z.string().optional(),
          assignedTo: z.number().nullable().optional(),
          notes: z.string().optional(),
          expectedCloseDate: z.string().nullable().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await getSalesLeadById(input.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Sales lead not found" });

      // Prevent editing closed_won leads
      if (existing.status === "closed_won") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot edit a closed-won deal.",
        });
      }

      // If advancing to "leads", intendedServices and targetCountries should be present
      // (soft validation — we log a warning but don't block)

      const updateData: any = { ...input.data };
      if (input.data.expectedCloseDate !== undefined) {
        updateData.expectedCloseDate = input.data.expectedCloseDate
          ? new Date(input.data.expectedCloseDate + "T00:00:00Z")
          : null;
      }

      await updateSalesLead(input.id, updateData);

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "update",
        entityType: "sales_lead",
        entityId: input.id,
        changes: JSON.stringify(input.data),
      });

      return { success: true };
    }),

  // ── Convert lead to customer (triggered at MSA Signed stage) ─────────
  convertToCustomer: customerManagerProcedure
    .input(
      z.object({
        leadId: z.number(),
        paymentTermDays: z.number().min(0).max(365).default(30),
        settlementCurrency: z.string().default("USD"),
        language: z.enum(["en", "zh"]).default("en"),
        billingEntityId: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lead = await getSalesLeadById(input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Sales lead not found" });

      // Already converted
      if (lead.convertedCustomerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This lead has already been converted to a customer.",
        });
      }

      // Must be at msa_signed stage to convert
      if (lead.status !== "msa_signed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: 'Only leads at "MSA Signed" stage can be converted to customers.',
        });
      }

      // 1. Create customer from lead data
      const customerResult = await createCustomer({
        companyName: lead.companyName,
        industry: lead.industry || undefined,
        country: lead.country || "Unknown",
        primaryContactName: lead.contactName || undefined,
        primaryContactEmail: lead.contactEmail || undefined,
        primaryContactPhone: lead.contactPhone || undefined,
        paymentTermDays: input.paymentTermDays,
        settlementCurrency: input.settlementCurrency,
        language: input.language,
        billingEntityId: input.billingEntityId || undefined,
        notes: input.notes || lead.notes || undefined,
        status: "active",
      });

      const customerId = (customerResult as any)[0]?.insertId ?? (customerResult as any).insertId;

      // 2. Auto-create primary contact if contact info exists
      if (customerId && lead.contactName) {
        await createCustomerContact({
          customerId,
          contactName: lead.contactName,
          email: lead.contactEmail || "",
          phone: lead.contactPhone || undefined,
          role: "Primary Contact",
          isPrimary: true,
          hasPortalAccess: false,
        });
      }

      // 3. Link lead to customer (status stays msa_signed — will become closed_won
      //    when first employee reaches onboarding status)
      await updateSalesLead(input.leadId, {
        convertedCustomerId: customerId,
      });

      // 4. Log the conversion activity
      await createSalesActivity({
        leadId: input.leadId,
        activityType: "note",
        description: `Customer created (ID: ${customerId}). Sales to introduce customer manager and arrange kickoff meeting. Converted by ${ctx.user.name || "Unknown"}.`,
        createdBy: ctx.user.id,
      });

      // 5. Audit log
      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "convert_to_customer",
        entityType: "sales_lead",
        entityId: input.leadId,
        changes: JSON.stringify({ customerId, companyName: lead.companyName }),
      });

      return { success: true, customerId };
    }),

  // ── Check if customer has employees at onboarding or later stages ──────
  checkOnboardingStatus: userProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      const lead = await getSalesLeadById(input.leadId);
      if (!lead || !lead.convertedCustomerId) return { hasOnboardingEmployee: false, employeeCount: 0 };

      // Statuses that are "onboarding" or later in the employee lifecycle
      const onboardingOrLaterStatuses = [
        "onboarding", "contract_signed", "active", "on_leave", "offboarding", "terminated",
      ];

      const result = await listEmployees({ customerId: lead.convertedCustomerId }, 1000, 0);
      const employees = result.data || [];
      const onboardingEmployees = employees.filter(
        (emp: any) => onboardingOrLaterStatuses.includes(emp.status)
      );

      return {
        hasOnboardingEmployee: onboardingEmployees.length > 0,
        employeeCount: employees.length,
        onboardingCount: onboardingEmployees.length,
      };
    }),

  // ── Mark as Closed Won (requires customer to have employee at onboarding+) ──
  closeWon: customerManagerProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const lead = await getSalesLeadById(input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Sales lead not found" });

      if (lead.status !== "msa_signed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: 'Only leads at "MSA Signed" stage can be marked as Closed Won.',
        });
      }

      if (!lead.convertedCustomerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Customer must be created before closing the deal.",
        });
      }

      // Check that the customer has at least one employee at onboarding or later stage
      const onboardingOrLaterStatuses = [
        "onboarding", "contract_signed", "active", "on_leave", "offboarding", "terminated",
      ];
      const empResult = await listEmployees({ customerId: lead.convertedCustomerId }, 1000, 0);
      const allEmployees = empResult.data || [];
      const onboardingEmployees = allEmployees.filter(
        (emp: any) => onboardingOrLaterStatuses.includes(emp.status)
      );

      if (onboardingEmployees.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot close as won: the customer must have at least one employee at Onboarding stage or later.",
        });
      }

      await updateSalesLead(input.leadId, { status: "closed_won" });

      await createSalesActivity({
        leadId: input.leadId,
        activityType: "note",
        description: `Deal closed as won. ${onboardingEmployees.length} employee(s) confirmed at onboarding or later stage. Closed by ${ctx.user.name || "Unknown"}.`,
        createdBy: ctx.user.id,
      });

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "update",
        entityType: "sales_lead",
        entityId: input.leadId,
        changes: JSON.stringify({ status: "closed_won", onboardingEmployees: onboardingEmployees.length }),
      });

      return { success: true };
    }),

  // ── Delete a sales lead ──────────────────────────────────────────────
  delete: customerManagerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getSalesLeadById(input.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Sales lead not found" });

      if (existing.status === "closed_won" || existing.convertedCustomerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete a lead that has been converted to a customer.",
        });
      }

      await deleteSalesLead(input.id);

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "delete",
        entityType: "sales_lead",
        entityId: input.id,
        changes: JSON.stringify({ companyName: existing.companyName }),
      });

      return { success: true };
    }),

  // ── Activities sub-router ────────────────────────────────────────────
  activities: router({
    list: userProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input }) => {
        return await listSalesActivities(input.leadId);
      }),

    create: customerManagerProcedure
      .input(
        z.object({
          leadId: z.number(),
          activityType: z.enum([
            "call",
            "email",
            "meeting",
            "note",
            "proposal",
            "follow_up",
            "other",
          ]),
          description: z.string().min(1, "Description is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const lead = await getSalesLeadById(input.leadId);
        if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Sales lead not found" });

        return await createSalesActivity({
          leadId: input.leadId,
          activityType: input.activityType,
          description: input.description,
          createdBy: ctx.user.id,
        });
      }),

    delete: customerManagerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSalesActivity(input.id);
        return { success: true };
      }),
  }),

  // ── List users for assignment dropdown ───────────────────────────────
  assignableUsers: userProcedure.query(async () => {
    const result = await listUsers(100, 0);
    return result.data.map((u) => ({
      id: u.id,
      name: u.name || u.email || `User #${u.id}`,
      email: u.email,
    }));
  }),
});
