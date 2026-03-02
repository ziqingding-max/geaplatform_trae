import { z } from "zod";
import { router } from "../_core/trpc";
import { adminProcedure, userProcedure } from "../procedures";
import { listSystemConfigs, getSystemConfig, setSystemConfig } from "../db";
import { runEmployeeAutoActivation, runAutoCreatePayrollRuns } from "../cronJobs";
import {
  getCurrentPayrollPeriod,
  getPayrollPeriodInfo,
  checkCutoffPassed,
  splitLeaveByMonth,
  isLeavesCrossMonth,
} from "../utils/cutoff";

/**
 * System Settings Router
 * Manages global configuration (payroll cutoff, auto-create settings, etc.)
 * and provides manual triggers for cron jobs (for testing/admin use).
 */
export const systemSettingsRouter = router({
  // List all system configs (any authenticated user can view)
  list: userProcedure.query(async () => {
    return await listSystemConfigs();
  }),

  // Get a single config value
  get: userProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const value = await getSystemConfig(input.key);
      return { key: input.key, value };
    }),

  // Update a system config (admin only)
  update: adminProcedure
    .input(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await setSystemConfig(input.key, input.value, input.description);
      return { success: true };
    }),

  // Bulk update multiple configs at once
  bulkUpdate: adminProcedure
    .input(z.object({
      configs: z.array(z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      for (const cfg of input.configs) {
        await setSystemConfig(cfg.key, cfg.value, cfg.description);
      }
      return { success: true, updated: input.configs.length };
    }),

  // ── Payroll Period Endpoints ──

  /**
   * Get the current active payroll period with cutoff info.
   * Returns: payrollMonth, cutoffDate, cutoffPassed, timeRemaining, paymentDate
   */
  currentPayrollPeriod: userProcedure.query(async () => {
    return await getCurrentPayrollPeriod();
  }),

  /**
   * Get payroll period info for a specific month.
   */
  payrollPeriodInfo: userProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ input }) => {
      return await getPayrollPeriodInfo(input.month);
    }),

  /**
   * Check cutoff status for a specific effective month.
   * Used by frontend to show warnings before submitting.
   */
  checkCutoff: userProcedure
    .input(z.object({ effectiveMonth: z.string() }))
    .query(async ({ input }) => {
      const result = await checkCutoffPassed(input.effectiveMonth);
      return {
        passed: result.passed,
        cutoffDate: result.cutoffDate.toISOString(),
      };
    }),

  /**
   * Preview how a cross-month leave would be split into monthly portions.
   * Used by frontend to show the split before user confirms.
   */
  previewLeaveSplit: userProcedure
    .input(z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      totalDays: z.number().positive(),
    }))
    .query(({ input }) => {
      const crossMonth = isLeavesCrossMonth(input.startDate, input.endDate);
      const splits = splitLeaveByMonth(input.startDate, input.endDate, input.totalDays);
      return {
        crossMonth,
        splits,
      };
    }),

  // ── Manual Triggers ──

  // Manual trigger: Run employee auto-activation (admin only)
  triggerEmployeeActivation: adminProcedure
    .mutation(async () => {
      const result = await runEmployeeAutoActivation();
      return result;
    }),

  // Manual trigger: Run payroll auto-creation (admin only)
  triggerPayrollAutoCreate: adminProcedure
    .mutation(async () => {
      const result = await runAutoCreatePayrollRuns();
      return result;
    }),
});
