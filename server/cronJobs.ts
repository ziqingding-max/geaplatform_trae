/**
 * Cron Jobs Module
 * 
 * 1. Daily 00:01 (Beijing time): Auto-transition contract_signed → active employees
 *    - When startDate <= today, auto-activate
 *    - If activation date <= 15th of month, auto-add to current month payroll (pro-rata)
 *    - If activation date > 15th, skip current month
 * 
 * 2. Monthly 5th 00:00 (Beijing time): Auto-lock previous month's submitted adjustments/leave
 *    - Cutoff is 4th 23:59 Beijing time
 *    - All submitted adjustments → locked
 *    - All submitted leave_records → locked
 * 
 * 3. Monthly 5th 00:01 (Beijing time): Auto-create next month draft payroll runs
 *    - For all countries with active employees
 *    - Auto-fill with eligible employees and pro-rata calculation
 *    - Aggregate LOCKED adjustments/leave into payroll items
 */

import cron from "node-cron";
import { fetchAndStoreExchangeRates } from "./services/exchangeRateFetchService";
import {
  getContractSignedEmployeesReadyForActivation,
  updateEmployee,
  getCountriesWithActiveEmployees,
  getEmployeesForPayrollMonth,
  findPayrollRunByCountryMonth,
  createPayrollRun,
  createPayrollItem,
  getSystemConfig,
  logAuditAction,
  lockSubmittedAdjustments,
  lockSubmittedLeaveRecords,
  lockSubmittedReimbursements,
  getSubmittedAdjustmentsForPayroll,
  getSubmittedUnpaidLeaveForPayroll,
  updatePayrollRun,
  getAllActiveLeaveRecordsForDate,
  getOnLeaveEmployeesWithExpiredLeave,
  initializeLeaveBalancesForEmployee,
  listEmployees,
  listLeaveBalances,
  updateLeaveBalance,
  getCustomerLeavePoliciesForCountry,
} from "./db";
import { notificationService } from "./services/notificationService";
import { ContractorInvoiceGenerationService } from "./services/contractorInvoiceGenerationService";
import { countriesConfig } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ============================================================================
// UTILITY: Working days calculation for pro-rata
// ============================================================================

function getWorkingDaysInMonth(year: number, month: number, workingDaysPerWeek: number = 5): number {
  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-indexed here
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month - 1, d).getDay(); // 0=Sun, 6=Sat
    if (workingDaysPerWeek >= 6) {
      // 6-day work week: Mon-Sat
      if (dayOfWeek !== 0) workingDays++;
    } else {
      // 5-day work week: Mon-Fri
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }
  }
  return workingDays;
}

function getWorkingDaysFromDate(year: number, month: number, startDay: number, workingDaysPerWeek: number = 5): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let d = startDay; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    if (workingDaysPerWeek >= 6) {
      if (dayOfWeek !== 0) workingDays++;
    } else {
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }
  }
  return workingDays;
}

/**
 * Calculate pro-rata salary for an employee starting mid-month.
 * Returns the fraction of the full monthly salary.
 */
export function calculateProRata(
  baseSalary: number,
  startDate: Date,
  payrollYear: number,
  payrollMonth: number,
  workingDaysPerWeek: number = 5,
): { proRataAmount: number; totalWorkingDays: number; workedDays: number } {
  const totalWorkingDays = getWorkingDaysInMonth(payrollYear, payrollMonth, workingDaysPerWeek);
  
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1; // 1-indexed
  const startDay = startDate.getDate();
  
  // If employee started before this month, they get full salary
  if (startYear < payrollYear || (startYear === payrollYear && startMonth < payrollMonth)) {
    return { proRataAmount: baseSalary, totalWorkingDays, workedDays: totalWorkingDays };
  }
  
  // If employee starts in this month, calculate pro-rata
  if (startYear === payrollYear && startMonth === payrollMonth) {
    const workedDays = getWorkingDaysFromDate(payrollYear, payrollMonth, startDay, workingDaysPerWeek);
    const proRataAmount = totalWorkingDays > 0 ? (baseSalary * workedDays) / totalWorkingDays : 0;
    return { proRataAmount: Math.round(proRataAmount * 100) / 100, totalWorkingDays, workedDays };
  }
  
  // Employee starts after this month - shouldn't be in payroll
  return { proRataAmount: 0, totalWorkingDays, workedDays: 0 };
}

