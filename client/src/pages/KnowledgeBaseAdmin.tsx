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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Database,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
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
] as const;

type ArticleType = (typeof ARTICLE_TYPES)[number];

const FETCH_FREQUENCIES = ["manual", "daily", "weekly", "monthly"] as const;
type FetchFrequency = (typeof FETCH_FREQUENCIES)[number];

const SOURCE_TYPES = ["rss", "api", "web"] as const;
const TOPICS = ["payroll", "compliance", "leave", "invoice", "onboarding", "general"] as const;
const LANGUAGES = ["en", "zh", "multi"] as const;

const PAGE_SIZE = 50;

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
    skippedDuplicates?: number;
  } | null>(null);

  // Batch review state
  const [selectedReviewIds, setSelectedReviewIds] = useState<number[]>([]);

  // Pagination state
  const [reviewPage, setReviewPage] = useState(1);
  const [publishedPage, setPublishedPage] = useState(1);

  // ─── Data Queries ──────────────────────────────────────────────────────────
  const { data: queueData, refetch: refetchQueue } = trpc.knowledgeBaseAdmin.listReviewQueue.useQuery({
    statuses: ["pending_review"],
    page: reviewPage,
    pageSize: PAGE_SIZE,
  });
  const { data: publishedData, refetch: refetchPublished } = trpc.knowledgeBaseAdmin.listReviewQueue.useQuery({
    statuses: ["published"],
    page: publishedPage,
    pageSize: PAGE_SIZE,
  });
  const { data: sources, refetch: refetchSources } = trpc.knowledgeBaseAdmin.listSources.useQuery();
  const { data: contentGaps } = trpc.knowledgeBaseAdmin.listContentGaps.useQuery({ days: 30 });
  const { data: expiredContent, refetch: refetchExpired } = trpc.knowledgeBaseAdmin.listExpiredContent.useQuery({
    includeExpiringSoon: true,
  });

  // Extract paginated data
  const queue = queueData?.items ?? [];
  const pendingTotal = queueData?.total ?? 0;
  const reviewTotalPages = queueData?.totalPages ?? 1;
  const publishedItems = publishedData?.items ?? [];
  const publishedTotal = publishedData?.total ?? 0;
  const publishedTotalPages = publishedData?.totalPages ?? 1;

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
      await Promise.all([refetchQueue(), refetchPublished()]);
    },
    onError: (error) => toast.error(error.message),
  });

  const batchReviewMutation = trpc.knowledgeBaseAdmin.batchReview.useMutation({
    onSuccess: async (res) => {
      toast.success(`${t("knowledge_admin.toast.batch_reviewed")} (${res.count})`);
      setSelectedReviewIds([]);
      await Promise.all([refetchQueue(), refetchPublished()]);
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

  const deduplicateMutation = trpc.knowledgeBaseAdmin.deduplicateItems.useMutation({
    onSuccess: async (res) => {
      toast.success(`${t("knowledge_admin.toast.dedup_success")} (${res.duplicatesFound} duplicates from ${res.groupsProcessed} groups)`);
      await Promise.all([refetchQueue(), refetchPublished()]);
    },
    onError: (error) => toast.error(error.message),
  });

  // Dismissed gaps state
  const [dismissedGaps, setDismissedGaps] = useState<string[]>([]);

  const generateMutation = trpc.knowledgeBaseAdmin.generateFromInternalData.useMutation({
    onSuccess: async (result) => {
      setGenerateResult(result);
      toast.success(`${t("knowledge_admin.toast.generate_success")} (${result.totalGenerated})`);
      if ((result as any).skippedDuplicates > 0) {
        toast.info(`Skipped ${(result as any).skippedDuplicates} duplicate articles`);
      }
      toast.info(t("knowledge_admin.toast.generate_review_hint"));
      await Promise.all([refetchQueue(), refetchPublished()]);
    },
    onError: (error) => toast.error(error.message),
  });

  // ─── Computed Values ───────────────────────────────────────────────────────
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
    const confirmMsg = `Are you sure you want to ${action} ${selectedReviewIds.length} selected article(s)?`;
    if (!window.confirm(confirmMsg)) return;
    batchReviewMutation.mutate({ ids: selectedReviewIds, action });
  };

  const handleDeduplicate = () => {
    const confirmMsg = "This will scan all articles and reject older duplicates (keeping the newest per title + language). Continue?";
    if (!window.confirm(confirmMsg)) return;
    deduplicateMutation.mutate();
  };

  // ─── Pagination Helper ─────────────────────────────────────────────────────
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    total: number,
    onPageChange: (page: number) => void
  ) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4">
        <span className="text-sm text-muted-foreground">
          {t("knowledge_admin.pagination.showing")} {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, total)} {t("knowledge_admin.pagination.of")} {total}
        </span>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => { e.preventDefault(); if (currentPage > 1) onPageChange(currentPage - 1); }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 py-1 text-sm">
                {currentPage} / {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) onPageChange(currentPage + 1); }}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  // ─── Article Card Renderer ─────────────────────────────────────────────────
  const renderArticleCard = (item: (typeof queue)[number], showCheckbox: boolean) => {
    const meta = (item.metadata || {}) as Record<string, any>;
    const riskScore = Number((item as any).riskScore ?? meta.riskScore ?? 0);
    const aiConfidence = Number(item.aiConfidence ?? 0);
    const sourceLabel = item.sourceId
      ? `External: ${meta.sourceName || "#" + item.sourceId}`
      : (String(meta.sourceType || "").startsWith("internal") || meta.generatorType)
        ? "Internal"
        : meta.generatedFrom === "content_gap"
          ? "Content Gap"
          : "Internal";
    return (
      <Card key={item.id} className={selectedReviewIds.includes(item.id) ? "ring-2 ring-primary" : ""}>
        <CardHeader>
          <div className="flex items-start gap-3">
            {showCheckbox && (
              <Checkbox
                checked={selectedReviewIds.includes(item.id)}
                onCheckedChange={() => toggleReviewItem(item.id)}
                className="mt-1"
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.summary || "-"}</CardDescription>
            </div>
            <Badge variant="outline" className={item.sourceId ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600 border-gray-200"}>
              {sourceLabel}
            </Badge>
            {aiConfidence >= 85 && riskScore < 30 && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {t("knowledge_admin.auto_publishable")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className={`space-y-3 ${showCheckbox ? "ml-9" : ""}`}>
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
          {showCheckbox && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => reviewMutation.mutate({ id: item.id, action: "publish" })}>
                {t("knowledge_admin.actions.publish")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => reviewMutation.mutate({ id: item.id, action: "reject" })}>
                {t("knowledge_admin.actions.reject")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout title={t("knowledge_admin.title")}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("knowledge_admin.title")}</h1>
            <p className="text-muted-foreground">{t("knowledge_admin.subtitle")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeduplicate}
            disabled={deduplicateMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            {deduplicateMutation.isPending ? t("knowledge_admin.dedup.running") : t("knowledge_admin.dedup.btn")}
          </Button>
        </div>

        {/* ─── Metrics Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("knowledge_admin.metrics.pending")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{pendingTotal}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("knowledge_admin.metrics.published")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{publishedTotal}</div>
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
              {pendingTotal > 0 && (
                <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0">
                  {pendingTotal}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="published">
              {t("knowledge_admin.tabs.published")}
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                {publishedTotal}
              </Badge>
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{t("knowledge_admin.generate.result.total")}</p>
                          <p className="text-xl font-semibold">{generateResult.totalGenerated}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("knowledge_admin.generate.result.countries")}</p>
                          <p className="text-xl font-semibold">{generateResult.countries.length}</p>
                        </div>
                        {(generateResult.skippedDuplicates ?? 0) > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground">{t("knowledge_admin.generate.result.skipped")}</p>
                            <p className="text-xl font-semibold text-amber-600">{generateResult.skippedDuplicates}</p>
                          </div>
                        )}
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

          {/* ─── Review Tab (Pending Review with Batch Actions + Pagination) ─── */}
          <TabsContent value="review" className="space-y-3">
            {/* Batch action bar */}
            {queue.length > 0 && (
              <Card className="bg-muted/30">
                <CardContent className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedReviewIds.length === queue.length && queue.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedReviewIds(queue.map((item) => item.id));
                        } else {
                          setSelectedReviewIds([]);
                        }
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedReviewIds.length > 0
                        ? `${selectedReviewIds.length} ${t("knowledge_admin.batch.selected")} (${t("knowledge_admin.pagination.page")} ${reviewPage})`
                        : `${t("knowledge_admin.batch.select_all")} (${t("knowledge_admin.pagination.page")} ${reviewPage})`}
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

            {queue.map((item) => renderArticleCard(item, true))}
            {queue.length === 0 && <p className="text-sm text-muted-foreground">{t("knowledge_admin.empty")}</p>}

            {renderPagination(reviewPage, reviewTotalPages, pendingTotal, (p) => {
              setReviewPage(p);
              setSelectedReviewIds([]);
            })}
          </TabsContent>

          {/* ─── Published Tab (Separate tab with Pagination) ─── */}
          <TabsContent value="published" className="space-y-3">
            {publishedItems.map((item) => renderArticleCard(item, false))}
            {publishedItems.length === 0 && <p className="text-sm text-muted-foreground">{t("knowledge_admin.empty")}</p>}

            {renderPagination(publishedPage, publishedTotalPages, publishedTotal, setPublishedPage)}
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
