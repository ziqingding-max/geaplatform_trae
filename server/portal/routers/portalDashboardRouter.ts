/**
 * Portal Dashboard Router — Role-based Workspace Data
 *
 * Refactored from a single monolithic "stats" endpoint into role-specific,
 * high-performance aggregation queries. Mirrors the Admin Dashboard architecture.
 *
 * Workspaces:
 *   - HR Workspace (admin, hr_manager): Onboarding, leave, adjustments, team pulse
 *   - Finance Workspace (admin, finance): Invoices, wallet, reimbursements
 *   - Overview (all roles): Employee count, country distribution, status chart
 *
 * SECURITY: Every query is SCOPED to ctx.portalUser.customerId.
 * No cross-customer data access is possible.
 */

import { z } from "zod";
import { sql, eq, and, count, inArray, gte, lt, desc, isNotNull, sum } from "drizzle-orm";
import {
  protectedPortalProcedure,
  portalRouter,
} from "../portalTrpc";
import { getDb } from "../../db";
import {
  employees,
  invoices,
  adjustments,
  leaveRecords,
  countriesConfig,
  customerLeavePolicies,
  payrollRuns,
  payrollItems,
  contractors,
  reimbursements,
  employeeContracts,
  customerWallets,
  customerFrozenWallets,
  publicHolidays,
} from "../../../drizzle/schema";
import {
  contractorContracts,
} from "../../../drizzle/aor-schema";