// ============================================================================
// CRON JOB 1: Daily employee status auto-transition
// ============================================================================

export async function runEmployeeAutoActivation(): Promise<{ activated: number; addedToPayroll: number }> {
  const today = new Date();
  // Format as YYYY-MM-DD in Beijing time
  const beijingOffset = 8 * 60; // UTC+8
  const beijingDate = new Date(today.getTime() + (beijingOffset - today.getTimezoneOffset()) * 60000);
  const todayStr = beijingDate.toISOString().split("T")[0];
  const dayOfMonth = beijingDate.getDate();
  const currentYear = beijingDate.getFullYear();
  const currentMonth = beijingDate.getMonth() + 1; // 1-indexed

  console.log(`[CronJob] Employee auto-activation check for ${todayStr}`);

  // Get mid-month cutoff from system config (default 15)
  const midMonthCutoff = parseInt(await getSystemConfig("mid_month_cutoff_day") ?? "15", 10);

  // Find employees ready for activation
  const readyEmployees = await getContractSignedEmployeesReadyForActivation(todayStr);
  
  let activated = 0;
  let addedToPayroll = 0;

  for (const emp of readyEmployees) {
    // Transition to active
    await updateEmployee(emp.id, { status: "active" });
    activated++;

    console.log(`[CronJob] Activated employee ${emp.employeeCode} (${emp.firstName} ${emp.lastName})`);

    // Auto-initialize leave balances for newly activated employee
    try {
      await initializeLeaveBalancesForEmployee(emp.id);
      console.log(`[CronJob] Initialized leave balances for ${emp.employeeCode}`);
    } catch (err) {
      console.error(`[CronJob] Failed to initialize leave balances for ${emp.employeeCode}:`, err);
    }

    // Create audit log
    await logAuditAction({
      userName: "System",
      action: "employee_auto_activated",
      entityType: "employee",
      entityId: emp.id,
      changes: { detail: `Auto-activated: contract_signed → active (startDate: ${emp.startDate})` },

    });

    // Check if we should add to current month payroll
    if (dayOfMonth <= midMonthCutoff) {
      // Try to find current month's payroll run for this country
      const monthStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
      const existingRun = await findPayrollRunByCountryMonth(emp.country, monthStr);

      if (existingRun && existingRun.status === "draft") {
        // Calculate pro-rata
        const startDate = new Date(emp.startDate as any);
        const baseSalary = parseFloat(emp.baseSalary?.toString() ?? "0");
        const { proRataAmount, totalWorkingDays, workedDays } = calculateProRata(
          baseSalary, startDate, currentYear, currentMonth
        );

        // Add employee to payroll run
        const salaryStr = String(proRataAmount);
        await createPayrollItem({
          payrollRunId: existingRun.id,
          employeeId: emp.id,
          baseSalary: salaryStr,
          gross: salaryStr,
          net: salaryStr,
          totalEmploymentCost: salaryStr,
          currency: emp.salaryCurrency ?? existingRun.currency,
          notes: workedDays < totalWorkingDays
            ? `Pro-rata: ${workedDays}/${totalWorkingDays} working days (started ${emp.startDate})`
            : undefined,
        });

        addedToPayroll++;
        console.log(`[CronJob] Added ${emp.employeeCode} to payroll run #${existingRun.id} (pro-rata: ${proRataAmount})`);

        await logAuditAction({
          userName: "System",
          action: "employee_auto_added_to_payroll",
          entityType: "payroll_run",
          entityId: existingRun.id,
          changes: { detail: `Auto-added employee ${emp.employeeCode} to payroll (pro-rata: ${proRataAmount}, ${workedDays}/${totalWorkingDays} days)` },
    
        });
      }
    } else {
      console.log(`[CronJob] ${emp.employeeCode} activated after ${midMonthCutoff}th, will be in next month's payroll`);
    }
  }

  console.log(`[CronJob] Employee activation complete: ${activated} activated, ${addedToPayroll} added to payroll`);
  return { activated, addedToPayroll };
}

