/**
 * Admin Dashboard Router — Role-based Workspace Data
 *
 * Replaces the old monolithic dashboard router with role-specific,
 * high-performance aggregation queries (no N+1 loops).
 *
 * Four workspace views:
 *   1. Sales        → Pipeline funnel, quotation stats, recent leads
 *   2. AM (Customer Manager) → Onboarding, employee lifecycle, client health
 *   3. Ops Manager  → Pending tasks across payroll/invoices/vendor bills/leave/adjustments/reimbursements
 *   4. Finance      → AR/AP, settlement status, wallet balances, release tasks
 *
 * Admin sees everything.
 */
import { z } from "zod";
import { router } from "../_core/trpc";
import { protectedProcedure, adminProcedure } from "../procedures";
import { getDb } from "../db";
import {
  salesLeads,
  quotations,
  salesActivities,
  employees,
  customers,
  onboardingInvites,
  employeeContracts,
  payrollRuns,
  invoices,
  vendorBills,
  leaveRecords,
  adjustments,
  reimbursements,
  customerWallets,
  customerFrozenWallets,
  auditLogs,
  contractors,
  countriesConfig,
  customerPricing,
  billingEntities,
  vendors,
  contractorContracts,
} from "../../drizzle/schema";
import { eq, and, or, sql, gte, lte, count, sum, desc, inArray, ne, lt, isNull, isNotNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { parseRoles, hasAnyRole, isAdmin } from "../../shared/roles";

// ─── Helpers ────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const adminDashboardRouter = router({
  // ═══════════════════════════════════════════════════════════════════════════
  // GREETING — dynamic, time-aware, personalized
  // ═══════════════════════════════════════════════════════════════════════════
  greeting: protectedProcedure.query(({ ctx }) => {
    const user = ctx.user;
    const name = user.name?.split(" ")[0] || "there";
    const now = new Date();
    const hour = now.getUTCHours() + 8; // Approximate — client can override
    const dayOfWeek = now.getDay(); // 0=Sun

    // Time-based greetings (English)
    const morningGreetings = [
      `Good morning, ${name}! Let's make today count.`,
      `Rise and shine, ${name}! Ready to conquer the day?`,
      `Morning, ${name}! Coffee first, then world domination.`,
      `Hey ${name}, early bird gets the worm!`,
      `Good morning, ${name}! Another day, another opportunity.`,
    ];
    const afternoonGreetings = [
      `Good afternoon, ${name}! Keep up the great work.`,
      `Hey ${name}, hope your day is going well!`,
      `Afternoon, ${name}! You're doing amazing.`,
      `Hi ${name}, halfway through the day — you've got this!`,
      `Good afternoon, ${name}! Stay focused, stay awesome.`,
    ];
    const eveningGreetings = [
      `Good evening, ${name}! Wrapping up for the day?`,
      `Hey ${name}, burning the midnight oil?`,
      `Evening, ${name}! Don't forget to take a break.`,
      `Hi ${name}, still going strong? Respect!`,
      `Good evening, ${name}! Tomorrow is another day.`,
    ];

    // Day-of-week specials
    const daySpecials: Record<number, string[]> = {
      1: [ // Monday
        `Happy Monday, ${name}! New week, new wins.`,
        `Monday motivation, ${name}! Let's crush it this week.`,
        `Hey ${name}, Mondays are for fresh starts!`,
      ],
      5: [ // Friday
        `Happy Friday, ${name}! The weekend is almost here!`,
        `TGIF, ${name}! One last push before the weekend.`,
        `Friday vibes, ${name}! Finish strong!`,
      ],
    };

    // Chinese greetings
    const morningGreetingsCN = [
      `早上好，${name}！新的一天，加油！`,
      `${name}，早安！今天也要元气满满哦！`,
      `早上好，${name}！先来杯咖啡，然后征服世界。`,
      `嗨 ${name}，早起的鸟儿有虫吃！`,
    ];
    const afternoonGreetingsCN = [
      `下午好，${name}！继续保持！`,
      `嗨 ${name}，今天过得怎么样？`,
      `下午好，${name}！你做得很棒！`,
      `${name}，下午了，加油冲刺！`,
    ];
    const eveningGreetingsCN = [
      `晚上好，${name}！准备收工了吗？`,
      `嗨 ${name}，还在加班？辛苦了！`,
      `晚上好，${name}！别忘了休息哦。`,
      `${name}，晚上好！明天又是新的一天。`,
    ];
    const daySpecialsCN: Record<number, string[]> = {
      1: [
        `周一好，${name}！新的一周，新的开始！`,
        `${name}，周一加油！这周一定很棒！`,
      ],
      5: [
        `周五好，${name}！周末就要来啦！`,
        `TGIF，${name}！最后冲刺一下！`,
      ],
    };

    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    let greetingEN: string;
    let greetingCN: string;

    // Check for day specials first (30% chance)
    if (daySpecials[dayOfWeek] && Math.random() < 0.3) {
      greetingEN = pick(daySpecials[dayOfWeek]);
      greetingCN = pick(daySpecialsCN[dayOfWeek] || morningGreetingsCN);
    } else if (hour < 12) {
      greetingEN = pick(morningGreetings);
      greetingCN = pick(morningGreetingsCN);
    } else if (hour < 18) {
      greetingEN = pick(afternoonGreetings);
      greetingCN = pick(afternoonGreetingsCN);
    } else {
      greetingEN = pick(eveningGreetings);
      greetingCN = pick(eveningGreetingsCN);
    }

    return { en: greetingEN, zh: greetingCN };
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TEAM PULSE — birthdays, new joiners, work anniversaries
  // ═══════════════════════════════════════════════════════════════════════════
  teamPulse: protectedProcedure.query(async () => {
    const db = getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not initialized" });

    const todayStr = today();
    const todayMD = todayStr.slice(5); // "MM-DD"
    const thisMonth = todayStr.slice(0, 7); // "YYYY-MM"
    const sevenDaysLater = daysFromNow(7).slice(5); // "MM-DD"

    // Upcoming birthdays (this week, matching MM-DD)
    const allActiveEmployees = await db
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        dateOfBirth: employees.dateOfBirth,
        startDate: employees.startDate,
        country: employees.country,
        customerId: employees.customerId,
        status: employees.status,
      })
      .from(employees)
      .where(
        inArray(employees.status, ["active", "onboarding", "contract_signed", "on_leave"])
      );

    const events: Array<{
      type: "birthday" | "new_joiner" | "anniversary" | "onboarding";
      employeeId: number;
      employeeName: string;
      country: string;
      detail: string;
    }> = [];

    const currentYear = new Date().getFullYear();

    for (const emp of allActiveEmployees) {
      const name = `${emp.firstName} ${emp.lastName}`;

      // Birthday check (next 7 days)
      if (emp.dateOfBirth) {
        const bMD = emp.dateOfBirth.slice(5); // "MM-DD"
        if (bMD >= todayMD && bMD <= sevenDaysLater) {
          events.push({
            type: "birthday",
            employeeId: emp.id,
            employeeName: name,
            country: emp.country,
            detail: bMD === todayMD ? "Today!" : emp.dateOfBirth.slice(5),
          });
        }
      }

      // New joiner this month
      if (emp.startDate && emp.startDate.startsWith(thisMonth)) {
        events.push({
          type: "new_joiner",
          employeeId: emp.id,
          employeeName: name,
          country: emp.country,
          detail: emp.startDate,
        });
      }

      // Work anniversary (same month-day, different year)
      if (emp.startDate) {
        const sMD = emp.startDate.slice(5);
        const sYear = parseInt(emp.startDate.slice(0, 4));
        if (sMD >= todayMD && sMD <= sevenDaysLater && sYear < currentYear) {
          const years = currentYear - sYear;
          events.push({
            type: "anniversary",
            employeeId: emp.id,
            employeeName: name,
            country: emp.country,
            detail: `${years} year${years > 1 ? "s" : ""}`,
          });
        }
      }

      // Currently onboarding
      if (emp.status === "onboarding") {
        events.push({
          type: "onboarding",
          employeeId: emp.id,
          employeeName: name,
          country: emp.country,
          detail: emp.startDate || "",
        });
      }
    }

    return events.slice(0, 20); // Limit to 20 events
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SALES WORKSPACE — Pipeline funnel + Quotation stats + Recent leads
  // ═══════════════════════════════════════════════════════════════════════════
  salesMetrics: protectedProcedure.query(async ({ ctx }) => {
    if (!hasAnyRole(ctx.user.role, ["admin", "sales"])) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Sales access required" });
    }
    const db = getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not initialized" });

    // Pipeline counts by stage (single query)
    const pipelineRaw = await db
      .select({
        status: salesLeads.status,
        cnt: count(),
      })
      .from(salesLeads)
      .groupBy(salesLeads.status);

    const pipeline: Record<string, number> = {};
    for (const row of pipelineRaw) {
      pipeline[row.status] = row.cnt;
    }

    // Quotation stats (single query)
    const quotationRaw = await db
      .select({
        status: quotations.status,
        cnt: count(),
        totalValue: sum(quotations.totalMonthly),
      })
      .from(quotations)
      .groupBy(quotations.status);

    const quotationStats: Record<string, { count: number; value: string }> = {};
    for (const row of quotationRaw) {
      quotationStats[row.status] = {
        count: row.cnt,
        value: row.totalValue ?? "0",
      };
    }

    // Recent leads (last 10)
    const recentLeads = await db
      .select({
        id: salesLeads.id,
        companyName: salesLeads.companyName,
        contactName: salesLeads.contactName,
        status: salesLeads.status,
        estimatedRevenue: salesLeads.estimatedRevenue,
        currency: salesLeads.currency,
        updatedAt: salesLeads.updatedAt,
      })
      .from(salesLeads)
      .orderBy(desc(salesLeads.updatedAt))
      .limit(10);

    // Leads needing follow-up (no activity in 7+ days, still active)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const staleLeads = await db
      .select({
        id: salesLeads.id,
        companyName: salesLeads.companyName,
        status: salesLeads.status,
        updatedAt: salesLeads.updatedAt,
      })
      .from(salesLeads)
      .where(
        and(
          inArray(salesLeads.status, ["discovery", "leads", "quotation_sent", "msa_sent", "msa_signed"]),
          lte(salesLeads.updatedAt, sevenDaysAgo)
        )
      )
      .orderBy(salesLeads.updatedAt)
      .limit(10);

    return {
      pipeline,
      quotationStats,
      recentLeads,
      staleLeads,
      totalActiveLeads: Object.entries(pipeline)
        .filter(([k]) => !["closed_won", "closed_lost"].includes(k))
        .reduce((s, [, v]) => s + v, 0),
    };
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // AM (CUSTOMER MANAGER) WORKSPACE — Onboarding, employee lifecycle, clients
  // ═══════════════════════════════════════════════════════════════════════════
  amMetrics: protectedProcedure.query(async ({ ctx }) => {
    if (!hasAnyRole(ctx.user.role, ["admin", "customer_manager"])) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Customer Manager access required" });
    }
    const db = getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not initialized" });

    // Employee status distribution (single query)
    const empStatusRaw = await db
      .select({
        status: employees.status,
        cnt: count(),
      })
      .from(employees)
      .groupBy(employees.status);

    const empStatus: Record<string, number> = {};
    for (const row of empStatusRaw) {
      empStatus[row.status] = row.cnt;
    }

    // Contractor status distribution
    const ctrStatusRaw = await db
      .select({
        status: contractors.status,
        cnt: count(),
      })
      .from(contractors)
      .groupBy(contractors.status);

    const ctrStatus: Record<string, number> = {};
    for (const row of ctrStatusRaw) {
      ctrStatus[row.status] = row.cnt;
    }

    // Pending onboarding invites
    const pendingInvites = await db
      .select({ cnt: count() })
      .from(onboardingInvites)
      .where(eq(onboardingInvites.status, "pending"));

    // Contracts expiring within 30 days
    const expiringContracts = await db
      .select({
        id: employeeContracts.id,
        employeeId: employeeContracts.employeeId,
        expiryDate: employeeContracts.expiryDate,
        status: employeeContracts.status,
      })
      .from(employeeContracts)
      .where(
        and(
          eq(employeeContracts.status, "signed"),
          gte(employeeContracts.expiryDate, today()),
          lte(employeeContracts.expiryDate, daysFromNow(30))
        )
      );

    // Active customers count
    const activeCustomers = await db
      .select({ cnt: count() })
      .from(customers)
      .where(eq(customers.status, "active"));

    // Employees by country (top 10)
    const empByCountry = await db
      .select({
        country: employees.country,
        cnt: count(),
      })
      .from(employees)
      .where(inArray(employees.status, ["active", "onboarding", "contract_signed", "on_leave"]))
      .groupBy(employees.country)
      .orderBy(desc(count()))
      .limit(10);

    // New hires this month
    const cm = currentMonth();
    const newHiresThisMonth = await db
      .select({ cnt: count() })
      .from(employees)
      .where(
        and(
          gte(employees.startDate, cm),
          lte(employees.startDate, daysFromNow(30))
        )
      );

    return {
      employeeStatus: empStatus,
      contractorStatus: ctrStatus,
      pendingOnboardingInvites: pendingInvites[0]?.cnt ?? 0,
      expiringContracts,
      activeCustomers: activeCustomers[0]?.cnt ?? 0,
      employeesByCountry: empByCountry,
      newHiresThisMonth: newHiresThisMonth[0]?.cnt ?? 0,
      totalActiveEmployees: Object.entries(empStatus)
        .filter(([k]) => ["active", "on_leave", "contract_signed"].includes(k))
        .reduce((s, [, v]) => s + v, 0),
      totalActiveContractors: ctrStatus["active"] ?? 0,
    };
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // OPS MANAGER WORKSPACE — All pending tasks across modules
  // ═══════════════════════════════════════════════════════════════════════════
  opsMetrics: protectedProcedure.query(async ({ ctx }) => {
    if (!hasAnyRole(ctx.user.role, ["admin", "operations_manager"])) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Operations Manager access required" });
    }
    const db = getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not initialized" });

    // Payroll: draft + pending_approval
    const payrollPending = await db
      .select({
        status: payrollRuns.status,
        cnt: count(),
      })
      .from(payrollRuns)
      .where(inArray(payrollRuns.status, ["draft", "pending_approval"]))
      .groupBy(payrollRuns.status);

    const payrollCounts: Record<string, number> = {};
    for (const row of payrollPending) {
      payrollCounts[row.status] = row.cnt;
    }

    // Invoices: draft + pending_review
    const invoicePending = await db
      .select({
        status: invoices.status,
        cnt: count(),
      })
      .from(invoices)
      .where(inArray(invoices.status, ["draft", "pending_review"]))
      .groupBy(invoices.status);

    const invoiceCounts: Record<string, number> = {};
    for (const row of invoicePending) {
      invoiceCounts[row.status] = row.cnt;
    }

    // Vendor Bills: draft + pending_approval
    const vendorBillPending = await db
      .select({
        status: vendorBills.status,
        cnt: count(),
      })
      .from(vendorBills)
      .where(inArray(vendorBills.status, ["draft", "pending_approval"]))
      .groupBy(vendorBills.status);

    const vendorBillCounts: Record<string, number> = {};
    for (const row of vendorBillPending) {
      vendorBillCounts[row.status] = row.cnt;
    }

    // Leave: submitted + client_approved (need admin approval)
    const leavePending = await db
      .select({ cnt: count() })
      .from(leaveRecords)
      .where(inArray(leaveRecords.status, ["submitted", "client_approved"]));

    // Adjustments: submitted + client_approved
    const adjPending = await db
      .select({ cnt: count() })
      .from(adjustments)
      .where(inArray(adjustments.status, ["submitted", "client_approved"]));

    // Reimbursements: submitted + client_approved
    const reimbPending = await db
      .select({ cnt: count() })
      .from(reimbursements)
      .where(inArray(reimbursements.status, ["submitted", "client_approved"]));

    // Employees pending review
    const empPendingReview = await db
      .select({ cnt: count() })
      .from(employees)
      .where(inArray(employees.status, ["pending_review", "documents_incomplete"]));

    // Contractors pending review
    const ctrPendingReview = await db
      .select({ cnt: count() })
      .from(contractors)
      .where(eq(contractors.status, "pending_review"));

    return {
      payroll: payrollCounts,
      invoices: invoiceCounts,
      vendorBills: vendorBillCounts,
      pendingLeaves: leavePending[0]?.cnt ?? 0,
      pendingAdjustments: adjPending[0]?.cnt ?? 0,
      pendingReimbursements: reimbPending[0]?.cnt ?? 0,
      pendingEmployeeReviews: empPendingReview[0]?.cnt ?? 0,
      pendingContractorReviews: ctrPendingReview[0]?.cnt ?? 0,
    };
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE WORKSPACE — AR/AP, settlement, wallet, release tasks
  // ═══════════════════════════════════════════════════════════════════════════
  financeMetrics: protectedProcedure.query(async ({ ctx }) => {
    if (!hasAnyRole(ctx.user.role, ["admin", "finance_manager"])) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Finance Manager access required" });
    }
    const db = getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not initialized" });

    // AR: Invoices sent but unpaid (sent + overdue + partially_paid)
    const arRaw = await db
      .select({
        status: invoices.status,
        cnt: count(),
        totalAmount: sum(invoices.total),
        totalPaid: sum(invoices.paidAmount),
      })
      .from(invoices)
      .where(inArray(invoices.status, ["sent", "overdue", "partially_paid"]))
      .groupBy(invoices.status);

    const ar: Record<string, { count: number; amount: string }> = {};
    for (const row of arRaw) {
      ar[row.status] = {
        count: row.cnt,
        amount: row.totalAmount ?? "0",
      };
    }

    // AP: Vendor bills approved but not yet paid
    const apRaw = await db
      .select({
        status: vendorBills.status,
        cnt: count(),
        totalAmount: sum(vendorBills.totalAmount),
      })
      .from(vendorBills)
      .where(inArray(vendorBills.status, ["approved", "overdue", "partially_paid"]))
      .groupBy(vendorBills.status);

    const ap: Record<string, { count: number; amount: string }> = {};
    for (const row of apRaw) {
      ap[row.status] = {
        count: row.cnt,
        amount: row.totalAmount ?? "0",
      };
    }

    // Settled this month (invoices marked paid this month)
    const cm = currentMonth();
    const settledThisMonth = await db
      .select({
        cnt: count(),
        totalPaid: sum(invoices.paidAmount),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.status, "paid"),
          gte(invoices.paidDate, new Date(cm))
        )
      );

    // Vendor bills paid this month
    const vendorPaidThisMonth = await db
      .select({
        cnt: count(),
        totalSettled: sum(vendorBills.settlementAmount),
        totalBankFees: sum(vendorBills.settlementBankFee),
      })
      .from(vendorBills)
      .where(
        and(
          eq(vendorBills.status, "paid"),
          gte(vendorBills.settlementDate, cm)
        )
      );

    // Wallet balances summary
    const walletSummary = await db
      .select({
        totalBalance: sum(customerWallets.balance),
        cnt: count(),
      })
      .from(customerWallets);

    // Frozen wallet summary
    const frozenSummary = await db
      .select({
        totalBalance: sum(customerFrozenWallets.balance),
        cnt: count(),
      })
      .from(customerFrozenWallets);

    // Overdue invoices (urgent)
    const overdueInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerId: invoices.customerId,
        total: invoices.total,
        currency: invoices.currency,
        dueDate: invoices.dueDate,
      })
      .from(invoices)
      .where(eq(invoices.status, "overdue"))
      .orderBy(invoices.dueDate)
      .limit(10);

    return {
      accountsReceivable: ar,
      accountsPayable: ap,
      settledThisMonth: {
        invoiceCount: settledThisMonth[0]?.cnt ?? 0,
        totalCollected: settledThisMonth[0]?.totalPaid ?? "0",
      },
      vendorPaidThisMonth: {
        billCount: vendorPaidThisMonth[0]?.cnt ?? 0,
        totalSettled: vendorPaidThisMonth[0]?.totalSettled ?? "0",
        totalBankFees: vendorPaidThisMonth[0]?.totalBankFees ?? "0",
      },
      walletBalance: walletSummary[0]?.totalBalance ?? "0",
      walletCount: walletSummary[0]?.cnt ?? 0,
      frozenBalance: frozenSummary[0]?.totalBalance ?? "0",
      frozenCount: frozenSummary[0]?.cnt ?? 0,
      overdueInvoices,
    };
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // RECENT ACTIVITY — role-filtered audit log
  // ═══════════════════════════════════════════════════════════════════════════
  recentActivity: protectedProcedure
    .input(z.object({ limit: z.number().default(15) }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not initialized" });

      const limit = input?.limit ?? 15;

      const logs = await db
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          userName: auditLogs.userName,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          changes: auditLogs.changes,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);

      return logs;
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM HEALTH — Admin-only monitoring dashboard
  // ═══════════════════════════════════════════════════════════════════════════
  systemHealth: adminProcedure.query(async () => {
    const db = getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not initialized" });

    const todayStr = today();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoMs = thirtyDaysAgo.getTime();

    // ── 1. Orphan Employees ──
    // Employees whose customer doesn't exist or is terminated, but employee is still active-ish
    const orphanEmployees = await db
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        status: employees.status,
        customerId: employees.customerId,
        customerName: customers.companyName,
        customerStatus: customers.status,
      })
      .from(employees)
      .leftJoin(customers, eq(employees.customerId, customers.id))
      .where(
        and(
          inArray(employees.status, ["pending_review", "documents_incomplete", "onboarding", "contract_signed", "active", "on_leave"]),
          or(
            isNull(customers.id),
            eq(customers.status, "terminated")
          )
        )
      );

    // ── 2. Active Customers Missing Billing Entity ──
    const customersMissingBillingEntity = await db
      .select({
        id: customers.id,
        companyName: customers.companyName,
      })
      .from(customers)
      .where(
        and(
          eq(customers.status, "active"),
          isNull(customers.billingEntityId)
        )
      );

    // ── 3. Active Customers Missing Pricing ──
    // Active customers that have NO active customerPricing record at all
    const customersWithPricing = db
      .select({ customerId: customerPricing.customerId })
      .from(customerPricing)
      .where(eq(customerPricing.isActive, true))
      .groupBy(customerPricing.customerId);

    const customersMissingPricing = await db
      .select({
        id: customers.id,
        companyName: customers.companyName,
      })
      .from(customers)
      .where(
        and(
          eq(customers.status, "active"),
          sql`${customers.id} NOT IN (SELECT ${customerPricing.customerId} FROM ${customerPricing} WHERE ${customerPricing.isActive} = 1)`
        )
      );

    // ── 4. Countries Missing Rate Config ──
    // a) isActive = true but standardEorRate is NULL
    const countriesMissingRate = await db
      .select({
        id: countriesConfig.id,
        countryCode: countriesConfig.countryCode,
        countryName: countriesConfig.countryName,
      })
      .from(countriesConfig)
      .where(
        and(
          eq(countriesConfig.isActive, true),
          isNull(countriesConfig.standardEorRate)
        )
      );

    // b) Employees in countries not in countriesConfig at all
    const unmappedCountries = await db
      .select({
        country: employees.country,
        employeeCount: count(employees.id),
      })
      .from(employees)
      .where(
        and(
          inArray(employees.status, ["active", "onboarding", "contract_signed"]),
          sql`${employees.country} NOT IN (SELECT ${countriesConfig.countryCode} FROM ${countriesConfig})`
        )
      )
      .groupBy(employees.country);

    // ── 5. Expired Employee Contracts (still marked as signed) ──
    const expiredEmployeeContracts = await db
      .select({
        id: employeeContracts.id,
        employeeId: employeeContracts.employeeId,
        expiryDate: employeeContracts.expiryDate,
        empFirstName: employees.firstName,
        empLastName: employees.lastName,
      })
      .from(employeeContracts)
      .leftJoin(employees, eq(employeeContracts.employeeId, employees.id))
      .where(
        and(
          eq(employeeContracts.status, "signed"),
          isNotNull(employeeContracts.expiryDate),
          lt(employeeContracts.expiryDate, todayStr)
        )
      );

    // ── 6. Expired Contractor Contracts (still marked as signed) ──
    const expiredContractorContracts = await db
      .select({
        id: contractorContracts.id,
        contractorId: contractorContracts.contractorId,
        expiryDate: contractorContracts.expiryDate,
        ctrFirstName: contractors.firstName,
        ctrLastName: contractors.lastName,
      })
      .from(contractorContracts)
      .leftJoin(contractors, eq(contractorContracts.contractorId, contractors.id))
      .where(
        and(
          eq(contractorContracts.status, "signed"),
          isNotNull(contractorContracts.expiryDate),
          lt(contractorContracts.expiryDate, todayStr)
        )
      );

    // ── 7. Stale Draft Documents (>30 days old) ──
    const staleDraftPayrolls = await db
      .select({ cnt: count(payrollRuns.id) })
      .from(payrollRuns)
      .where(
        and(
          eq(payrollRuns.status, "draft"),
          lt(payrollRuns.createdAt, new Date(thirtyDaysAgoMs))
        )
      );

    const staleDraftInvoices = await db
      .select({ cnt: count(invoices.id) })
      .from(invoices)
      .where(
        and(
          eq(invoices.status, "draft"),
          lt(invoices.createdAt, new Date(thirtyDaysAgoMs))
        )
      );

    const staleDraftVendorBills = await db
      .select({ cnt: count(vendorBills.id) })
      .from(vendorBills)
      .where(
        and(
          eq(vendorBills.status, "draft"),
          lt(vendorBills.createdAt, new Date(thirtyDaysAgoMs))
        )
      );

    // ── 8. Negative Wallet Balances ──
    const negativeWallets = await db
      .select({
        id: customerWallets.id,
        customerId: customerWallets.customerId,
        currency: customerWallets.currency,
        balance: customerWallets.balance,
        companyName: customers.companyName,
      })
      .from(customerWallets)
      .leftJoin(customers, eq(customerWallets.customerId, customers.id))
      .where(sql`CAST(${customerWallets.balance} AS REAL) < 0`);

    // ── 9. Expired Onboarding Invites (still pending) ──
    const expiredInvites = await db
      .select({ cnt: count(onboardingInvites.id) })
      .from(onboardingInvites)
      .where(
        and(
          eq(onboardingInvites.status, "pending"),
          lt(onboardingInvites.expiresAt, new Date())
        )
      );

    // ── Aggregate into health items ──
    return {
      orphanEmployees: orphanEmployees.map(e => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        status: e.status,
        customerId: e.customerId,
        customerName: e.customerName ?? null,
        customerStatus: e.customerStatus ?? null,
      })),
      customersMissingBillingEntity: customersMissingBillingEntity.map(c => ({
        id: c.id,
        companyName: c.companyName,
      })),
      customersMissingPricing: customersMissingPricing.map(c => ({
        id: c.id,
        companyName: c.companyName,
      })),
      countriesMissingRate: countriesMissingRate.map(c => ({
        countryCode: c.countryCode,
        countryName: c.countryName,
      })),
      unmappedCountries: unmappedCountries.map(c => ({
        country: c.country,
        employeeCount: c.employeeCount,
      })),
      expiredEmployeeContracts: expiredEmployeeContracts.map(c => ({
        id: c.id,
        employeeId: c.employeeId,
        employeeName: c.empFirstName && c.empLastName ? `${c.empFirstName} ${c.empLastName}` : `Employee #${c.employeeId}`,
        expiryDate: c.expiryDate,
      })),
      expiredContractorContracts: expiredContractorContracts.map(c => ({
        id: c.id,
        contractorId: c.contractorId,
        contractorName: c.ctrFirstName && c.ctrLastName ? `${c.ctrFirstName} ${c.ctrLastName}` : `Contractor #${c.contractorId}`,
        expiryDate: c.expiryDate,
      })),
      staleDrafts: {
        payrolls: staleDraftPayrolls[0]?.cnt ?? 0,
        invoices: staleDraftInvoices[0]?.cnt ?? 0,
        vendorBills: staleDraftVendorBills[0]?.cnt ?? 0,
      },
      negativeWallets: negativeWallets.map(w => ({
        id: w.id,
        customerId: w.customerId,
        companyName: w.companyName ?? `Customer #${w.customerId}`,
        currency: w.currency,
        balance: w.balance,
      })),
      expiredInvitesCount: expiredInvites[0]?.cnt ?? 0,
    };
  }),
});
