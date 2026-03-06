import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { invokeLLM, type InvokeParams, type InvokeResult } from "../_core/llm";
import { aiProviderConfigs, aiTaskExecutions, aiTaskPolicies } from "../../drizzle/schema";

export type AITask = "knowledge_summarize" | "source_authority_review" | "vendor_bill_parse" | "invoice_audit";
export type AIProvider = "manus_forge" | "openai" | "qwen" | "google" | "volcengine";

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
  const inRate = task === "vendor_bill_parse" ? 0.000003 : 0.0000015;
  const outRate = task === "vendor_bill_parse" ? 0.000008 : 0.000004;
  return Number((inputTokens * inRate + outputTokens * outRate).toFixed(4));
}

function applyPolicyToParams(params: InvokeParams, policy: Awaited<ReturnType<typeof getTaskPolicy>>): InvokeParams {
  if (!policy) return params;

  const merged: Record<string, unknown> = {
    ...(params as any),
  };

  if (policy.maxTokens) {
    merged.maxTokens = policy.maxTokens;
    merged.max_tokens = policy.maxTokens;
  }

  if (policy.temperature !== null && policy.temperature !== undefined) {
    const temperature = Number(policy.temperature);
    if (!Number.isNaN(temperature)) {
      merged.temperature = temperature;
    }
  }

  return merged as InvokeParams;
}

async function logTaskExecution(payload: {
  task: AITask;
  providerPrimary: AIProvider;
  providerActual: AIProvider;
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
      providerPrimary: payload.providerPrimary,
      providerActual: payload.providerActual,
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
  params: InvokeParams,
  endpointSuffix: string = "/v1/chat/completions"
): Promise<InvokeResult> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${endpointSuffix}`, {
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
  if (!response.ok) throw new Error(`Provider call failed: ${response.status}`);
  return (await response.json()) as InvokeResult;
}

async function getTaskPolicy(task: AITask) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(aiTaskPolicies)
    .where(and(eq(aiTaskPolicies.task, task), eq(aiTaskPolicies.isActive, true)))
    .limit(1);
  return row || null;
}

async function getProvider(provider: AIProvider) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(aiProviderConfigs)
    .where(and(eq(aiProviderConfigs.provider, provider), eq(aiProviderConfigs.isEnabled, true)))
    .limit(1);
  return row || null;
}

async function resolveModelForProvider(provider: AIProvider, policy: Awaited<ReturnType<typeof getTaskPolicy>>): Promise<string> {
  if (policy?.modelOverride) return policy.modelOverride;
  const providerConfig = await getProvider(provider);
  if (provider === "volcengine") return providerConfig?.model || "doubao-seed-1-6-251015";
  return providerConfig?.model || "gemini-2.5-flash";
}

async function invokeByProvider(provider: AIProvider, model: string, params: InvokeParams) {
  // If manus_forge is requested but we want to deprecate it, we can redirect to volcengine
  // or keep it if invokeLLM is still needed. Since user said "no manus forge", we redirect.
  if (provider === "manus_forge") {
    // Redirect to Volcengine
    const volcConfig = await getProvider("volcengine");
    if (volcConfig) {
       return invokeByProvider("volcengine", volcConfig.model, params);
    }
    // If no volcengine config, try invokeLLM as last resort or throw
    return invokeLLM(params); 
  }

  const providerConfig = await getProvider(provider);
  if (!providerConfig?.baseUrl) throw new Error(`Provider ${provider} missing baseUrl config`);

  const apiKey = resolveEnvKey(providerConfig.apiKeyEnv);
  if (!apiKey) throw new Error(`Missing provider API key env: ${providerConfig.apiKeyEnv}`);

  let suffix = "/v1/chat/completions";
  if (provider === "volcengine") {
    suffix = "/chat/completions";
  }

  return invokeOpenAICompatible(providerConfig.baseUrl, apiKey, model, params, suffix);
}

export async function executeTaskLLM(task: AITask, params: InvokeParams): Promise<InvokeResult> {
  const startedAt = Date.now();
  const policy = await getTaskPolicy(task);
  const runtimeParams = applyPolicyToParams(params, policy);

  if (!policy) {
    // Default to Volcengine (Doubao) if no policy is set
    // Fallback logic changed from Manus Forge to Volcengine as requested
    const defaultProvider: AIProvider = "volcengine";
    const defaultModel = await resolveModelForProvider(defaultProvider, null);
    
    try {
      const result = await invokeByProvider(defaultProvider, defaultModel, runtimeParams);
      const usage = extractTokenUsage(result);
      await logTaskExecution({
        task,
        providerPrimary: defaultProvider,
        providerActual: defaultProvider,
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
        providerPrimary: defaultProvider,
        providerActual: defaultProvider,
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

  const primaryProvider = policy.primaryProvider as AIProvider;
  const primaryModel = await resolveModelForProvider(primaryProvider, policy);

  try {
    const result = await invokeByProvider(primaryProvider, primaryModel, runtimeParams);
    const usage = extractTokenUsage(result);
    await logTaskExecution({
      task,
      providerPrimary: primaryProvider,
      providerActual: primaryProvider,
      fallbackTriggered: false,
      latencyMs: Date.now() - startedAt,
      tokenUsageIn: usage.inputTokens,
      tokenUsageOut: usage.outputTokens,
      costEstimate: estimateCost(task, usage.inputTokens, usage.outputTokens),
      success: true,
    });
    return result;
  } catch (primaryError: any) {
    if (!policy.fallbackProvider) {
      await logTaskExecution({
        task,
        providerPrimary: primaryProvider,
        providerActual: primaryProvider,
        fallbackTriggered: false,
        latencyMs: Date.now() - startedAt,
        tokenUsageIn: 0,
        tokenUsageOut: 0,
        costEstimate: 0,
        success: false,
        errorClass: primaryError?.name || "PrimaryProviderError",
      });
      throw primaryError;
    }

    const fallbackProvider = policy.fallbackProvider as AIProvider;
    const fallbackModel = await resolveModelForProvider(fallbackProvider, policy);
    try {
      const fallbackResult = await invokeByProvider(fallbackProvider, fallbackModel, runtimeParams);
      const usage = extractTokenUsage(fallbackResult);
      await logTaskExecution({
        task,
        providerPrimary: primaryProvider,
        providerActual: fallbackProvider,
        fallbackTriggered: true,
        latencyMs: Date.now() - startedAt,
        tokenUsageIn: usage.inputTokens,
        tokenUsageOut: usage.outputTokens,
        costEstimate: estimateCost(task, usage.inputTokens, usage.outputTokens),
        success: true,
      });
      return fallbackResult;
    } catch (fallbackError: any) {
      await logTaskExecution({
        task,
        providerPrimary: primaryProvider,
        providerActual: fallbackProvider,
        fallbackTriggered: true,
        latencyMs: Date.now() - startedAt,
        tokenUsageIn: 0,
        tokenUsageOut: 0,
        costEstimate: 0,
        success: false,
        errorClass: fallbackError?.name || "FallbackProviderError",
      });
      throw fallbackError;
    }
  }
}