// ============================================================================
// CRON JOB 2: Monthly auto-lock submitted adjustments/leave (5th 00:00 Beijing)
// ============================================================================

/**
 * Auto-lock all submitted adjustments and leave records for the previous month.
 * Runs on the 5th at 00:00 Beijing time (cutoff was 4th 23:59).
 */
export async function runAutoLock(): Promise<{ adjustmentsLocked: number; leaveLocked: number; reimbursementsLocked: number }> {
  const today = new Date();
  const beijingOffset = 8 * 60;
  const beijingDate = new Date(today.getTime() + (beijingOffset - today.getTimezoneOffset()) * 60000);
  const currentYear = beijingDate.getFullYear();
  const currentMonth = beijingDate.getMonth() + 1;

  // Calculate previous month
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear--;
  }

  const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
  const prevMonthDate = `${prevMonthStr}-01`;

  console.log(`[CronJob] Auto-locking submitted data for ${prevMonthStr}`);

  // Lock adjustments (effectiveMonth = YYYY-MM-01)
  const adjLocked = await lockSubmittedAdjustments(prevMonthDate);
  console.log(`[CronJob] Locked ${adjLocked} adjustments for ${prevMonthStr}`);

  // Lock leave records (startDate within the month)
  const leaveLocked = await lockSubmittedLeaveRecords(prevMonthStr);
  console.log(`[CronJob] Locked ${leaveLocked} leave records for ${prevMonthStr}`);

  // Lock reimbursements (effectiveMonth = YYYY-MM-01)
  const reimbLocked = await lockSubmittedReimbursements(prevMonthDate);
  console.log(`[CronJob] Locked ${reimbLocked} reimbursements for ${prevMonthStr}`);

  await logAuditAction({
    userName: "System",
    action: "auto_lock_monthly",
    entityType: "system",
    entityId: 0,
    changes: { detail: `Auto-locked ${adjLocked} adjustments, ${leaveLocked} leave records, and ${reimbLocked} reimbursements for ${prevMonthStr}` },
  });

  return { adjustmentsLocked: adjLocked, leaveLocked, reimbursementsLocked: reimbLocked };
}

// ============================================================================
// CRON JOB 3: Monthly auto-create next month draft payroll runs (5th 00:01 Beijing)
// ============================================================================

