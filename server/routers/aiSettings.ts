import { z } from "zod";
import { asc, desc, eq, gte } from "drizzle-orm";
import { adminProcedure, userProcedure } from "../procedures";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import { aiProviderConfigs, aiTaskExecutions, aiTaskPolicies } from "../../drizzle/schema";

const providerEnum = z.enum(["manus_forge", "openai", "qwen", "google", "volcengine"]);
const taskEnum = z.enum([
  "knowledge_summarize", 
  "source_authority_review", 
  "vendor_bill_parse", 
  "invoice_audit",
  "copilot_chat",
  "copilot_data_analysis",
  "copilot_file_analysis", 
  "copilot_report_generation",
  "copilot_insights_extraction",
  "copilot_payroll_analysis",
  "copilot_leave_analysis",
  "copilot_financial_analysis"
]);

export const aiSettingsRouter = router({
  listProviders: userProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(aiProviderConfigs).orderBy(asc(aiProviderConfigs.priority));
  }),

  upsertProvider: adminProcedure
    .input(
      z.object({
        provider: providerEnum,
        displayName: z.string().min(2),
        baseUrl: z.string().optional(),
        model: z.string().min(2),
        apiKeyEnv: z.string().min(2),
        isEnabled: z.boolean().default(true),
        priority: z.number().default(100),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      const existing = await db.select().from(aiProviderConfigs).where(eq(aiProviderConfigs.provider, input.provider)).limit(1);
      if (existing.length) {
        await db.update(aiProviderConfigs).set(input).where(eq(aiProviderConfigs.provider, input.provider));
      } else {
        await db.insert(aiProviderConfigs).values(input);
      }

      return { success: true };
    }),

  listTaskPolicies: userProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(aiTaskPolicies).orderBy(asc(aiTaskPolicies.task));
  }),

  aiHealthSummary: userProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        windowHours: 24,
        totalCalls: 0,
        successRate: 0,
        fallbackRate: 0,
        p95LatencyMs: 0,
        avgCost: 0,
        byTask: [],
        recentFailures: [],
      };
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const rows = await db
      .select()
      .from(aiTaskExecutions)
      .where(gte(aiTaskExecutions.createdAt, since))
      .orderBy(desc(aiTaskExecutions.createdAt))
      .limit(2000);

    const totalCalls = rows.length;
    const successCalls = rows.filter((r) => r.success).length;
    const fallbackCalls = rows.filter((r) => r.fallbackTriggered).length;
    const latencies = rows.map((r) => Number(r.latencyMs || 0)).sort((a, b) => a - b);
    const p95Index = latencies.length ? Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95)) : 0;
    const p95LatencyMs = latencies.length ? latencies[p95Index] : 0;

    const totalCost = rows.reduce((sum, row) => sum + Number(row.costEstimate || 0), 0);
    const avgCost = totalCalls ? Number((totalCost / totalCalls).toFixed(4)) : 0;

    const byTaskMap = new Map<string, { taskType: string; calls: number; success: number; fallback: number }>();
    for (const row of rows) {
      const key = row.taskType;
      const data = byTaskMap.get(key) || { taskType: key, calls: 0, success: 0, fallback: 0 };
      data.calls += 1;
      data.success += row.success ? 1 : 0;
      data.fallback += row.fallbackTriggered ? 1 : 0;
      byTaskMap.set(key, data);
    }

    const byTask = Array.from(byTaskMap.values()).map((item) => ({
      ...item,
      successRate: item.calls ? Number(((item.success / item.calls) * 100).toFixed(1)) : 0,
      fallbackRate: item.calls ? Number(((item.fallback / item.calls) * 100).toFixed(1)) : 0,
    }));

    const recentFailures = rows
      .filter((r) => !r.success)
      .slice(0, 10)
      .map((row) => ({
        id: row.id,
        taskType: row.taskType,
        providerPrimary: row.providerPrimary,
        providerActual: row.providerActual,
        errorClass: row.errorClass,
        createdAt: row.createdAt,
      }));

    return {
      windowHours: 24,
      totalCalls,
      successRate: totalCalls ? Number(((successCalls / totalCalls) * 100).toFixed(1)) : 0,
      fallbackRate: totalCalls ? Number(((fallbackCalls / totalCalls) * 100).toFixed(1)) : 0,
      p95LatencyMs,
      avgCost,
      byTask,
      recentFailures,
    };
  }),

  upsertTaskPolicy: adminProcedure
    .input(
      z.object({
        task: taskEnum,
        primaryProvider: providerEnum,
        fallbackProvider: providerEnum.optional(),
        modelOverride: z.string().optional(),
        temperature: z.number().min(0).max(2).default(0.3),
        maxTokens: z.number().min(256).max(32768).default(4096),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      const existing = await db.select().from(aiTaskPolicies).where(eq(aiTaskPolicies.task, input.task)).limit(1);
      const payload = {
        ...input,
        temperature: String(input.temperature),
      };

      if (existing.length) {
        await db.update(aiTaskPolicies).set(payload).where(eq(aiTaskPolicies.task, input.task));
      } else {
        await db.insert(aiTaskPolicies).values(payload as any);
      }

      return { success: true };
    }),
});
