
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router } from "../_core/trpc";
import { adminProcedure, customerManagerProcedure, operationsManagerProcedure, userProcedure } from "../procedures";
import {
  createContractor,
  getContractorById,
  listContractors,
  updateContractor,
  listContractorMilestones,
  listAllContractorMilestones,
  createContractorMilestone,
  updateContractorMilestone,
  deleteContractorMilestone,
  listContractorAdjustments,
  listAllContractorAdjustments,
  createContractorAdjustment,
  updateContractorAdjustment,
  deleteContractorAdjustment,
  getContractorAdjustmentById,
  getContractorInvoiceById,
  listContractorInvoices,
  listAllContractorInvoices,
  logAuditAction,
  deleteContractor,
  getDb
} from "../db";
import {
  contractors,
  contractorInvoices,
  contractorMilestones,
  contractorAdjustments,
  users,
  workerUsers
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { ContractorInvoiceGenerationService } from "../services/contractorInvoiceGenerationService";
import { provisionWorkerUser, resendWorkerInvite } from "../services/workerProvisioningService";
import { sanitizeTextFields } from "../utils/sanitizeText";

export const contractorsRouter = router({
  getApprovers: userProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.isActive, true));
  }),

  list: userProcedure
    .input(
      z.object({
        customerId: z.number().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await listContractors(
        {
          customerId: input.customerId,
          status: input.status,
          search: input.search,
        },
        input.limit,
        input.offset
      );
    }),

  get: userProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getContractorById(input.id);
    }),

  create: customerManagerProcedure
    .input(
      z.object({
        customerId: z.number(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        dateOfBirth: z.string().optional(),
        nationality: z.string().optional(),
        idNumber: z.string().optional(),
        idType: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string(),
        postalCode: z.string().optional(),
        department: z.string().optional(),
        jobTitle: z.string(),
        jobDescription: z.string().optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        
        // Financials
        currency: z.string().default("USD"),
        paymentFrequency: z.enum(["monthly", "semi_monthly", "milestone"]).default("monthly"),
        rateAmount: z.string().optional(),
        
        defaultApproverId: z.number().optional(),
        bankDetails: z.string().optional(), // JSON string
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input: rawInput, ctx }) => {
      const input = sanitizeTextFields(rawInput);
      // 1. Validate dates
      if (input.endDate && new Date(input.endDate) <= new Date(input.startDate)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "End date must be after start date." });
      }

      // 2. Generate Contractor Code
      const randomCode = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const contractorCode = `CTR-${new Date().getFullYear()}${randomCode}`;

      // 3. Create Contractor
      const result = await createContractor({
        ...input,
        contractorCode,
        status: "active", // Default to active or pending_review? Let's say active for now as per simple flow
        bankDetails: input.bankDetails ? JSON.parse(input.bankDetails) : undefined,
      } as any); 

      const newContractor = result[0];

      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: "create",
        entityType: "contractor",
        entityId: newContractor.id,
        changes: JSON.stringify(input),
      });

      return newContractor;
    }),

  update: customerManagerProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          dateOfBirth: z.string().optional(),
          nationality: z.string().optional(),
          idNumber: z.string().optional(),
          idType: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
          postalCode: z.string().optional(),
          department: z.string().optional(),
          jobTitle: z.string().optional(),
          jobDescription: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          status: z.enum(["pending_review", "active", "terminated"]).optional(),
          
          currency: z.string().optional(),
          paymentFrequency: z.enum(["monthly", "semi_monthly", "milestone"]).optional(),
          rateAmount: z.string().optional(),
          
          defaultApproverId: z.number().optional(),
          bankDetails: z.string().optional(),
          notes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const sanitizedData = sanitizeTextFields(input.data);
      const updateData: any = { ...sanitizedData };
      if (sanitizedData.bankDetails) {
        updateData.bankDetails = JSON.parse(sanitizedData.bankDetails);
      }

      // Validation: transitioning to terminated requires endDate
      if (sanitizedData.status === "terminated") {
        const existing = await getContractorById(input.id);
        const effectiveEndDate = sanitizedData.endDate || existing?.endDate;
        if (!effectiveEndDate) {
          // Auto-set endDate to today for immediate termination
          const today = new Date();
          updateData.endDate = today.toISOString().split('T')[0];
        }
      }

      await updateContractor(input.id, updateData);

      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: "update",
        entityType: "contractor",
        entityId: input.id,
        changes: JSON.stringify(sanitizedData),
      });

      return { success: true };
    }),

  terminate: customerManagerProcedure
    .input(z.object({
      id: z.number(),
      endDate: z.string().optional(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const endDate = input.endDate || new Date().toISOString().split('T')[0];
      await updateContractor(input.id, { status: "terminated", endDate });
      
      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: "terminate",
        entityType: "contractor",
        entityId: input.id,
        changes: JSON.stringify({ endDate, reason: input.reason || null }),
      });
      return { success: true };
    }),

  // ── Worker Portal Invite ──
  workerPortalStatus: userProcedure
    .input(z.object({ contractorId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { hasAccount: false, workerUserId: null, email: null, passwordSet: false };
      const [wu] = await db.select().from(workerUsers).where(eq(workerUsers.contractorId, input.contractorId)).limit(1);
      if (!wu) return { hasAccount: false, workerUserId: null, email: null, passwordSet: false };
      return {
        hasAccount: true,
        workerUserId: wu.id,
        email: wu.email,
        passwordSet: !!wu.passwordHash && wu.passwordHash.length > 0,
      };
    }),

  inviteToWorkerPortal: customerManagerProcedure
    .input(z.object({
      contractorId: z.number(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await provisionWorkerUser({
        contractorId: input.contractorId,
        email: input.email,
      });

      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: result.alreadyExists ? "resend_worker_invite" : "invite_to_worker_portal",
        entityType: "contractor",
        entityId: input.contractorId,
        changes: JSON.stringify({ workerUserId: result.workerUserId, email: result.email }),
      });

      if (result.alreadyExists) {
        // Resend invite email with fresh token
        await resendWorkerInvite(result.workerUserId);
        return { success: true, alreadyExists: true, email: result.email };
      }

      return { success: true, alreadyExists: false, email: result.email };
    }),

  // ── Milestones Sub-Router ──
  milestones: router({
    list: userProcedure
      .input(z.object({ contractorId: z.number() }))
      .query(async ({ input }) => {
        return await listContractorMilestones(input.contractorId);
      }),
    
    listAll: userProcedure
      .input(z.object({
        customerId: z.number().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await listAllContractorMilestones(input);
      }),

    create: operationsManagerProcedure
      .input(z.object({
        contractorId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        amount: z.string(),
        currency: z.string(),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Auto-fill customerId from contractor (required by schema)
        const contractor = await getContractorById(input.contractorId);
        if (!contractor) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contractor not found" });
        }
        // Currency is locked from the contractor record
        const currency = contractor.currency || input.currency;
        const result = await createContractorMilestone({
          ...input,
          currency,
          customerId: contractor.customerId,
          status: "pending",
        });
        
        await logAuditAction({
            userId: ctx.user.id, userName: ctx.user.name || null,
            action: "create",
            entityType: "contractor_milestone",
            changes: JSON.stringify(input),
        });
        return result;
      }),

    update: operationsManagerProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          amount: z.string().optional(),
          dueDate: z.string().optional(),
          status: z.enum(["pending", "in_progress", "submitted", "approved", "paid", "cancelled"]).optional(),
        })
      }))
      .mutation(async ({ input, ctx }) => {
        const updateData: any = { ...input.data };
        if (input.data.status === "approved") {
          updateData.approvedBy = ctx.user.id;
          updateData.approvedAt = new Date();
        }
        await updateContractorMilestone(input.id, updateData);
        return { success: true };
      }),

    delete: operationsManagerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteContractorMilestone(input.id);
        return { success: true };
      }),
  }),

  // ── Adjustments Sub-Router ──
  adjustments: router({
    list: userProcedure
      .input(z.object({ contractorId: z.number() }))
      .query(async ({ input }) => {
        return await listContractorAdjustments(input.contractorId);
      }),

    listAll: userProcedure
      .input(z.object({
        customerId: z.number().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        // @ts-ignore
        return await listAllContractorAdjustments(input);
      }),

    create: operationsManagerProcedure
      .input(z.object({
        contractorId: z.number(),
        type: z.enum(["bonus", "expense", "deduction"]),
        description: z.string().min(1),
        amount: z.string(),
        currency: z.string(),
        date: z.string(),
        attachmentUrl: z.string().optional(),
        // Recurring adjustment fields
        recurrenceType: z.enum(["one_time", "monthly", "permanent"]).default("one_time"),
        recurrenceEndMonth: z.string().optional(), // YYYY-MM or YYYY-MM-01, required for monthly
      }))
      .mutation(async ({ input, ctx }) => {
        // Auto-fill customerId from contractor (required by schema)
        const contractor = await getContractorById(input.contractorId);
        if (!contractor) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contractor not found" });
        }
        // Currency is locked from the contractor record
        const currency = contractor.currency || input.currency;
        const effectiveMonth = input.date.substring(0, 7) + "-01";

        // Validate recurrence fields
        const isRecurring = input.recurrenceType !== "one_time";
        let normalizedEndMonth: string | null = null;
        if (input.recurrenceType === "monthly") {
          if (!input.recurrenceEndMonth) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: "End month is required for monthly recurring adjustments" });
          }
          const endParts = input.recurrenceEndMonth.split("-");
          normalizedEndMonth = `${endParts[0]}-${endParts[1].padStart(2, "0")}-01`;
          if (normalizedEndMonth < effectiveMonth) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: "End month must be on or after the effective month" });
          }
        }
        if (input.recurrenceType === "permanent" && input.recurrenceEndMonth) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: "Permanent adjustments should not have an end month" });
        }

        const result = await createContractorAdjustment({
          contractorId: input.contractorId,
          type: input.type,
          description: input.description,
          amount: input.amount,
          currency,
          attachmentUrl: input.attachmentUrl || null,
          customerId: contractor.customerId,
          effectiveMonth,
          status: "submitted" as any,
          // Recurring fields
          recurrenceType: input.recurrenceType,
          recurrenceEndMonth: normalizedEndMonth,
          isRecurringTemplate: isRecurring,
          parentAdjustmentId: null,
        } as any);
        return result;
      }),

    update: operationsManagerProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          type: z.enum(["bonus", "expense", "deduction"]).optional(),
          description: z.string().optional(),
          amount: z.string().optional(),
          effectiveMonth: z.string().optional(),
          status: z.enum(["submitted", "client_approved", "client_rejected", "admin_approved", "admin_rejected", "locked"]).optional(),
          // Recurring adjustment fields
          recurrenceType: z.enum(["one_time", "monthly", "permanent"]).optional(),
          recurrenceEndMonth: z.string().optional().nullable(),
        })
      }))
      .mutation(async ({ input }) => {
        const updateData: any = { ...input.data };

        // Handle recurrence field updates
        if (input.data.recurrenceType !== undefined) {
          if (input.data.recurrenceType === "one_time") {
            updateData.isRecurringTemplate = false;
            updateData.recurrenceEndMonth = null;
          } else {
            updateData.isRecurringTemplate = true;
            if (input.data.recurrenceType === "monthly") {
              if (!input.data.recurrenceEndMonth) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: "End month is required for monthly recurring adjustments" });
              }
              const endParts = input.data.recurrenceEndMonth.split("-");
              updateData.recurrenceEndMonth = `${endParts[0]}-${endParts[1].padStart(2, "0")}-01`;
            } else {
              updateData.recurrenceEndMonth = null;
            }
          }
        } else if (input.data.recurrenceEndMonth !== undefined) {
          if (input.data.recurrenceEndMonth) {
            const endParts = input.data.recurrenceEndMonth.split("-");
            updateData.recurrenceEndMonth = `${endParts[0]}-${endParts[1].padStart(2, "0")}-01`;
          } else {
            updateData.recurrenceEndMonth = null;
          }
        }

        await updateContractorAdjustment(input.id, updateData);
        return { success: true };
      }),

    delete: operationsManagerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteContractorAdjustment(input.id);
        return { success: true };
      }),

    /**
     * Stop a recurring contractor adjustment template.
     */
    stopRecurring: operationsManagerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await getContractorAdjustmentById(input.id);
        if (!existing) throw new TRPCError({ code: 'BAD_REQUEST', message: "Contractor adjustment not found" });
        if (!existing.isRecurringTemplate) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: "This adjustment is not a recurring template" });
        }

        await updateContractorAdjustment(input.id, {
          recurrenceType: "one_time",
          isRecurringTemplate: false,
          recurrenceEndMonth: null,
        } as any);

        await logAuditAction({
          userId: ctx.user.id,
          userName: ctx.user.name || null,
          action: "stop_recurring",
          entityType: "contractor_adjustment",
          entityId: input.id,
          changes: JSON.stringify({ previousRecurrenceType: existing.recurrenceType }),
        });

        return { success: true };
      }),
  }),

  // ── Invoices Sub-Router ──
  invoices: router({
    list: userProcedure
      .input(z.object({ contractorId: z.number() }))
      .query(async ({ input }) => {
        return await listContractorInvoices(input.contractorId);
      }),

    listAll: userProcedure
      .input(z.object({
        customerId: z.number().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await listAllContractorInvoices(
          {
            customerId: input.customerId,
            status: input.status,
            search: input.search,
          },
          input.limit,
          input.offset
        );
      }),

    get: userProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getContractorInvoiceById(input.id);
      }),

    generate: operationsManagerProcedure
      .input(z.object({
        targetDate: z.string().optional(), // YYYY-MM-DD
      }))
      .mutation(async ({ input }) => {
        const date = input.targetDate ? new Date(input.targetDate) : new Date();
        const result = await ContractorInvoiceGenerationService.processAll(date);
        return result;
      }),

    approve: operationsManagerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

        const invoice = await getContractorInvoiceById(input.id);
        if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });

        if (invoice.status !== "draft" && invoice.status !== "pending_approval") {
          throw new TRPCError({ 
            code: "PRECONDITION_FAILED", 
            message: `Cannot approve invoice in status ${invoice.status}` 
          });
        }

        await db.update(contractorInvoices)
          .set({ 
            status: "approved", 
            approvedBy: ctx.user.id, 
            approvedAt: new Date() 
          })
          .where(eq(contractorInvoices.id, input.id));

        await logAuditAction({
          userId: ctx.user.id, userName: ctx.user.name || null,
          action: "approve",
          entityType: "contractor_invoice",
          entityId: input.id,
        });

        return { success: true };
      }),

    reject: operationsManagerProcedure
      .input(z.object({ id: z.number(), reason: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

        await db.update(contractorInvoices)
          .set({ 
            status: "rejected", 
            rejectedReason: input.reason 
          })
          .where(eq(contractorInvoices.id, input.id));

        await logAuditAction({
          userId: ctx.user.id, userName: ctx.user.name || null,
          action: "reject",
          entityType: "contractor_invoice",
          entityId: input.id,
          changes: JSON.stringify({ reason: input.reason }),
        });

        return { success: true };
      }),
  }),

  // ── Delete Contractor (Admin only, terminated status only) ──
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const contractor = await getContractorById(input.id);
      if (!contractor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contractor not found" });
      }
      if (contractor.status !== "terminated") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only terminated contractors can be deleted. Current status: " + contractor.status,
        });
      }

      await deleteContractor(input.id);

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "delete",
        entityType: "contractor",
        entityId: input.id,
        changes: JSON.stringify({ contractorName: `${contractor.firstName} ${contractor.lastName}`, contractorCode: contractor.contractorCode }),
      });

      return { success: true };
    }),
});