export async function runAutoCreatePayrollRuns(): Promise<{ created: number; employeesFilled: number }> {
  const today = new Date();
  const beijingOffset = 8 * 60;
  const beijingDate = new Date(today.getTime() + (beijingOffset - today.getTimezoneOffset()) * 60000);
  const currentYear = beijingDate.getFullYear();
  const currentMonth = beijingDate.getMonth() + 1;

  // Create payroll run for CURRENT month (not next month)
  // e.g. On Feb 5th, create Feb payroll run and lock Jan's adjustments/leave
  const targetMonth = currentMonth;
  const targetYear = currentYear;

  const targetMonthStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
  const targetMonthEnd = new Date(targetYear, targetMonth, 0); // last day of target month
  const targetMonthEndStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetMonthEnd.getDate()).padStart(2, "0")}`;

  console.log(`[CronJob] Auto-creating payroll runs for ${targetMonthStr}`);

  // Get countries with active employees
  const countryCodes = await getCountriesWithActiveEmployees();
  console.log(`[CronJob] Found ${countryCodes.length} countries with active employees`);

  // We need country config for currency and working days
  const { getDb } = await import("./db");
  const db = await getDb();
  if (!db) {
    console.error("[CronJob] Database not available");
    return { created: 0, employeesFilled: 0 };
  }

  let created = 0;
  let employeesFilled = 0;

  // Calculate previous month for aggregating locked adjustments/leave
  // On the 5th, the previous month's cutoff has just passed (4th 23:59),
  // so we aggregate the previous month's locked data into this month's payroll
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear--;
  }
  const prevMonthPayroll = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;

  for (const countryCode of countryCodes) {
    // Check if payroll run already exists for this country+month
    const existing = await findPayrollRunByCountryMonth(countryCode, targetMonthStr);
    if (existing) {
      console.log(`[CronJob] Payroll run already exists for ${countryCode} ${targetMonthStr}, skipping`);
      continue;
    }

    // Get country config for currency
    const [config] = await db.select().from(countriesConfig).where(eq(countriesConfig.countryCode, countryCode)).limit(1);
    if (!config) {
      console.log(`[CronJob] No country config for ${countryCode}, skipping`);
      continue;
    }

    // Create draft payroll run for current month
    const result = await createPayrollRun({
      countryCode,
      payrollMonth: targetMonthStr as any,
      currency: config.localCurrency,
      status: "draft",
      notes: `Auto-created on ${beijingDate.toISOString().split("T")[0]}`,
    });

    const runId = (result as any)[0]?.insertId;
    if (!runId) {
      console.error(`[CronJob] Failed to create payroll run for ${countryCode}`);
      continue;
    }

    created++;
    console.log(`[CronJob] Created payroll run #${runId} for ${countryCode} ${targetMonthStr}`);

    notificationService.send({
      type: "payroll_draft_created",
      data: {
        payrollRunId: runId,
        countryCode: countryCode,
        period: targetMonthStr
      }
    }).catch(err => console.error("Failed to send payroll notification:", err));

    // Get eligible employees for current month
    const eligibleEmployees = await getEmployeesForPayrollMonth(countryCode, targetMonthStr, targetMonthEndStr);

    // Get locked adjustments and unpaid leave for the CURRENT month (which was just locked)
    // Note: auto-fill for next month's payroll uses current month's locked data
    // because adjustments/leave are submitted for the month they apply to
    const lockedAdjustments = await getSubmittedAdjustmentsForPayroll(countryCode, prevMonthPayroll, ["locked"]);
    const lockedUnpaidLeave = await getSubmittedUnpaidLeaveForPayroll(countryCode, `${prevYear}-${String(prevMonth).padStart(2, "0")}`, ["locked"]);

    // Build adjustment aggregation maps
    const adjByEmployee = new Map<number, { bonus: number; allowances: number; reimbursements: number; otherDeductions: number }>();
    for (const adj of lockedAdjustments) {
      const empId = adj.employeeId;
      if (!adjByEmployee.has(empId)) {
        adjByEmployee.set(empId, { bonus: 0, allowances: 0, reimbursements: 0, otherDeductions: 0 });
      }
      const agg = adjByEmployee.get(empId)!;
      const amount = parseFloat(String(adj.amount ?? 0));
      switch (adj.adjustmentType) {
        case "bonus": agg.bonus += amount; break;
        case "allowance": agg.allowances += amount; break;
        case "reimbursement": agg.reimbursements += amount; break;
        case "deduction": agg.otherDeductions += amount; break;
        case "other": agg.otherDeductions += amount; break;
      }
    }

    // Build unpaid leave aggregation map (days only, deduction calculated per employee)
    const leaveByEmployee = new Map<number, { days: number }>();
    for (const leave of lockedUnpaidLeave) {
      const empId = leave.employeeId;
      if (!leaveByEmployee.has(empId)) {
        leaveByEmployee.set(empId, { days: 0 });
      }
      const agg = leaveByEmployee.get(empId)!;
      agg.days += parseFloat(String(leave.days ?? 0));
    }

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalEmployerCost = 0;

    for (const emp of eligibleEmployees) {
      const baseSalary = parseFloat(emp.baseSalary?.toString() ?? "0");
      const startDate = new Date(emp.startDate as any);
      const workingDaysPerWeek = config.workingDaysPerWeek ?? 5;

      const { proRataAmount, totalWorkingDays, workedDays } = calculateProRata(
        baseSalary, startDate, targetYear, targetMonth, workingDaysPerWeek
      );

      // Get aggregated adjustments and leave for this employee
      const adjAgg = adjByEmployee.get(emp.id) ?? { bonus: 0, allowances: 0, reimbursements: 0, otherDeductions: 0 };
      const leaveAgg = leaveByEmployee.get(emp.id) ?? { days: 0 };

      // Calculate unpaid leave deduction: baseSalary / monthlyWorkingDays × days
      const monthlyWorkingDays = workingDaysPerWeek * 4.33;
      const unpaidLeaveDeduction = monthlyWorkingDays > 0 && leaveAgg.days > 0
        ? Math.round((baseSalary / monthlyWorkingDays) * leaveAgg.days * 100) / 100
        : 0;

      const gross = proRataAmount + adjAgg.bonus + adjAgg.allowances + adjAgg.reimbursements;
      const deductions = adjAgg.otherDeductions + unpaidLeaveDeduction;
      const net = gross - deductions;

      await createPayrollItem({
        payrollRunId: runId,
        employeeId: emp.id,
        baseSalary: String(proRataAmount),
        bonus: String(adjAgg.bonus),
        allowances: String(adjAgg.allowances),
        reimbursements: String(adjAgg.reimbursements),
        deductions: String(adjAgg.otherDeductions),
        unpaidLeaveDays: String(leaveAgg.days),
        unpaidLeaveDeduction: String(unpaidLeaveDeduction),
        gross: String(gross),
        net: String(net),
        totalEmploymentCost: String(net),
        currency: emp.salaryCurrency ?? config.localCurrency,
        notes: workedDays < totalWorkingDays
          ? `Pro-rata: ${workedDays}/${totalWorkingDays} working days (started ${emp.startDate})`
          : undefined,
      });

      totalGross += gross;
      totalDeductions += deductions;
      totalNet += net;
      totalEmployerCost += net;
      employeesFilled++;
    }

    // Update payroll run totals
    await updatePayrollRun(runId, {
      totalGross: String(totalGross),
      totalDeductions: String(totalDeductions),
      totalNet: String(totalNet),
      totalEmployerCost: String(totalEmployerCost),
    });

    console.log(`[CronJob] Filled ${eligibleEmployees.length} employees for ${countryCode} (gross: ${totalGross})`);

    await logAuditAction({
      userName: "System",
      action: "payroll_run_auto_created",
      entityType: "payroll_run",
      entityId: runId,
      changes: { detail: `Auto-created draft payroll for ${countryCode} ${targetMonthStr} with ${eligibleEmployees.length} employees, aggregated locked adjustments/leave` },

    });
  }

  console.log(`[CronJob] Payroll auto-creation complete: ${created} runs created, ${employeesFilled} employees filled`);
  return { created, employeesFilled };
}

