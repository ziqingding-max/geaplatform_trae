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
import { toast } from "sonner";

export default function KnowledgeBaseAdmin() {
  const { t } = useI18n();
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");

  const { data: queue, refetch: refetchQueue } = trpc.knowledgeBaseAdmin.listReviewQueue.useQuery({
    statuses: ["pending_review"],
  });
  const { data: sources, refetch: refetchSources } = trpc.knowledgeBaseAdmin.listSources.useQuery();
  const { data: contentGaps } = trpc.knowledgeBaseAdmin.listContentGaps.useQuery({ days: 30 });

  const createSourceMutation = trpc.knowledgeBaseAdmin.upsertSource.useMutation({
    onSuccess: async () => {
      toast.success(t("knowledge_admin.toast.source_saved"));
      setNewSourceName("");
      setNewSourceUrl("");
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

  const pendingCount = queue?.length ?? 0;
  const topSources = useMemo(() => (sources ?? []).slice(0, 20), [sources]);

  return (
    <Layout title={t("knowledge_admin.title")}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("knowledge_admin.title")}</h1>
          <p className="text-muted-foreground">{t("knowledge_admin.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("knowledge_admin.metrics.pending")}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-semibold">{pendingCount}</div></CardContent>
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
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("knowledge_admin.metrics.capture")}</CardTitle></CardHeader>
            <CardContent><div className="text-sm text-muted-foreground">{t("knowledge_admin.metrics.capture_desc")}</div></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="review">
          <TabsList>
            <TabsTrigger value="review">{t("knowledge_admin.tabs.review")}</TabsTrigger>
            <TabsTrigger value="sources">{t("knowledge_admin.tabs.sources")}</TabsTrigger>
            <TabsTrigger value="gaps">{t("knowledge_admin.tabs.gaps")}</TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-3">
            {(queue ?? []).map((item) => {
              const meta = (item.metadata || {}) as Record<string, any>;
              const riskScore = Number((item as any).riskScore ?? meta.riskScore ?? 0);
              return (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription>{item.summary || "-"}</CardDescription>
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

          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("knowledge_admin.new_source.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} placeholder={t("knowledge_admin.new_source.name")} />
                <Input value={newSourceUrl} onChange={(e) => setNewSourceUrl(e.target.value)} placeholder={t("knowledge_admin.new_source.url")} />
                <Button
                  onClick={() => createSourceMutation.mutate({ name: newSourceName, url: newSourceUrl, sourceType: "web", language: "multi", topic: "general", isActive: true })}
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{source.sourceType}</Badge>
                    <Badge variant="outline">{source.topic}</Badge>
                    <Badge>{source.authorityLevel} ({source.authorityScore})</Badge>
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
