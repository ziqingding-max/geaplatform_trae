import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import PortalLayout from "@/components/PortalLayout";
import { portalTrpc } from "@/lib/portalTrpc";
import { useI18n } from "@/lib/i18n";
import { formatDate, countryName, countryFlag } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Bell,
  BookOpen,
  Search,
  Sparkles,
  MessageSquareWarning,
  ChevronRight,
  ArrowLeft,
  ChevronLeft,
  Globe,
  MapPin,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Topic = "payroll" | "compliance" | "leave" | "invoice" | "onboarding" | "general";

const topicList: Topic[] = ["payroll", "compliance", "leave", "invoice", "onboarding", "general"];

const PAGE_SIZE = 20;

/** Check if an article was published within the last 7 days */
function isNewArticle(publishedAt: Date | string | null): boolean {
  if (!publishedAt) return false;
  const pubDate = typeof publishedAt === "string" ? new Date(publishedAt) : publishedAt;
  const sevenDaysAgo = Date.now() - 7 * 86_400_000;
  return pubDate.getTime() > sevenDaysAgo;
}

export default function PortalKnowledgeBase() {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState("");
  const [topics, setTopics] = useState<Topic[]>(topicList);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showAllCountries, setShowAllCountries] = useState(false);

  // ── Server-side paginated query ──
  const { data, isLoading, refetch, isFetching } = portalTrpc.knowledgeBase.dashboard.useQuery({
    locale,
    topics,
    countryCodes: selectedCountries.length > 0 ? selectedCountries : undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const feedbackMutation = portalTrpc.knowledgeBase.submitSearchFeedback.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? { page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 };
  const customerCountryCodes = data?.customerCountryCodes ?? [];
  const availableCountries = data?.availableCountries ?? {};

  // Client-side text search within current page items
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.summary || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  // Sort available countries: customer countries first, then alphabetically
  const sortedCountryCodes = useMemo(() => {
    const customerSet = new Set(customerCountryCodes.map((c) => c.toUpperCase()));
    const allCodes = Object.keys(availableCountries);
    return allCodes.sort((a, b) => {
      const aIsCustomer = customerSet.has(a) ? 0 : 1;
      const bIsCustomer = customerSet.has(b) ? 0 : 1;
      if (aIsCustomer !== bIsCustomer) return aIsCustomer - bIsCustomer;
      return a.localeCompare(b);
    });
  }, [availableCountries, customerCountryCodes]);

  // Reset page when filters change
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const selectedItem = useMemo(() => {
    if (selectedItemId === null) return null;
    return items.find((item) => item.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  const toggleTopic = useCallback((topic: Topic, checked: boolean) => {
    setTopics((prev) => {
      if (checked) {
        if (prev.includes(topic)) return prev;
        return [...prev, topic];
      }
      return prev.filter((t) => t !== topic);
    });
    setPage(1);
  }, []);

  const toggleCountry = useCallback((code: string) => {
    setSelectedCountries((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      return next;
    });
    setPage(1);
  }, []);

  const clearCountryFilter = useCallback(() => {
    setSelectedCountries([]);
    setPage(1);
  }, []);

  const hasNoResults = !isLoading && filteredItems.length === 0;

  // ─── Article Detail View ───
  if (selectedItem) {
    const meta = (selectedItem.metadata || {}) as Record<string, any>;
    return (
      <PortalLayout title={selectedItem.title}>
        <div className="p-6 space-y-6 page-enter max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedItemId(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("knowledge_base.back_to_list")}
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {selectedItem.category === "alert" ? (
                  <Bell className="w-4 h-4 text-amber-600" />
                ) : (
                  <BookOpen className="w-4 h-4 text-primary" />
                )}
                <Badge variant="secondary">
                  {t(`knowledge_base.category.${selectedItem.category}`)}
                </Badge>
                <Badge variant="outline">
                  {t(`knowledge_base.topic.${selectedItem.topic}`)}
                </Badge>
                {meta.countryCode && (
                          <Badge variant="outline" className="gap-1">
                            <span>{countryFlag(meta.countryCode)}</span>
                            {countryName(meta.countryCode)}
                          </Badge>
                        )}
                {isNewArticle(selectedItem.publishedAt) && (
                  <Badge className="bg-green-500 text-white hover:bg-green-600">NEW</Badge>
                )}
              </div>
              <CardTitle className="text-xl">{selectedItem.title}</CardTitle>
              {selectedItem.summary && (
                <CardDescription className="text-sm mt-2">
                  {selectedItem.summary}
                </CardDescription>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                {selectedItem.publishedAt && (
                  <span>
                    {t("knowledge_base.published_at")}:{" "}
                    {formatDate(selectedItem.publishedAt)}
                  </span>
                )}
                <span>
                  {t("knowledge_base.source")}:{" "}
                  {selectedItem.sourceId ? `#${selectedItem.sourceId}` : "system"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {selectedItem.content ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedItem.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("knowledge_base.no_content")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  // ─── List View ───
  return (
    <PortalLayout title={t("knowledge_base.title")}>
      <div className="p-6 space-y-6 page-enter max-w-6xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("knowledge_base.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("knowledge_base.subtitle")}
          </p>
        </div>

        {/* ─── Filters ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t("knowledge_base.personalization.title")}
            </CardTitle>
            <CardDescription>
              {t("knowledge_base.personalization.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("knowledge_base.search.placeholder")}
                className="pl-9"
              />
            </div>

            {/* Topic filters */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t("knowledge_base.filter.topics")}
              </Label>
              <div className="flex flex-wrap gap-4">
                {topicList.map((topic) => {
                  const key = `knowledge_base.topic.${topic}`;
                  const topicCount = data?.topicCounts?.[topic] ?? 0;
                  return (
                    <div key={topic} className="flex items-center gap-2">
                      <Checkbox
                        id={topic}
                        checked={topics.includes(topic)}
                        onCheckedChange={(checked) =>
                          toggleTopic(topic, checked === true)
                        }
                      />
                      <Label htmlFor={topic} className="cursor-pointer">
                        {t(key)}
                        {topicCount > 0 && (
                          <span className="ml-1 text-xs text-muted-foreground">({topicCount})</span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Country filters */}
            {sortedCountryCodes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    {t("knowledge_base.filter.countries")}
                  </Label>
                  {selectedCountries.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearCountryFilter}>
                      {t("knowledge_base.filter.clear_countries")}
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sortedCountryCodes.map((code) => {
                    const isCustomerCountry = customerCountryCodes.some(
                      (c) => c.toUpperCase() === code.toUpperCase()
                    );
                    const isSelected = selectedCountries.includes(code);
                    const articleCount = availableCountries[code] ?? 0;
                    return (
                      <Button
                        key={code}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`gap-1.5 ${
                          isCustomerCountry && !isSelected
                            ? "border-primary/50 text-primary hover:bg-primary/10"
                            : ""
                        } ${!isCustomerCountry && !showAllCountries && !isSelected ? "hidden" : ""}`}
                        onClick={() => toggleCountry(code)}
                      >
                        <span>{countryFlag(code)}</span>
                        {countryName(code)}
                        <span className="text-xs opacity-70">({articleCount})</span>
                        {isCustomerCountry && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                        )}
                      </Button>
                    );
                  })}
                  {sortedCountryCodes.some((c) => !customerCountryCodes.some((cc) => cc.toUpperCase() === c.toUpperCase())) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllCountries((prev) => !prev)}
                      className="text-muted-foreground"
                    >
                      {showAllCountries ? t("knowledge_base.filter.show_less") : t("knowledge_base.filter.show_more")}
                    </Button>
                  )}
                </div>
                {customerCountryCodes.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    {t("knowledge_base.filter.your_countries")}
                  </p>
                )}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? t("common.loading") : t("knowledge_base.refresh")}
            </Button>
          </CardContent>
        </Card>

        {/* ─── Stats ─── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {t("knowledge_base.stats.items")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {pagination.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {t("knowledge_base.stats.topics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {
                  Object.values(data?.topicCounts ?? {}).filter(
                    (v) => Number(v) > 0
                  ).length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {t("knowledge_base.stats.countries")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {Object.keys(availableCountries).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {t("knowledge_base.stats.updated")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-muted-foreground">
                {data?.generatedAt ? formatDate(data.generatedAt) : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Article List ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("knowledge_base.feed.title")}
            </CardTitle>
            <CardDescription>
              {selectedCountries.length > 0
                ? `${t("knowledge_base.feed.filtered_by_countries")}: ${selectedCountries.join(", ")}`
                : t("knowledge_base.feed.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                {t("common.loading")}
              </p>
            ) : filteredItems.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t("knowledge_base.feed.empty")}
                </p>
                <Button
                  variant="outline"
                  disabled={feedbackMutation.isPending}
                  onClick={() =>
                    feedbackMutation.mutate({
                      locale,
                      query: search,
                      topics,
                      feedbackType: hasNoResults ? "no_results" : "not_helpful",
                    })
                  }
                >
                  <MessageSquareWarning className="w-4 h-4 mr-2" />
                  {feedbackMutation.isPending
                    ? t("common.loading")
                    : t("knowledge_base.feedback.not_helpful")}
                </Button>
              </div>
            ) : (
              <>
                {filteredItems.map((item) => {
                  const meta = (item.metadata || {}) as Record<string, any>;
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border p-4 space-y-2 cursor-pointer hover:bg-accent/50 hover:border-primary/30 transition-colors group"
                      onClick={() => setSelectedItemId(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedItemId(item.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.category === "alert" ? (
                          <Bell className="w-4 h-4 text-amber-600" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-primary" />
                        )}
                        <Badge variant="secondary">
                          {t(`knowledge_base.category.${item.category}`)}
                        </Badge>
                        <Badge variant="outline">
                          {t(`knowledge_base.topic.${item.topic}`)}
                        </Badge>
                        {meta.countryCode && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <span>{countryFlag(meta.countryCode)}</span>
                            {countryName(meta.countryCode)}
                          </Badge>
                        )}
                        {isNewArticle(item.publishedAt) && (
                          <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.summary || "-"}
                      </p>
                      {item.publishedAt && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.publishedAt)}
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* ─── Server-side Pagination ─── */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      {t("knowledge_base.pagination.showing")}{" "}
                      {(pagination.page - 1) * pagination.pageSize + 1}-
                      {Math.min(pagination.page * pagination.pageSize, pagination.total)}{" "}
                      {t("knowledge_base.pagination.of")} {pagination.total}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page <= 1 || isFetching}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {t("common.previous")}
                      </Button>
                      <span className="text-sm text-muted-foreground px-2">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages || isFetching}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        {t("common.next")}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* ─── Feedback ─── */}
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={feedbackMutation.isPending}
                    onClick={() =>
                      feedbackMutation.mutate({
                        locale,
                        query: search,
                        topics,
                        feedbackType: "not_helpful",
                      })
                    }
                  >
                    {feedbackMutation.isPending
                      ? t("common.loading")
                      : t("knowledge_base.feedback.not_helpful")}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