// ============================================================================
// CRON JOB 4: Daily on-leave status auto-transition
// ============================================================================

/**
 * Auto-transition employee status based on leave records:
 * - active → on_leave: when a submitted/locked leave record's startDate <= today
 * - on_leave → active: when all leave records have ended (endDate < today)
 */
export async function runLeaveStatusTransition(): Promise<{ toOnLeave: number; toActive: number }> {
  const today = new Date();
  const beijingOffset = 8 * 60;
  const beijingDate = new Date(today.getTime() + (beijingOffset - today.getTimezoneOffset()) * 60000);
  const todayStr = beijingDate.toISOString().split("T")[0];

  console.log(`[CronJob] Leave status transition check for ${todayStr}`);

  let toOnLeave = 0;
  let toActive = 0;

  // 1. Find active employees who have leave records starting today or earlier
  const activeLeaves = await getAllActiveLeaveRecordsForDate(todayStr);
  
  // Group by employee to avoid duplicate transitions
  const employeesWithActiveLeave = new Set<number>();
  for (const leave of activeLeaves) {
    employeesWithActiveLeave.add(leave.employeeId);
  }

  // For each employee with active leave, check if they're currently 'active' and transition to 'on_leave'
  const { getDb } = await import("./db");
  const db = await getDb();
  if (!db) {
    console.error("[CronJob] Database not available for leave transition");
    return { toOnLeave: 0, toActive: 0 };
  }

  const { employees } = await import("../drizzle/schema");

  for (const empId of Array.from(employeesWithActiveLeave)) {
    const [emp] = await db.select({ id: employees.id, status: employees.status, employeeCode: employees.employeeCode })
      .from(employees)
      .where(eq(employees.id, empId))
      .limit(1);
    
    if (emp && emp.status === "active") {
      await updateEmployee(empId, { status: "on_leave" });
      toOnLeave++;
      console.log(`[CronJob] Employee ${emp.employeeCode || empId} transitioned to on_leave`);
      await logAuditAction({
        userName: "System",
        action: "employee_auto_on_leave",
        entityType: "employee",
        entityId: empId,
        changes: { detail: `Auto-transitioned active → on_leave (leave record covers ${todayStr})` },
  
      });
    }
  }

  // 2. Find on_leave employees whose leave records have all ended
  const expiredLeaveEmps = await getOnLeaveEmployeesWithExpiredLeave(todayStr);
  for (const emp of expiredLeaveEmps) {
    await updateEmployee(emp.id, { status: "active" });
    toActive++;
    console.log(`[CronJob] Employee ${emp.employeeCode || emp.id} returned to active (leave ended)`);
    await logAuditAction({
      userName: "System",
      action: "employee_auto_return_from_leave",
      entityType: "employee",
      entityId: emp.id,
      changes: { detail: `Auto-transitioned on_leave → active (all leave records ended before ${todayStr})` },

    });
  }

  console.log(`[CronJob] Leave transition complete: ${toOnLeave} to on_leave, ${toActive} returned to active`);
  return { toOnLeave, toActive };
}

