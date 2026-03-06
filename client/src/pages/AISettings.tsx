import { useState } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

const providers = ["volcengine", "openai", "qwen", "google"] as const;
const tasks = ["knowledge_summarize", "source_authority_review", "vendor_bill_parse", "invoice_audit"] as const;

const providerLabelKey: Record<(typeof providers)[number], string> = {
  volcengine: "ai_settings.provider.volcengine",
  openai: "ai_settings.provider.openai",
  qwen: "ai_settings.provider.qwen",
  google: "ai_settings.provider.google",
};

const taskLabelKey: Record<(typeof tasks)[number], string> = {
  knowledge_summarize: "ai_settings.task.knowledge_summarize",
  source_authority_review: "ai_settings.task.source_authority_review",
  vendor_bill_parse: "ai_settings.task.vendor_bill_parse",
  invoice_audit: "ai_settings.task.invoice_audit",
};

export default function AISettings() {
  const { t } = useI18n();
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKeyEnv, setApiKeyEnv] = useState("");

  const { data: providerData, refetch: refetchProviders } = trpc.aiSettings.listProviders.useQuery();
  const { data: policyData, refetch: refetchPolicies } = trpc.aiSettings.listTaskPolicies.useQuery();
  const { data: healthData, refetch: refetchHealth } = trpc.aiSettings.aiHealthSummary.useQuery();

  const upsertProvider = trpc.aiSettings.upsertProvider.useMutation({
    onSuccess: async () => {
      toast.success(t("ai_settings.saved"));
      await refetchProviders();
    },
    onError: (e) => toast.error(e.message),
  });

  const upsertPolicy = trpc.aiSettings.upsertTaskPolicy.useMutation({
    onSuccess: async () => {
      toast.success(t("ai_settings.saved"));
      await Promise.all([refetchPolicies(), refetchHealth()]);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Layout title={t("ai_settings.title")}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">{t("ai_settings.title")}</h1>

        <Card>
          <CardHeader><CardTitle>{t("ai_settings.health.title")}</CardTitle><CardDescription>{t("ai_settings.health.description")}</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="rounded border p-3">
                <div className="text-xs text-muted-foreground">{t("ai_settings.health.total_calls")}</div>
                <div className="text-xl font-semibold">{healthData?.totalCalls ?? 0}</div>
              </div>
              <div className="rounded border p-3">
                <div className="text-xs text-muted-foreground">{t("ai_settings.health.success_rate")}</div>
                <div className="text-xl font-semibold">{healthData?.successRate ?? 0}%</div>
              </div>
              <div className="rounded border p-3">
                <div className="text-xs text-muted-foreground">{t("ai_settings.health.fallback_rate")}</div>
                <div className="text-xl font-semibold">{healthData?.fallbackRate ?? 0}%</div>
              </div>
              <div className="rounded border p-3">
                <div className="text-xs text-muted-foreground">{t("ai_settings.health.p95_latency")}</div>
                <div className="text-xl font-semibold">{healthData?.p95LatencyMs ?? 0}ms</div>
              </div>
            </div>

            <div className="space-y-2">
              {(healthData?.byTask || []).map((task) => (
                <div key={task.taskType} className="rounded border p-2 text-sm flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{t(taskLabelKey[task.taskType as (typeof tasks)[number]])}</Badge>
                  <span>{t("ai_settings.health.total_calls")}: {task.calls}</span>
                  <span>{t("ai_settings.health.success_rate")}: {task.successRate}%</span>
                  <span>{t("ai_settings.health.fallback_rate")}: {task.fallbackRate}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("ai_settings.providers")}</CardTitle><CardDescription>{t("ai_settings.providers.description")}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder={t("ai_settings.base_url")} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
              <Input placeholder={t("ai_settings.api_key_env")} value={apiKeyEnv} onChange={(e) => setApiKeyEnv(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {providers.map((provider) => (
                <Button
                  key={provider}
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    upsertProvider.mutate({
                      provider,
                      displayName: provider,
                      baseUrl,
                      model: provider === "qwen" ? "qwen-plus" : (provider === "volcengine" ? "doubao-seed-1-6-251015" : "gemini-2.5-flash"),
                      apiKeyEnv: apiKeyEnv || "ARK_API_KEY",
                      isEnabled: true,
                      priority: provider === "volcengine" ? 1 : 10,
                    })
                  }
                >
                  {t("ai_settings.save_provider")} {t(providerLabelKey[provider])}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              {(providerData || []).map((p) => (
                <div key={p.id} className="rounded border p-2 flex items-center gap-2 text-sm">
                  <Badge>{t(providerLabelKey[p.provider])}</Badge>
                  <span>{p.model}</span>
                  <span className="text-muted-foreground">{p.baseUrl || "-"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("ai_settings.task_policy")}</CardTitle><CardDescription>{t("ai_settings.task_policy.description")}</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {tasks.map((task) => {
              const cur = policyData?.find((p) => p.task === task);
              return (
                <div key={task} className="rounded border p-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{t(taskLabelKey[task])}</div>
                    <div className="text-xs text-muted-foreground">
                      {t("ai_settings.primary_provider")}: {t(providerLabelKey[(cur?.primaryProvider || "volcengine") as (typeof providers)[number]])}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {providers.map((provider) => (
                      <Button
                        key={provider}
                        size="sm"
                        variant={cur?.primaryProvider === provider ? "default" : "outline"}
                        onClick={() =>
                          upsertPolicy.mutate({
                            task,
                            primaryProvider: provider,
                            fallbackProvider: provider === "volcengine" ? "openai" : "volcengine",
                            modelOverride: "",
                            temperature: 0.3,
                            maxTokens: 4096,
                            isActive: true,
                          })
                        }
                      >
                        {t(providerLabelKey[provider])}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