// ─── Helpers ────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const portalDashboardRouter = portalRouter({
  // ═══════════════════════════════════════════════════════════════════════════
  // GREETING — dynamic, time-aware, personalized (same pattern as Admin)
  // ═══════════════════════════════════════════════════════════════════════════
  greeting: protectedPortalProcedure.query(({ ctx }) => {
    const user = ctx.portalUser;
    const name = user.contactName?.split(" ")[0] || "there";
    const now = new Date();
    const hour = now.getUTCHours() + 8; // Approximate MYT
    const dayOfWeek = now.getDay(); // 0=Sun

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

    const daySpecials: Record<number, string[]> = {
      1: [
        `Happy Monday, ${name}! New week, new wins.`,
        `Monday motivation, ${name}! Let's crush it this week.`,
      ],
      5: [
        `Happy Friday, ${name}! The weekend is almost here!`,
        `TGIF, ${name}! One last push before the weekend.`,
      ],
    };

    const morningGreetingsCN = [
      `早上好，${name}！新的一天，加油！`,
      `${name}，早安！今天也要元气满满哦！`,
      `早上好，${name}！先来杯咖啡，然后征服世界。`,
    ];
    const afternoonGreetingsCN = [
      `下午好，${name}！继续保持！`,
      `嗨 ${name}，今天过得怎么样？`,
      `下午好，${name}！你做得很棒！`,
    ];
    const eveningGreetingsCN = [
      `晚上好，${name}！准备收工了吗？`,
      `嗨 ${name}，还在加班？辛苦了！`,
      `晚上好，${name}！别忘了休息哦。`,
    ];
    const daySpecialsCN: Record<number, string[]> = {
      1: [`周一好，${name}！新的一周，新的开始！`],
      5: [`周五好，${name}！周末就要来啦！`],
    };

    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    let greetingEN: string;
    let greetingCN: string;

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
  // OVERVIEW STATS — lightweight, available to ALL roles
  // KPI cards: active employees, countries, pending onboarding, role info
  // ═══════════════════════════════════════════════════════════════════════════
  stats: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const cid = ctx.portalUser.customerId;

    // Active employees count
    const [empCount] = await db
      .select({ count: count() })
      .from(employees)
      .where(and(eq(employees.customerId, cid), eq(employees.status, "active")));

    // Active contractors count
    const [contractorCount] = await db
      .select({ count: count() })
      .from(contractors)
      .where(and(eq(contractors.customerId, cid), eq(contractors.status, "active")));

    // Active countries (distinct country codes of active employees)
    const activeCountries = await db
      .select({ countryCode: employees.country })
      .from(employees)
      .where(and(eq(employees.customerId, cid), eq(employees.status, "active")))
      .groupBy(employees.country);

    // Pending onboarding
    const [onboardingCount] = await db
      .select({ count: count() })
      .from(employees)
      .where(
        and(
          eq(employees.customerId, cid),
          inArray(employees.status, ["pending_review", "documents_incomplete", "onboarding"])
        )
      );

    // Pending adjustments (submitted, not yet locked)
    const [adjCount] = await db
      .select({ count: count() })
      .from(adjustments)
      .where(and(eq(adjustments.customerId, cid), eq(adjustments.status, "submitted")));

    // Pending leave requests (join through employees to scope by customerId)
    const [leaveCount] = await db
      .select({ count: count() })
      .from(leaveRecords)
      .innerJoin(employees, eq(leaveRecords.employeeId, employees.id))
      .where(and(eq(employees.customerId, cid), eq(leaveRecords.status, "submitted")));

    // Overdue invoices
    const [overdueCount] = await db
      .select({ count: count() })
      .from(invoices)
      .where(and(eq(invoices.customerId, cid), eq(invoices.status, "overdue")));

    // Unpaid invoices (sent but not paid)
    const [unpaidCount] = await db
      .select({ count: count() })
      .from(invoices)
      .where(and(eq(invoices.customerId, cid), eq(invoices.status, "sent")));

    // Pending reimbursements (submitted, awaiting client approval)
    const [reimbursementCount] = await db
      .select({ count: count() })
      .from(reimbursements)
      .where(and(eq(reimbursements.customerId, cid), eq(reimbursements.status, "submitted")));

    // Countries with leave policies that have NOT been confirmed by the client
    const unconfirmedPolicyCountries = await db
      .select({ countryCode: customerLeavePolicies.countryCode })
      .from(customerLeavePolicies)
      .where(and(
        eq(customerLeavePolicies.customerId, cid),
        eq(customerLeavePolicies.clientConfirmed, false)
      ))
      .groupBy(customerLeavePolicies.countryCode);

    return {
      activeEmployees: (empCount?.count ?? 0) + (contractorCount?.count ?? 0),
      activeEorEmployees: empCount?.count ?? 0,
      activeContractors: contractorCount?.count ?? 0,
      activeCountries: activeCountries.length,
      pendingOnboarding: onboardingCount?.count ?? 0,
      pendingAdjustments: adjCount?.count ?? 0,
      pendingLeave: leaveCount?.count ?? 0,
      overdueInvoices: overdueCount?.count ?? 0,
      unpaidInvoices: unpaidCount?.count ?? 0,
      pendingReimbursements: reimbursementCount?.count ?? 0,
      unconfiguredLeavePolicyCountries: unconfirmedPolicyCountries.length,
    };
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // HR METRICS — Onboarding pipeline, contract expiry, new hires
  // Available to: admin, hr_manager
  // ═══════════════════════════════════════════════════════════════════════════
  hrMetrics: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const cid = ctx.portalUser.customerId;
    const role = ctx.portalUser.portalRole;

    // Only admin and hr_manager can access HR metrics
    if (!["admin", "hr_manager"].includes(role)) {
      return null;
    }

    const todayStr = today();
    const thirtyDaysLater = daysFromNow(30);

    // New hires this month
    const thisMonth = todayStr.slice(0, 7); // "YYYY-MM"
    const newHires = await db
      .select({ count: count() })
      .from(employees)
      .where(
        and(
          eq(employees.customerId, cid),
          sql`${employees.startDate} LIKE ${thisMonth + '%'}`,
          inArray(employees.status, ["active", "onboarding", "contract_signed"])
        )
      );

    // Employee contracts expiring within 30 days
    const expiringEmpContracts = await db
      .select({
        id: employeeContracts.id,
        employeeId: employeeContracts.employeeId,
        expiryDate: employeeContracts.expiryDate,
        empFirstName: employees.firstName,
        empLastName: employees.lastName,
        country: employees.country,
      })
      .from(employeeContracts)
      .innerJoin(employees, eq(employeeContracts.employeeId, employees.id))
      .where(
        and(
          eq(employees.customerId, cid),
          eq(employeeContracts.status, "signed"),
          isNotNull(employeeContracts.expiryDate),
          gte(employeeContracts.expiryDate, todayStr),
          lt(employeeContracts.expiryDate, thirtyDaysLater)
        )
      )
      .limit(10);

    // Contractor contracts expiring within 30 days
    const expiringCtrContracts = await db
      .select({
        id: contractorContracts.id,
        contractorId: contractorContracts.contractorId,
        expiryDate: contractorContracts.expiryDate,
        ctrFirstName: contractors.firstName,
        ctrLastName: contractors.lastName,
        country: contractors.country,
      })
      .from(contractorContracts)
      .innerJoin(contractors, eq(contractorContracts.contractorId, contractors.id))
      .where(
        and(
          eq(contractors.customerId, cid),
          eq(contractorContracts.status, "signed"),
          isNotNull(contractorContracts.expiryDate),
          gte(contractorContracts.expiryDate, todayStr),
          lt(contractorContracts.expiryDate, thirtyDaysLater)
        )
      )
      .limit(10);

    // Upcoming public holidays (next 30 days) for countries where customer has employees
    const customerCountries = await db
      .select({ countryCode: employees.country })
      .from(employees)
      .where(and(eq(employees.customerId, cid), eq(employees.status, "active")))
      .groupBy(employees.country);

    const countryCodes = customerCountries.map(c => c.countryCode);

    let upcomingHolidays: Array<{
      holidayDate: string;
      holidayName: string;
      countryCode: string;
    }> = [];

    if (countryCodes.length > 0) {
      upcomingHolidays = await db
        .select({
          holidayDate: publicHolidays.holidayDate,
          holidayName: publicHolidays.holidayName,
          countryCode: publicHolidays.countryCode,
        })
        .from(publicHolidays)
        .where(
          and(
            inArray(publicHolidays.countryCode, countryCodes),
            gte(publicHolidays.holidayDate, todayStr),
            lt(publicHolidays.holidayDate, thirtyDaysLater)
          )
        )
        .orderBy(publicHolidays.holidayDate)
        .limit(10);
    }

    return {
      newHiresThisMonth: newHires[0]?.count ?? 0,
      expiringContracts: [
        ...expiringEmpContracts.map(c => ({
          id: c.id,
          type: "employee" as const,
          name: `${c.empFirstName} ${c.empLastName}`,
          country: c.country,
          expiryDate: c.expiryDate,
        })),
        ...expiringCtrContracts.map(c => ({
          id: c.id,
          type: "contractor" as const,
          name: `${c.ctrFirstName} ${c.ctrLastName}`,
          country: c.country,
          expiryDate: c.expiryDate,
        })),
      ],
      upcomingHolidays,
    };
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE METRICS — Invoice summary, wallet balances
  // Available to: admin, finance
  // ═══════════════════════════════════════════════════════════════════════════
  financeMetrics: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const cid = ctx.portalUser.customerId;
    const role = ctx.portalUser.portalRole;

    // Only admin and finance can access finance metrics
    if (!["admin", "finance"].includes(role)) {
      return null;
    }

    // Unpaid invoices with total amount
    const unpaidInvoices = await db
      .select({
        status: invoices.status,
        cnt: count(),
        totalAmount: sql<string>`COALESCE(SUM(CAST(${invoices.total} AS numeric)), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.customerId, cid),
          inArray(invoices.status, ["sent", "overdue", "partially_paid"])
        )
      )
      .groupBy(invoices.status);

    const invoiceSummary: Record<string, { count: number; amount: string }> = {};
    for (const row of unpaidInvoices) {
      invoiceSummary[row.status] = {
        count: row.cnt,
        amount: row.totalAmount ?? "0",
      };
    }

    // Overdue invoices detail (urgent list)
    const overdueInvoiceList = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        total: invoices.total,
        currency: invoices.currency,
        dueDate: invoices.dueDate,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.customerId, cid),
          eq(invoices.status, "overdue")
        )
      )
      .orderBy(invoices.dueDate)
      .limit(10);

    // Wallet balances
    const wallets = await db
      .select({
        id: customerWallets.id,
        currency: customerWallets.currency,
        balance: customerWallets.balance,
      })
      .from(customerWallets)
      .where(eq(customerWallets.customerId, cid));

    // Frozen wallet balances
    const frozenWallets = await db
      .select({
        currency: customerFrozenWallets.currency,
        balance: customerFrozenWallets.balance,
      })
      .from(customerFrozenWallets)
      .where(eq(customerFrozenWallets.customerId, cid));

    // Total outstanding (all unpaid invoices)
    const totalOutstanding = Object.values(invoiceSummary)
      .reduce((s, v) => s + parseFloat(v.amount || "0"), 0);
    const totalOutstandingCount = Object.values(invoiceSummary)
      .reduce((s, v) => s + v.count, 0);

    return {
      invoiceSummary,
      overdueInvoices: overdueInvoiceList,
      totalOutstanding: String(totalOutstanding),
      totalOutstandingCount,
      wallets: wallets.map(w => ({
        id: w.id,
        currency: w.currency,
        balance: w.balance,
      })),
      frozenWallets: frozenWallets.map(w => ({
        currency: w.currency,
        balance: w.balance,
      })),
    };
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TEAM PULSE — birthdays, new joiners, work anniversaries
  // Available to: admin, hr_manager
  // ═══════════════════════════════════════════════════════════════════════════
  teamPulse: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const role = ctx.portalUser.portalRole;

    // Only admin and hr_manager can see team pulse
    if (!["admin", "hr_manager"].includes(role)) {
      return [];
    }

    const todayStr = today();
    const todayMD = todayStr.slice(5); // "MM-DD"
    const thisMonth = todayStr.slice(0, 7); // "YYYY-MM"
    const sevenDaysLater = daysFromNow(7).slice(5); // "MM-DD"
    const currentYear = new Date().getFullYear();

    // Get all active employees for this customer
    const allActiveEmployees = await db
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        dateOfBirth: employees.dateOfBirth,
        startDate: employees.startDate,
        country: employees.country,
        status: employees.status,
      })
      .from(employees)
      .where(
        and(
          eq(employees.customerId, cid),
          inArray(employees.status, ["active", "onboarding", "contract_signed", "on_leave"])
        )
      );

    const events: Array<{
      type: "birthday" | "new_joiner" | "anniversary" | "onboarding";
      employeeId: number;
      employeeName: string;
      country: string;
      detail: string;
    }> = [];

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

    return events.slice(0, 20);
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYEE DISTRIBUTION BY COUNTRY — for the world map (all roles)
  // ═══════════════════════════════════════════════════════════════════════════
  employeesByCountry: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;

    const result = await db
      .select({
        countryCode: employees.country,
        countryName: countriesConfig.countryName,
        count: count(),
      })
      .from(employees)
      .leftJoin(countriesConfig, eq(employees.country, countriesConfig.countryCode))
      .where(and(eq(employees.customerId, cid), eq(employees.status, "active")))
      .groupBy(employees.country, countriesConfig.countryName);

    return result.map((r) => ({
      countryCode: r.countryCode,
      countryName: r.countryName || r.countryCode,
      employeeCount: r.count,
    }));
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // RECENT ACTIVITY — role-filtered feed
  // HR roles see employee/adjustment/leave; Finance sees invoice/reimbursement;
  // Admin sees everything; Viewer sees employee updates only.
  // ═══════════════════════════════════════════════════════════════════════════
  recentActivity: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;
    const role = ctx.portalUser.portalRole;

    const all: Array<{
      id: number;
      type: string;
      title: string;
      status: string;
      date: Date;
    }> = [];

    // Employee updates — visible to all roles
    const recentEmployees = await db
      .select({
        id: employees.id,
        type: sql<string>`'employee'`,
        title: sql<string>`(${employees.firstName} || ' ' || ${employees.lastName})`,
        status: employees.status,
        date: employees.updatedAt,
      })
      .from(employees)
      .where(eq(employees.customerId, cid))
      .orderBy(sql`${employees.updatedAt} DESC`)
      .limit(10);
    all.push(...recentEmployees);

    // HR-related activities (admin, hr_manager)
    if (["admin", "hr_manager"].includes(role)) {
      const recentAdj = await db
        .select({
          id: adjustments.id,
          type: sql<string>`'adjustment'`,
          title: adjustments.adjustmentType,
          status: adjustments.status,
          date: adjustments.updatedAt,
        })
        .from(adjustments)
        .where(eq(adjustments.customerId, cid))
        .orderBy(sql`${adjustments.updatedAt} DESC`)
        .limit(10);
      all.push(...recentAdj);

      const recentLeave = await db
        .select({
          id: leaveRecords.id,
          type: sql<string>`'leave'`,
          title: sql<string>`('Leave #' || ${leaveRecords.id})`,
          status: leaveRecords.status,
          date: leaveRecords.updatedAt,
        })
        .from(leaveRecords)
        .innerJoin(employees, eq(leaveRecords.employeeId, employees.id))
        .where(eq(employees.customerId, cid))
        .orderBy(sql`${leaveRecords.updatedAt} DESC`)
        .limit(10);
      all.push(...recentLeave);
    }

    // Finance-related activities (admin, finance)
    if (["admin", "finance"].includes(role)) {
      const recentInvoices = await db
        .select({
          id: invoices.id,
          type: sql<string>`'invoice'`,
          title: sql<string>`COALESCE(${invoices.invoiceNumber}, 'Invoice #' || ${invoices.id})`,
          status: invoices.status,
          date: invoices.updatedAt,
        })
        .from(invoices)
        .where(eq(invoices.customerId, cid))
        .orderBy(sql`${invoices.updatedAt} DESC`)
        .limit(10);
      all.push(...recentInvoices);

      const recentReimb = await db
        .select({
          id: reimbursements.id,
          type: sql<string>`'reimbursement'`,
          title: sql<string>`('Reimbursement #' || ${reimbursements.id})`,
          status: reimbursements.status,
          date: reimbursements.updatedAt,
        })
        .from(reimbursements)
        .where(eq(reimbursements.customerId, cid))
        .orderBy(sql`${reimbursements.updatedAt} DESC`)
        .limit(10);
      all.push(...recentReimb);
    }

    // Sort by date descending and limit
    return all
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYROLL TREND — last 12 months (all roles except viewer)
  // ═══════════════════════════════════════════════════════════════════════════
  payrollTrend: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;

    const result = await db
      .select({
        month: payrollRuns.payrollMonth,
        totalGross: sql<string>`COALESCE(SUM(CAST(${payrollItems.gross} AS numeric)), 0)`,
        totalNet: sql<string>`COALESCE(SUM(CAST(${payrollItems.net} AS numeric)), 0)`,
        totalEmployerCost: sql<string>`COALESCE(SUM(CAST(${payrollItems.totalEmploymentCost} AS numeric)), 0)`,
        currency: payrollRuns.currency,
      })
      .from(payrollItems)
      .innerJoin(payrollRuns, eq(payrollItems.payrollRunId, payrollRuns.id))
      .innerJoin(employees, eq(payrollItems.employeeId, employees.id))
      .where(
        and(
          eq(employees.customerId, cid),
          sql`${payrollRuns.status} IN ('approved', 'locked', 'paid')`,
          sql`${payrollRuns.payrollMonth} >= TO_CHAR(CURRENT_DATE - INTERVAL '12 months', 'YYYY-MM')`
        )
      )
      .groupBy(payrollRuns.payrollMonth, payrollRuns.currency)
      .orderBy(payrollRuns.payrollMonth);

    return result.map((r) => ({
      month: r.month,
      totalGross: Number(r.totalGross),
      totalNet: Number(r.totalNet),
      totalEmployerCost: Number(r.totalEmployerCost),
      currency: r.currency,
    }));
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYEE STATUS DISTRIBUTION — for pie/donut chart (all roles)
  // ═══════════════════════════════════════════════════════════════════════════
  employeeStatusDistribution: protectedPortalProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cid = ctx.portalUser.customerId;

    const result = await db
      .select({
        status: employees.status,
        count: count(),
      })
      .from(employees)
      .where(eq(employees.customerId, cid))
      .groupBy(employees.status);

    return result.map((r) => ({
      status: r.status,
      count: r.count,
    }));
  }),
});