// ============================================================================
// CRON JOB 5: Daily overdue invoice auto-detection
// ============================================================================

/**
 * Auto-transition sent invoices to overdue when dueDate has passed.
 * Only affects invoices with status 'sent' and dueDate < today.
 */
export async function runOverdueInvoiceDetection(): Promise<{ overdueCount: number }> {
  const { getDb } = await import("./db");
  const db = await getDb();
  if (!db) {
    console.error("[CronJob] Database not available for overdue detection");
    return { overdueCount: 0 };
  }

  const { invoices } = await import("../drizzle/schema");
  const { eq, and, lt, isNotNull } = await import("drizzle-orm");

   const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  // Find all sent invoices with dueDate < today
  const overdueInvoices = await db
    .select({ id: invoices.id, invoiceNumber: invoices.invoiceNumber, dueDate: invoices.dueDate, customerId: invoices.customerId })
    .from(invoices)
    .where(
      and(
        eq(invoices.status, "sent" as any),
        isNotNull(invoices.dueDate),
        lt(invoices.dueDate, todayStr)
      )
    );

  let overdueCount = 0;
  for (const inv of overdueInvoices) {
    await db.update(invoices).set({ status: "overdue" }).where(eq(invoices.id, inv.id));
    overdueCount++;
    console.log(`[CronJob] Invoice ${inv.invoiceNumber || inv.id} marked as overdue (due: ${inv.dueDate})`);
    
    notificationService.send({
      type: "invoice_overdue",
      customerId: inv.customerId,
      data: {
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"
      }
    }).catch(err => console.error("Failed to send overdue notification:", err));

    await logAuditAction({
      userName: "System",
      action: "invoice_auto_overdue",
      entityType: "invoice",
      entityId: inv.id,
      changes: { detail: `Auto-transitioned sent → overdue (dueDate: ${inv.dueDate})` },

    });
  }

  if (overdueCount > 0) {
    // Notify owner about overdue invoices
    const { notifyOwner } = await import("./_core/notification");
    notifyOwner({
      title: `${overdueCount} Invoice(s) Now Overdue`,
      content: `${overdueCount} invoice(s) have been automatically marked as overdue because their due date has passed.\n\nPlease review and follow up with the respective clients.`,
    }).catch((err) => console.warn("[Notification] Failed to notify about overdue invoices:", err));
  }

  console.log(`[CronJob] Overdue detection complete: ${overdueCount} invoices marked overdue`);
  return { overdueCount };
}

// ============================================================================
// SCHEDULE CRON JOBS
// ============================================================================

// ============================================================================
// CRON JOB: Monthly leave accrual for new employees (1st 00:10 Beijing)
// ============================================================================

/**
 * For employees who joined in the current year, calculate pro-rata leave accrual.
 * Rule: Each full month of service earns 1/12 of annual entitlement.
 * Rounding: values not reaching 0.5 day are rounded up to 0.5 day.
 * Since totalEntitlement is stored as INT, we use the nearest 0.5-day logic
 * and round to the nearest integer for storage.
 */
