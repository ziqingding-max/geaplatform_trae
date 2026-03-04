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
import { Bell, BookOpen, Search, Sparkles, Mail, MessageSquareWarning } from "lucide-react";

type Topic = "payroll" | "compliance" | "leave" | "invoice" | "onboarding" | "general";

const topicList: Topic[] = ["payroll", "compliance", "leave", "invoice", "onboarding", "general"];

export default function PortalKnowledgeBase() {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState("");
  const [topics, setTopics] = useState<Topic[]>(topicList);

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
                  <div key={item.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {item.category === "alert" ? (
                        <Bell className="w-4 h-4 text-amber-600" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-primary" />
                      )}
                      <Badge variant="secondary">{t(`knowledge_base.category.${item.category}`)}</Badge>
                      <Badge variant="outline">{t(`knowledge_base.topic.${item.topic}`)}</Badge>
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.summary || "-"}</p>
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
