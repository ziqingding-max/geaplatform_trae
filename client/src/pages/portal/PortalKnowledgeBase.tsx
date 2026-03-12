import { useMemo, useState } from "react";
import { toast } from "sonner";
import PortalLayout from "@/components/PortalLayout";
import { portalTrpc } from "@/lib/portalTrpc";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bell, BookOpen, Search, Sparkles, Mail, MessageSquareWarning, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Topic = "payroll" | "compliance" | "leave" | "invoice" | "onboarding" | "general";

const topicList: Topic[] = ["payroll", "compliance", "leave", "invoice", "onboarding", "general"];

export default function PortalKnowledgeBase() {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState("");
  const [topics, setTopics] = useState<Topic[]>(topicList);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const { data, isLoading, refetch, isFetching } = portalTrpc.knowledgeBase.dashboard.useQuery({
    locale,
    topics,
  });

  const marketingMutation = portalTrpc.knowledgeBase.marketingPreview.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const feedbackMutation = portalTrpc.knowledgeBase.submitSearchFeedback.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) => item.title.toLowerCase().includes(q) || (item.summary || "").toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  const selectedItem = useMemo(() => {
    if (selectedItemId === null) return null;
    return (data?.items ?? []).find((item) => item.id === selectedItemId) || null;
  }, [data?.items, selectedItemId]);

  const toggleTopic = (topic: Topic, checked: boolean) => {
    setTopics((prev) => {
      if (checked) {
        if (prev.includes(topic)) return prev;
        return [...prev, topic];
      }
      return prev.filter((t) => t !== topic);
    });
  };

  const hasNoResults = !isLoading && filteredItems.length === 0;

  // ─── Article Detail View ───
  if (selectedItem) {
    return (
      <PortalLayout title={selectedItem.title}>
        <div className="p-6 space-y-6 page-enter max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setSelectedItemId(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("knowledge_base.back_to_list")}
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {selectedItem.category === "alert" ? (
                  <Bell className="w-4 h-4 text-amber-600" />
                ) : (
                  <BookOpen className="w-4 h-4 text-primary" />
                )}
                <Badge variant="secondary">{t(`knowledge_base.category.${selectedItem.category}`)}</Badge>
                <Badge variant="outline">{t(`knowledge_base.topic.${selectedItem.topic}`)}</Badge>
              </div>
              <CardTitle className="text-xl">{selectedItem.title}</CardTitle>
              {selectedItem.summary && (
                <CardDescription className="text-sm mt-2">{selectedItem.summary}</CardDescription>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                {selectedItem.publishedAt && (
                  <span>{t("knowledge_base.published_at")}: {formatDate(selectedItem.publishedAt)}</span>
                )}
                <span>{t("knowledge_base.source")}: {selectedItem.sourceId ? `#${selectedItem.sourceId}` : "system"}</span>
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
                <p className="text-sm text-muted-foreground">{t("knowledge_base.no_content")}</p>
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
          <h1 className="text-2xl font-bold tracking-tight">{t("knowledge_base.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("knowledge_base.subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t("knowledge_base.personalization.title")}
            </CardTitle>
            <CardDescription>{t("knowledge_base.personalization.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("knowledge_base.search.placeholder")}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              {topicList.map((topic) => {
                const key = `knowledge_base.topic.${topic}`;
                return (
                  <div key={topic} className="flex items-center gap-2">
                    <Checkbox
                      id={topic}
                      checked={topics.includes(topic)}
                      onCheckedChange={(checked) => toggleTopic(topic, checked === true)}
                    />
                    <Label htmlFor={topic}>{t(key)}</Label>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? t("common.loading") : t("knowledge_base.refresh")}
              </Button>
              <Button
                onClick={() =>
                  marketingMutation.mutate({
                    locale,
                    cadence: "weekly",
                    topics,
                    channel: "email",
                  })
                }
                disabled={topics.length === 0 || marketingMutation.isPending}
              >
                <Mail className="w-4 h-4 mr-2" />
                {marketingMutation.isPending
                  ? t("common.loading")
                  : t("knowledge_base.marketing.preview")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("knowledge_base.stats.items")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{data?.items.length ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("knowledge_base.stats.topics")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{Object.values(data?.topicCounts ?? {}).filter((v) => Number(v) > 0).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("knowledge_base.stats.updated")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-muted-foreground">
                {data?.generatedAt ? formatDate(data.generatedAt) : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("knowledge_base.feed.title")}</CardTitle>
            <CardDescription>{t("knowledge_base.feed.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : filteredItems.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("knowledge_base.feed.empty")}</p>
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
                <div className="flex justify-end">
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
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-3 space-y-2 cursor-pointer hover:bg-accent/50 transition-colors"
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
                    <div className="flex items-center gap-2">
                      {item.category === "alert" ? (
                        <Bell className="w-4 h-4 text-amber-600" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-primary" />
                      )}
                      <Badge variant="secondary">{t(`knowledge_base.category.${item.category}`)}</Badge>
                      <Badge variant="outline">{t(`knowledge_base.topic.${item.topic}`)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{item.title}</h3>
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.summary || "-"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("knowledge_base.source")}: {item.sourceId ? `#${item.sourceId}` : "system"}
                    </p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