export async function runMonthlyLeaveAccrual(): Promise<{ processed: number; updated: number; errors: number }> {
  const now = new Date();
  const beijingOffset = 8 * 60;
  const beijingDate = new Date(now.getTime() + (beijingOffset - now.getTimezoneOffset()) * 60000);
  const currentYear = beijingDate.getFullYear();
  const currentMonth = beijingDate.getMonth() + 1; // 1-indexed

  console.log(`[CronJob] Running monthly leave accrual for ${currentYear}-${String(currentMonth).padStart(2, "0")}`);

  // Get all active employees
  const { data: activeEmployees } = await listEmployees({ status: "active", pageSize: 10000 });

  // Filter to employees who started in the current year
  const newEmployees = activeEmployees.filter(emp => {
    if (!emp.startDate) return false;
    const startDate = new Date(emp.startDate as any);
    return startDate.getFullYear() === currentYear;
  });

  console.log(`[CronJob] Found ${newEmployees.length} employees who started in ${currentYear}`);

  let processed = 0;
  let updated = 0;
  let errors = 0;

  for (const emp of newEmployees) {
    try {
      processed++;
      const startDate = new Date(emp.startDate as any);
      const startMonth = startDate.getMonth() + 1; // 1-indexed
      const startDay = startDate.getDate();

      // Calculate full months served
      // If started on the 1st, count that month; otherwise start from next month
      let fullMonthsServed: number;
      if (startDay === 1) {
        fullMonthsServed = currentMonth - startMonth + 1;
      } else {
        // Started mid-month, first full month is the next one
        fullMonthsServed = currentMonth - startMonth;
      }

      if (fullMonthsServed <= 0) {
        // Not yet completed a full month
        continue;
      }

      // Get customer leave policies for this employee's country
      const policies = await getCustomerLeavePoliciesForCountry(emp.customerId, emp.country);

      // Get current leave balances
      const balances = await listLeaveBalances(emp.id, currentYear);

      for (const balance of balances) {
        // Find the matching policy for this leave type
        const policy = policies.find((p: any) => p.leaveTypeId === balance.leaveTypeId);
        const annualEntitlement = policy ? policy.annualEntitlement : balance.totalEntitlement;

        if (!annualEntitlement || annualEntitlement <= 0) continue;

        // Calculate accrued entitlement: (annual / 12) * months served
        const rawAccrued = (annualEntitlement / 12) * fullMonthsServed;

        // Round up to nearest 0.5 day: Math.ceil(value * 2) / 2
        const accruedHalfDay = Math.ceil(rawAccrued * 2) / 2;

        // Since DB stores INT, round to nearest integer
        const finalAccrued = Math.round(accruedHalfDay);

        // Only update if the accrued amount is different from current entitlement
        // and is less than the full annual entitlement
        if (finalAccrued !== balance.totalEntitlement && finalAccrued < annualEntitlement) {
          const newRemaining = finalAccrued - balance.used;
          await updateLeaveBalance(balance.id, {
            totalEntitlement: finalAccrued,
            remaining: Math.max(0, newRemaining),
          });
          updated++;
          console.log(`[CronJob] Updated leave balance for ${emp.firstName} ${emp.lastName} (${emp.employeeCode}): ` +
            `leaveTypeId=${balance.leaveTypeId}, months=${fullMonthsServed}, accrued=${finalAccrued}/${annualEntitlement}`);
        }
      }
    } catch (err) {
      errors++;
      console.error(`[CronJob] Failed to process leave accrual for employee ${emp.id}:`, err);
    }
  }

  console.log(`[CronJob] Monthly leave accrual complete: ${processed} processed, ${updated} updated, ${errors} errors`);

  await logAuditAction({
    userName: "System",
    action: "monthly_leave_accrual",
    entityType: "system",
    entityId: 0,
    changes: { detail: `Monthly leave accrual: ${processed} processed, ${updated} updated, ${errors} errors` },
  });

  return { processed, updated, errors };
}

// ============================================================================
// CRON JOB: Daily Contractor Invoice Generation (01:00 Beijing)
// ============================================================================
export async function runContractorInvoiceGeneration() {
  console.log("[CronJob] Running contractor invoice generation...");
  const result = await ContractorInvoiceGenerationService.processAll();
  console.log(`[CronJob] Contractor invoices: ${result.generated} generated. Errors: ${result.errors.length}`);
  if (result.errors.length > 0) {
    console.error("[CronJob] Contractor invoice errors:", result.errors);
  }
  return result;
}

