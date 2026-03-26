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
import {
  Database,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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

const SOURCE_TYPES = ["rss", "api", "web"] as const;
const TOPICS = ["payroll", "compliance", "leave", "invoice", "onboarding", "general"] as const;
const LANGUAGES = ["en", "zh", "multi"] as const;

export default function KnowledgeBaseAdmin() {
  const { t } = useI18n();
  // Source form state
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceType, setNewSourceType] = useState<(typeof SOURCE_TYPES)[number]>("web");
  const [newSourceTopic, setNewSourceTopic] = useState<(typeof TOPICS)[number]>("general");
  const [newSourceLanguage, setNewSourceLanguage] = useState<(typeof LANGUAGES)[number]>("multi");
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

  // ─── Data Queries ──────────────────────────────────────────────────────────
  const { data: queue, refetch: refetchQueue } = trpc.knowledgeBaseAdmin.listReviewQueue.useQuery({
    statuses: ["pending_review"],
  });
  const { data: publishedItems, refetch: refetchPublished } = trpc.knowledgeBaseAdmin.listReviewQueue.useQuery({
    statuses: ["published"],
  });
  const { data: sources, refetch: refetchSources } = trpc.knowledgeBaseAdmin.listSources.useQuery();
  const { data: contentGaps } = trpc.knowledgeBaseAdmin.listContentGaps.useQuery({ days: 30 });
  const { data: expiredContent, refetch: refetchExpired } = trpc.knowledgeBaseAdmin.listExpiredContent.useQuery({
    includeExpiringSoon: true,
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const createSourceMutation = trpc.knowledgeBaseAdmin.upsertSource.useMutation({
    onSuccess: async () => {
      toast.success(t("knowledge_admin.toast.source_saved"));
      setNewSourceName("");
      setNewSourceUrl("");
      setNewSourceType("web");
      setNewSourceTopic("general");
      setNewSourceLanguage("multi");
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
      await refetchQueue();
    },
    onError: (error) => toast.error(error.message),
  });

  const generateFromGapMutation = trpc.knowledgeBaseAdmin.generateFromContentGap.useMutation({
    onSuccess: async (res) => {
      toast.success(`${t("knowledge_admin.toast.gap_generated")}: ${res.title}`);
      await Promise.all([refetchQueue()]);
    },
    onError: (error) => toast.error(error.message),
  });

  const dismissGapMutation = trpc.knowledgeBaseAdmin.dismissContentGap.useMutation({
    onSuccess: () => {
      toast.success(t("knowledge_admin.toast.gap_dismissed"));
    },
    onError: (error) => toast.error(error.message),
  });

  // Dismissed gaps state
  const [dismissedGaps, setDismissedGaps] = useState<string[]>([]);

  const generateMutation = trpc.knowledgeBaseAdmin.generateFromInternalData.useMutation({
    onSuccess: async (result) => {
      setGenerateResult(result);
      toast.success(`${t("knowledge_admin.toast.generate_success")} (${result.totalGenerated})`);
      await Promise.all([refetchQueue(), refetchPublished()]);
    },
    onError: (error) => toast.error(error.message),
  });

  // ─── Computed Values ───────────────────────────────────────────────────────
  const pendingCount = queue?.length ?? 0;
  const publishedCount = publishedItems?.length ?? 0;
  const expiredCount = expiredContent?.length ?? 0;
  const topSources = useMemo(() => (sources ?? []).slice(0, 20), [sources]);

  const toggleType = (type: ArticleType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleReviewItem = (id: number) => {
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
    if (selectedReviewIds.length === 0) return;
    const confirmMsg = action === "publish"
      ? `Confirm batch publish ${selectedReviewIds.length} item(s)?`
      : `Confirm batch reject ${selectedReviewIds.length} item(s)?`;
    if (!window.confirm(confirmMsg)) return;
    batchReviewMutation.mutate({ ids: selectedReviewIds, action });
  };

  return (
    <Layout title={t("knowledge_admin.title")}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("knowledge_admin.title")}</h1>
          <p className="text-muted-foreground">{t("knowledge_admin.subtitle")}</p>
        </div>

        {/* ─── Metrics Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("knowledge_admin.metrics.pending")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("knowledge_admin.metrics.published")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{publishedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("knowledge_admin.metrics.sources")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{sources?.length ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("knowledge_admin.metrics.content_gaps")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{contentGaps?.length ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                {t("knowledge_admin.metrics.expired")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-amber-600">{expiredCount}</div>
            </CardContent>
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
                <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sources">{t("knowledge_admin.tabs.sources")}</TabsTrigger>
            <TabsTrigger value="expired">
              <Clock className="w-4 h-4 mr-1.5" />
              {t("knowledge_admin.tabs.expired")}
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

          {/* ─── Review Tab (with Batch Actions) ─── */}
          <TabsContent value="review" className="space-y-3">
            {/* Batch action bar */}
            {pendingCount > 0 && (
              <Card className="bg-muted/30">
                <CardContent className="pt-4 flex items-center justify-between">
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
                  {selectedReviewIds.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleBatchReview("publish")}
                        disabled={batchReviewMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {t("knowledge_admin.batch.publish_all")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBatchReview("reject")}
                        disabled={batchReviewMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {t("knowledge_admin.batch.reject_all")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {(queue ?? []).map((item) => {
              const meta = (item.metadata || {}) as Record<string, any>;
              const riskScore = Number((item as any).riskScore ?? meta.riskScore ?? 0);
              const aiConfidence = Number(item.aiConfidence ?? 0);
              return (
                <Card key={item.id} className={selectedReviewIds.includes(item.id) ? "ring-2 ring-primary" : ""}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedReviewIds.includes(item.id)}
                        onCheckedChange={() => toggleReviewItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription>{item.summary || "-"}</CardDescription>
                      </div>
                      {/* Auto-publish indicator */}
                      {aiConfidence >= 85 && riskScore < 30 && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          {t("knowledge_admin.auto_publishable")}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 ml-9">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{item.topic}</Badge>
                      <Badge variant="outline">{item.language}</Badge>
                      <Badge>{item.category}</Badge>
                      <Badge variant="outline">AI {aiConfidence}</Badge>
                      <Badge variant={riskScore >= 60 ? "destructive" : "secondary"}>
                        {t("knowledge_admin.risk")}: {riskScore}
                      </Badge>
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

          {/* ─── Sources Tab (Enhanced with Frequency) ─── */}
          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("knowledge_admin.new_source.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    placeholder={t("knowledge_admin.new_source.name")}
                  />
                  <Input
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    placeholder={t("knowledge_admin.new_source.url")}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("knowledge_admin.new_source.type")}</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newSourceType}
                      onChange={(e) => setNewSourceType(e.target.value as typeof newSourceType)}
                    >
                      {SOURCE_TYPES.map((st) => (
                        <option key={st} value={st}>{st.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("knowledge_admin.new_source.topic")}</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newSourceTopic}
                      onChange={(e) => setNewSourceTopic(e.target.value as typeof newSourceTopic)}
                    >
                      {TOPICS.map((tp) => (
                        <option key={tp} value={tp}>{t(`knowledge_base.topic.${tp}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("knowledge_admin.new_source.language")}</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newSourceLanguage}
                      onChange={(e) => setNewSourceLanguage(e.target.value as typeof newSourceLanguage)}
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("knowledge_admin.new_source.frequency")}</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newSourceFrequency}
                      onChange={(e) => setNewSourceFrequency(e.target.value as FetchFrequency)}
                    >
                      {FETCH_FREQUENCIES.map((freq) => (
                        <option key={freq} value={freq}>
                          {t(`knowledge_admin.frequency.${freq}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    createSourceMutation.mutate({
                      name: newSourceName,
                      url: newSourceUrl,
                      sourceType: newSourceType,
                      language: newSourceLanguage,
                      topic: newSourceTopic,
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

            {topSources.map((source) => (
              <Card key={source.id}>
                <CardHeader>
                  <CardTitle className="text-base">{source.name}</CardTitle>
                  <CardDescription>{source.url}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">{source.sourceType}</Badge>
                    <Badge variant="outline">{source.topic}</Badge>
                    <Badge>{source.authorityLevel} ({source.authorityScore})</Badge>
                    {(source as any).fetchFrequency && (source as any).fetchFrequency !== "manual" && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {t(`knowledge_admin.frequency.${(source as any).fetchFrequency}`)}
                      </Badge>
                    )}
                    {(source as any).nextFetchAt && (
                      <span className="text-xs text-muted-foreground">
                        {t("knowledge_admin.next_fetch")}: {formatDate((source as any).nextFetchAt)}
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
            ))}
          </TabsContent>

          {/* ─── Expired Content Tab ─── */}
          <TabsContent value="expired" className="space-y-3">
            {(expiredContent ?? []).length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>{t("knowledge_admin.expired.all_fresh")}</p>
                </CardContent>
              </Card>
            ) : (
              (expiredContent ?? []).map((item) => {
                const isExpired = (item as any).isExpired;
                const isExpiringSoon = (item as any).isExpiringSoon;
                return (
                  <Card key={item.id} className={isExpired ? "border-red-200" : "border-amber-200"}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <CardDescription>{item.summary || "-"}</CardDescription>
                        </div>
                        <Badge variant={isExpired ? "destructive" : "secondary"} className={isExpiringSoon ? "bg-amber-100 text-amber-700" : ""}>
                          {isExpired
                            ? t("knowledge_admin.expired.status_expired")
                            : t("knowledge_admin.expired.status_expiring_soon")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge variant="secondary">{item.topic}</Badge>
                        <Badge variant="outline">{item.category}</Badge>
                        {item.expiresAt && (
                          <span className="text-xs text-muted-foreground">
                            {t("knowledge_admin.expired.expires_at")}: {formatDate(item.expiresAt)}
                          </span>
                        )}
                        {item.publishedAt && (
                          <span className="text-xs text-muted-foreground">
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
            {(contentGaps ?? []).filter((g) => !dismissedGaps.includes(g.query)).length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>{t("knowledge_admin.gaps.empty")}</p>
                </CardContent>
              </Card>
            ) : (
              (contentGaps ?? []).filter((g) => !dismissedGaps.includes(g.query)).map((gap) => (
                <Card key={`${gap.query}-${gap.latestAt}`} className="border-blue-100">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{gap.query || t("knowledge_admin.gaps.empty_query")}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("knowledge_admin.gaps.latest")}: {formatDate(gap.latestAt)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {t("knowledge_admin.gaps.hits")}: {gap.hits}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {gap.topics.map((topic) => (
                        <Badge key={`${gap.query}-${topic}`} variant="outline">
                          {t(`knowledge_base.topic.${topic}`)}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => generateFromGapMutation.mutate({
                          query: gap.query,
                          topics: gap.topics,
                          language: "en",
                        })}
                        disabled={generateFromGapMutation.isPending}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        {t("knowledge_admin.gaps.ai_generate_en")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateFromGapMutation.mutate({
                          query: gap.query,
                          topics: gap.topics,
                          language: "zh",
                        })}
                        disabled={generateFromGapMutation.isPending}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        {t("knowledge_admin.gaps.ai_generate_zh")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => {
                          setDismissedGaps((prev) => [...prev, gap.query]);
                          dismissGapMutation.mutate({ query: gap.query });
                        }}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        {t("knowledge_admin.gaps.dismiss")}
                      </Button>
                    </div>
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
