import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Database, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

const ARTICLE_TYPES = [
  "countryOverview",
  "hiringGuide",
  "compensationGuide",
  "terminationGuide",
  "workingConditions",
  "socialInsurance",
  "publicHolidays",
  "leaveEntitlements",
  "salaryBenchmark",
  "contractorGuide",
  "exchangeRateImpact",
] as const;

type ArticleType = (typeof ARTICLE_TYPES)[number];

const FETCH_FREQUENCIES = ["manual", "daily", "weekly", "monthly"] as const;
type FetchFrequency = (typeof FETCH_FREQUENCIES)[number];

export default function KnowledgeBaseAdmin() {
  const { t } = useI18n();
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceFrequency, setNewSourceFrequency] = useState<FetchFrequency>("manual");

  // Generate tab state
  const [selectedTypes, setSelectedTypes] = useState<ArticleType[]>([...ARTICLE_TYPES]);
  const [countryCodesInput, setCountryCodesInput] = useState("");
  const [generateResult, setGenerateResult] = useState<{
    totalGenerated: number;
    byType: Record<string, number>;
    countries: string[];
    errors: string[];
  } | null>(null);

  // Batch review state
  const [selectedReviewIds, setSelectedReviewIds] = useState<number[]>([]);
  const [batchConfirmAction, setBatchConfirmAction] = useState<"publish" | "reject" | null>(null);

  const { data: queue, refetch: refetchQueue } = trpc.knowledgeBaseAdmin.listReviewQueue.useQuery({
    statuses: ["pending_review"],
  });
  const { data: publishedItems, refetch: refetchPublished } = trpc.knowledgeBaseAdmin.listReviewQueue.useQuery({
    statuses: ["published"],
  });
  const { data: sources, refetch: refetchSources } = trpc.knowledgeBaseAdmin.listSources.useQuery();
  const { data: contentGaps } = trpc.knowledgeBaseAdmin.listContentGaps.useQuery({ days: 30 });
  const { data: expiredContent, refetch: refetchExpired } = trpc.knowledgeBaseAdmin.listExpiredContent.useQuery();

  const createSourceMutation = trpc.knowledgeBaseAdmin.upsertSource.useMutation({
    onSuccess: async () => {
      toast.success(t("knowledge_admin.toast.source_saved"));
      setNewSourceName("");
      setNewSourceUrl("");
      setNewSourceFrequency("manual");
      await refetchSources();
    },
    onError: (error) => toast.error(error.message),
  });

  const auditSourceMutation = trpc.knowledgeBaseAdmin.auditSourceAuthority.useMutation({
    onSuccess: async () => {
      toast.success(t("knowledge_admin.toast.source_audited"));
      await refetchSources();
    },
    onError: (error) => toast.error(error.message),
  });

  const ingestMutation = trpc.knowledgeBaseAdmin.ingestSourceNow.useMutation({
    onSuccess: async (res) => {
      toast.success(`${t("knowledge_admin.toast.ingested")} ${res.created}`);
      await Promise.all([refetchQueue(), refetchSources()]);
    },
    onError: (error) => toast.error(error.message),
  });

  const reviewMutation = trpc.knowledgeBaseAdmin.reviewItem.useMutation({
    onSuccess: async () => {
      toast.success(t("knowledge_admin.toast.reviewed"));
      await refetchQueue();
    },
    onError: (error) => toast.error(error.message),
  });

  const batchReviewMutation = trpc.knowledgeBaseAdmin.batchReview.useMutation({
    onSuccess: async (res) => {
      toast.success(`${t("knowledge_admin.toast.batch_reviewed")} (${res.count})`);
      setSelectedReviewIds([]);
      setBatchConfirmAction(null);
      await Promise.all([refetchQueue(), refetchPublished()]);
    },
    onError: (error) => toast.error(error.message),
  });

  const generateMutation = trpc.knowledgeBaseAdmin.generateFromInternalData.useMutation({
    onSuccess: async (result) => {
      setGenerateResult(result);
      toast.success(`${t("knowledge_admin.toast.generate_success")} (${result.totalGenerated})`);
      await Promise.all([refetchQueue(), refetchPublished()]);
    },
    onError: (error) => toast.error(error.message),
  });

  const pendingCount = queue?.length ?? 0;
  const publishedCount = publishedItems?.length ?? 0;
  const expiredCount = expiredContent?.length ?? 0;
  const topSources = useMemo(() => (sources ?? []).slice(0, 20), [sources]);

  const toggleType = (type: ArticleType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleReviewId = (id: number) => {
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleGenerate = (dryRun: boolean) => {
    const countryCodes = countryCodesInput
      .split(/[,;\s]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    generateMutation.mutate({
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      countryCodes: countryCodes.length > 0 ? countryCodes : undefined,
      dryRun,
    });
  };

  const handleBatchReview = (action: "publish" | "reject") => {
    if (selectedReviewIds.length === 0) {
      toast.error(t("knowledge_admin.batch.no_selection"));
      return;
    }
    setBatchConfirmAction(action);
  };

  const confirmBatchReview = () => {
    if (!batchConfirmAction || selectedReviewIds.length === 0) return;
    batchReviewMutation.mutate({
      ids: selectedReviewIds,
      action: batchConfirmAction,
    });
  };

  return (
    <Layout title={t("knowledge_admin.title")}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("knowledge_admin.title")}</h1>
          <p className="text-muted-foreground">{t("knowledge_admin.subtitle")}</p>
        </div>

        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("knowledge_admin.metrics.pending")}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-semibold">{pendingCount}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("knowledge_admin.metrics.published")}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-semibold">{publishedCount}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("knowledge_admin.metrics.sources")}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-semibold">{sources?.length ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("knowledge_admin.metrics.content_gaps")}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-semibold">{contentGaps?.length ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                {t("knowledge_admin.metrics.expired")}
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-semibold text-amber-600">{expiredCount}</div></CardContent>
          </Card>
        </div>

        {/* ─── Tabs ─── */}
        <Tabs defaultValue="generate">
          <TabsList>
            <TabsTrigger value="generate">
              <Database className="w-4 h-4 mr-1.5" />
              {t("knowledge_admin.tabs.generate")}
            </TabsTrigger>
            <TabsTrigger value="review">
              {t("knowledge_admin.tabs.review")}
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sources">{t("knowledge_admin.tabs.sources")}</TabsTrigger>
            <TabsTrigger value="expired">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              {t("knowledge_admin.tabs.expired")}
              {expiredCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">{expiredCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="gaps">{t("knowledge_admin.tabs.gaps")}</TabsTrigger>
          </TabsList>

          {/* ─── Generate from Internal Data Tab ─── */}
          <TabsContent value="generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  {t("knowledge_admin.generate.title")}
                </CardTitle>
                <CardDescription>{t("knowledge_admin.generate.desc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Article type selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{t("knowledge_admin.generate.types")}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedTypes(
                          selectedTypes.length === ARTICLE_TYPES.length ? [] : [...ARTICLE_TYPES]
                        )
                      }
                    >
                      {selectedTypes.length === ARTICLE_TYPES.length
                        ? t("knowledge_admin.generate.deselect_all")
                        : t("knowledge_admin.generate.select_all")}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ARTICLE_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleType(type)}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                          {t(`knowledge_admin.generate.type.${type}`)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Country codes input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("common.country")}</Label>
                  <Input
                    value={countryCodesInput}
                    onChange={(e) => setCountryCodesInput(e.target.value)}
                    placeholder={t("knowledge_admin.generate.countries_placeholder")}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleGenerate(false)}
                    disabled={generateMutation.isPending || selectedTypes.length === 0}
                  >
                    {generateMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                        {t("knowledge_admin.generate.running")}
                      </>
                    ) : (
                      t("knowledge_admin.generate.btn")
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleGenerate(true)}
                    disabled={generateMutation.isPending || selectedTypes.length === 0}
                  >
                    {t("knowledge_admin.generate.btn_preview")}
                  </Button>
                </div>

                {/* Results display */}
                {generateResult && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{t("knowledge_admin.generate.result.total")}</p>
                          <p className="text-xl font-semibold">{generateResult.totalGenerated}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("knowledge_admin.generate.result.countries")}</p>
                          <p className="text-xl font-semibold">{generateResult.countries.length}</p>
                        </div>
                        {generateResult.errors.length > 0 && (
                          <div>
                            <p className="text-xs text-destructive">{t("knowledge_admin.generate.result.errors")}</p>
                            <p className="text-xl font-semibold text-destructive">{generateResult.errors.length}</p>
                          </div>
                        )}
                      </div>
                      {/* Per-type breakdown */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(generateResult.byType)
                          .filter(([, count]) => count > 0)
                          .map(([type, count]) => (
                            <Badge key={type} variant="secondary">
                              {t(`knowledge_admin.generate.type.${type}`)} : {count}
                            </Badge>
                          ))}
                      </div>
                      {/* Error list */}
                      {generateResult.errors.length > 0 && (
                        <div className="text-xs text-destructive space-y-1 max-h-40 overflow-y-auto">
                          {generateResult.errors.map((err, i) => (
                            <p key={i}>{err}</p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Review Tab (with batch actions) ─── */}
          <TabsContent value="review" className="space-y-3">
            {/* Batch action bar */}
            {pendingCount > 0 && (
              <Card className="bg-muted/30">
                <CardContent className="pt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedReviewIds.length === pendingCount && pendingCount > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedReviewIds((queue ?? []).map((item) => item.id));
                        } else {
                          setSelectedReviewIds([]);
                        }
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedReviewIds.length > 0
                        ? `${selectedReviewIds.length} ${t("knowledge_admin.batch.selected")}`
                        : t("knowledge_admin.batch.select_all")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleBatchReview("publish")}
                      disabled={selectedReviewIds.length === 0 || batchReviewMutation.isPending}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {t("knowledge_admin.batch.publish_selected")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBatchReview("reject")}
                      disabled={selectedReviewIds.length === 0 || batchReviewMutation.isPending}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      {t("knowledge_admin.batch.reject_selected")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Batch confirm dialog */}
            {batchConfirmAction && (
              <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
                <CardContent className="pt-4 flex items-center justify-between gap-4">
                  <p className="text-sm">
                    <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-500" />
                    {t("knowledge_admin.batch.confirm_prompt", {
                      count: String(selectedReviewIds.length),
                      action: batchConfirmAction,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={confirmBatchReview} disabled={batchReviewMutation.isPending}>
                      {batchReviewMutation.isPending ? (
                        <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                      ) : null}
                      {t("knowledge_admin.batch.confirm")}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setBatchConfirmAction(null)}>
                      {t("knowledge_admin.batch.cancel")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {(queue ?? []).map((item) => {
              const meta = (item.metadata || {}) as Record<string, any>;
              const riskScore = Number((item as any).riskScore ?? meta.riskScore ?? 0);
              const isAutoPublishable = (item.aiConfidence ?? 0) >= 85 && (meta.authorityScore ?? 0) >= 75;
              return (
                <Card key={item.id} className={selectedReviewIds.includes(item.id) ? "ring-2 ring-primary" : ""}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedReviewIds.includes(item.id)}
                        onCheckedChange={() => toggleReviewId(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription>{item.summary || "-"}</CardDescription>
                      </div>
                      {isAutoPublishable && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shrink-0">
                          {t("knowledge_admin.auto_publishable")}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{item.topic}</Badge>
                      <Badge variant="outline">{item.language}</Badge>
                      <Badge>{item.category}</Badge>
                      <Badge variant="outline">AI {item.aiConfidence}</Badge>
                      <Badge variant={riskScore >= 60 ? "destructive" : "secondary"}>{t("knowledge_admin.risk")}: {riskScore}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground grid grid-cols-1 md:grid-cols-3 gap-2">
                      <span>{t("knowledge_admin.score.authority")} {Number(meta.authorityScore ?? 0)}</span>
                      <span>{t("knowledge_admin.score.freshness")} {Number(meta.freshnessScore ?? 0)}</span>
                      <span>{t("knowledge_admin.score.duplication")} {Number(meta.duplicationScore ?? 0)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => reviewMutation.mutate({ id: item.id, action: "publish" })}>
                        {t("knowledge_admin.actions.publish")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => reviewMutation.mutate({ id: item.id, action: "reject" })}>
                        {t("knowledge_admin.actions.reject")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {pendingCount === 0 && <p className="text-sm text-muted-foreground">{t("knowledge_admin.empty")}</p>}
          </TabsContent>

          {/* ─── Sources Tab (with fetchFrequency) ─── */}
          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("knowledge_admin.new_source.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} placeholder={t("knowledge_admin.new_source.name")} />
                <Input value={newSourceUrl} onChange={(e) => setNewSourceUrl(e.target.value)} placeholder={t("knowledge_admin.new_source.url")} />
                {/* Fetch frequency selector */}
                <div className="space-y-1.5">
                  <Label className="text-sm">{t("knowledge_admin.source.fetch_frequency")}</Label>
                  <div className="flex gap-2">
                    {FETCH_FREQUENCIES.map((freq) => (
                      <Button
                        key={freq}
                        variant={newSourceFrequency === freq ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewSourceFrequency(freq)}
                      >
                        {t(`knowledge_admin.source.freq.${freq}`)}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() =>
                    createSourceMutation.mutate({
                      name: newSourceName,
                      url: newSourceUrl,
                      sourceType: "web",
                      language: "multi",
                      topic: "general",
                      isActive: true,
                      fetchFrequency: newSourceFrequency,
                    })
                  }
                  disabled={!newSourceName || !newSourceUrl || createSourceMutation.isPending}
                >
                  {t("knowledge_admin.actions.save_source")}
                </Button>
              </CardContent>
            </Card>

            {topSources.map((source) => {
              const freq = (source as any).fetchFrequency || "manual";
              const nextFetch = (source as any).nextFetchAt;
              return (
                <Card key={source.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{source.name}</CardTitle>
                    <CardDescription>{source.url}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <Badge variant="secondary">{source.sourceType}</Badge>
                      <Badge variant="outline">{source.topic}</Badge>
                      <Badge>{source.authorityLevel} ({source.authorityScore})</Badge>
                      <Badge variant={freq === "manual" ? "outline" : "default"}>
                        {t(`knowledge_admin.source.freq.${freq}`)}
                      </Badge>
                      {nextFetch && (
                        <span className="text-xs">
                          {t("knowledge_admin.source.next_fetch")}: {formatDate(nextFetch)}
                        </span>
                      )}
                    </div>
                    {source.authorityReason && (
                      <p className="text-xs text-muted-foreground">{source.authorityReason}</p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => ingestMutation.mutate({ sourceId: source.id })}>
                        {t("knowledge_admin.actions.ingest")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => auditSourceMutation.mutate({ sourceId: source.id })}
                        disabled={auditSourceMutation.isPending}
                      >
                        {t("knowledge_admin.actions.audit_source")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ─── Expired Content Tab ─── */}
          <TabsContent value="expired" className="space-y-3">
            {expiredCount === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">{t("knowledge_admin.expired.empty")}</p>
                </CardContent>
              </Card>
            ) : (
              (expiredContent ?? []).map((item) => {
                const isExpired = (item as any).isExpired;
                return (
                  <Card key={item.id} className={isExpired ? "border-red-300" : "border-amber-300"}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <CardDescription>{item.summary || "-"}</CardDescription>
                        </div>
                        <Badge variant={isExpired ? "destructive" : "secondary"}>
                          {isExpired
                            ? t("knowledge_admin.expired.status_expired")
                            : t("knowledge_admin.expired.status_expiring")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <Badge variant="outline">{item.topic}</Badge>
                        <Badge variant="outline">{item.language}</Badge>
                        {item.expiresAt && (
                          <span className="text-xs">
                            {t("knowledge_admin.expired.expires_at")}: {formatDate(item.expiresAt)}
                          </span>
                        )}
                        {item.publishedAt && (
                          <span className="text-xs">
                            {t("knowledge_admin.expired.published_at")}: {formatDate(item.publishedAt)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* ─── Content Gaps Tab ─── */}
          <TabsContent value="gaps" className="space-y-3">
            {(contentGaps ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("knowledge_admin.gaps.empty")}</p>
            ) : (
              (contentGaps ?? []).map((gap) => (
                <Card key={`${gap.query}-${gap.latestAt}`}>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{gap.query || t("knowledge_admin.gaps.empty_query")}</p>
                      <Badge>{t("knowledge_admin.gaps.hits")}: {gap.hits}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {gap.topics.map((topic) => (
                        <Badge key={`${gap.query}-${topic}`} variant="outline">{t(`knowledge_base.topic.${topic}`)}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{t("knowledge_admin.gaps.latest")}: {formatDate(gap.latestAt)}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