export function scheduleCronJobs() {
  // Daily at 00:01 Beijing time — employee auto-activation
  cron.schedule("0 1 0 * * *", async () => {
    console.log("[CronJob] Running daily employee auto-activation (Beijing 00:01)...");
    try {
      await runEmployeeAutoActivation();
    } catch (err) {
      console.error("[CronJob] Employee auto-activation failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });

  // Monthly 5th at 00:00 Beijing time — auto-lock previous month's submitted data
  cron.schedule("0 0 0 5 * *", async () => {
    console.log("[CronJob] Running monthly auto-lock (Beijing 00:00 on 5th)...");
    try {
      await runAutoLock();
    } catch (err) {
      console.error("[CronJob] Auto-lock failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });

  // Monthly 5th at 00:01 Beijing time — auto-create payroll runs with locked data
  cron.schedule("0 1 0 5 * *", async () => {
    console.log("[CronJob] Running monthly payroll auto-creation (Beijing 00:01 on 5th)...");
    try {
      await runAutoCreatePayrollRuns();
    } catch (err) {
      console.error("[CronJob] Payroll auto-creation failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });

  // Daily at 00:02 Beijing time — leave status auto-transition
  cron.schedule("0 2 0 * * *", async () => {
    console.log("[CronJob] Running daily leave status transition (Beijing 00:02)...");
    try {
      await runLeaveStatusTransition();
    } catch (err) {
      console.error("[CronJob] Leave status transition failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });

  // Daily at 00:03 Beijing time — overdue invoice auto-detection
  cron.schedule("0 3 0 * * *", async () => {
    console.log("[CronJob] Running daily overdue invoice detection (Beijing 00:03)...");
    try {
      await runOverdueInvoiceDetection();
    } catch (err) {
      console.error("[CronJob] Overdue invoice detection failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });

  // Daily at 00:05 Beijing time (17:05 CET previous day, after ECB publishes at 16:00 CET)
  // ECB rates are published around 16:00 CET, so 00:05 Beijing = 17:05 CET gives buffer
  cron.schedule("0 5 0 * * *", async () => {
    console.log("[CronJob] Running daily exchange rate fetch (Beijing 00:05)...");
    try {
      const result = await fetchAndStoreExchangeRates();
      console.log(`[CronJob] Exchange rates: ${result.ratesStored} stored, date: ${result.date}`);
      if (result.errors.length > 0) {
        console.warn("[CronJob] Exchange rate fetch warnings:", result.errors);
      }
    } catch (err) {
      console.error("[CronJob] Exchange rate fetch failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });

  // Monthly 1st at 00:10 Beijing time — leave accrual for new employees
  cron.schedule("0 10 0 1 * *", async () => {
    console.log("[CronJob] Running monthly leave accrual (Beijing 00:10 on 1st)...");
    try {
      await runMonthlyLeaveAccrual();
    } catch (err) {
      console.error("[CronJob] Monthly leave accrual failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });

  // Daily at 01:00 Beijing time — Contractor Invoice Generation
  cron.schedule("0 0 1 * * *", async () => {
    console.log("[CronJob] Running daily contractor invoice generation (Beijing 01:00)...");
    try {
      await runContractorInvoiceGeneration();
    } catch (err) {
      console.error("[CronJob] Contractor invoice generation failed:", err);
    }
  }, { timezone: "Asia/Shanghai" });

  console.log("[CronJob] Scheduled: Employee auto-activation (daily 00:01 Beijing)");
  console.log("[CronJob] Scheduled: Leave status transition (daily 00:02 Beijing)");
  console.log("[CronJob] Scheduled: Overdue invoice detection (daily 00:03 Beijing)");
  console.log("[CronJob] Scheduled: Exchange rate auto-fetch (daily 00:05 Beijing)");
  console.log("[CronJob] Scheduled: Contractor invoice generation (daily 01:00 Beijing)");
  console.log("[CronJob] Scheduled: Auto-lock adjustments/leave (monthly 5th 00:00 Beijing)");
  console.log("[CronJob] Scheduled: Payroll auto-creation (monthly 5th 00:01 Beijing)");
  console.log("[CronJob] Scheduled: Monthly leave accrual (monthly 1st 00:10 Beijing)");
}
