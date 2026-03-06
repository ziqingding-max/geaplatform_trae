import { getDb } from "../db";
import { type InvokeParams, type InvokeResult } from "../_core/llm";
import { aiTaskExecutions } from "../../drizzle/schema";

export type AITask = "knowledge_summarize" | "source_authority_review" | "vendor_bill_parse" | "invoice_audit";
export type AIProvider = "qwen";

function resolveEnvKey(name: string): string {
  return process.env[name] ?? "";
}

function extractTokenUsage(result: InvokeResult): { inputTokens: number; outputTokens: number } {
  const usage = (result as any)?.usage;
  if (!usage) return { inputTokens: 0, outputTokens: 0 };

  return {
    inputTokens: Number(usage.prompt_tokens ?? usage.input_tokens ?? usage.inputTokenCount ?? 0),
    outputTokens: Number(usage.completion_tokens ?? usage.output_tokens ?? usage.outputTokenCount ?? 0),
  };
}

function estimateCost(task: AITask, inputTokens: number, outputTokens: number): number {
  // Qwen-Plus pricing (approx): Input $0.0004/1k, Output $0.0012/1k
  // Qwen-VL-Plus pricing (approx): Input $0.0012/1k, Output $0.0036/1k
  const isVisual = task === "vendor_bill_parse";
  const inRate = isVisual ? 0.0000012 : 0.0000004;
  const outRate = isVisual ? 0.0000036 : 0.0000012;
  return Number((inputTokens * inRate + outputTokens * outRate).toFixed(6));
}

async function logTaskExecution(payload: {
  task: AITask;
  providerPrimary: string;
  providerActual: string;
  fallbackTriggered: boolean;
  latencyMs: number;
  tokenUsageIn: number;
  tokenUsageOut: number;
  costEstimate: number;
  success: boolean;
  errorClass?: string;
}) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(aiTaskExecutions).values({
      taskType: payload.task,
      providerPrimary: payload.providerPrimary as any,
      providerActual: payload.providerActual as any,
      fallbackTriggered: payload.fallbackTriggered,
      latencyMs: payload.latencyMs,
      tokenUsageIn: payload.tokenUsageIn,
      tokenUsageOut: payload.tokenUsageOut,
      costEstimate: String(payload.costEstimate),
      success: payload.success,
      errorClass: payload.errorClass || null,
    });
  } catch (error) {
    console.error("[AI Gateway] Failed to log task execution", error);
  }
}

async function invokeOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  params: InvokeParams
): Promise<InvokeResult> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: params.messages,
      response_format: (params as any).responseFormat || (params as any).response_format,
      max_tokens: (params as any).maxTokens || (params as any).max_tokens || 4096,
      temperature: (params as any).temperature,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Provider call failed: ${response.status} - ${errorText}`);
  }
  return (await response.json()) as InvokeResult;
}

export async function executeTaskLLM(task: AITask, params: InvokeParams): Promise<InvokeResult> {
  const startedAt = Date.now();
  
  // Unified Configuration
  const apiKey = resolveEnvKey("DASHSCOPE_API_KEY");
  if (!apiKey) {
    throw new Error("Missing DASHSCOPE_API_KEY environment variable");
  }

  // Automatic Model Selection
  // vendor_bill_parse requires vision capabilities -> qwen-vl-plus
  // all other tasks use standard text model -> qwen-plus
  const model = task === "vendor_bill_parse" ? "qwen-vl-plus" : "qwen-plus";
  
  // Use Alibaba Cloud compatible-mode endpoint
  const baseUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1";

  try {
    const result = await invokeOpenAICompatible(baseUrl, apiKey, model, params);
    const usage = extractTokenUsage(result);
    
    await logTaskExecution({
      task,
      providerPrimary: "qwen",
      providerActual: "qwen",
      fallbackTriggered: false,
      latencyMs: Date.now() - startedAt,
      tokenUsageIn: usage.inputTokens,
      tokenUsageOut: usage.outputTokens,
      costEstimate: estimateCost(task, usage.inputTokens, usage.outputTokens),
      success: true,
    });
    
    return result;
  } catch (error: any) {
    await logTaskExecution({
      task,
      providerPrimary: "qwen",
      providerActual: "qwen",
      fallbackTriggered: false,
      latencyMs: Date.now() - startedAt,
      tokenUsageIn: 0,
      tokenUsageOut: 0,
      costEstimate: 0,
      success: false,
      errorClass: error?.name || "Error",
    });
    throw error;
  }
}
