/**
 * Document Templates Library
 * Browse and download employment document templates by country.
 */

import { useState } from "react";
import Layout from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FolderOpen, Download, FileText, File, Plus, Info, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TEMPLATE_TYPE_ICONS: Record<string, string> = {
  employment_contract: "📝",
  offer_letter: "💌",
  nda: "🔒",
  ip_assignment: "💡",
  employee_handbook: "📖",
  termination_letter: "📋",
  other: "📄",
};

const TEMPLATE_TYPE_LABELS: Record<string, { en: string; zh: string }> = {
  employment_contract: { en: "Employment Contract", zh: "劳动合同" },
  offer_letter: { en: "Offer Letter", zh: "Offer Letter" },
  nda: { en: "NDA", zh: "保密协议" },
  ip_assignment: { en: "IP Assignment", zh: "知识产权协议" },
  employee_handbook: { en: "Employee Handbook", zh: "员工手册" },
  termination_letter: { en: "Termination Letter", zh: "解除劳动合同通知" },
  other: { en: "Other", zh: "其他" },
};

export default function DocumentTemplates() {
  const { t, language } = useI18n();
  const [countryCode, setCountryCode] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: templates, isLoading } = trpc.toolkitEnhanced.getDocumentTemplates.useQuery(
    { countryCode: countryCode || undefined, templateType: templateType || undefined },
    { enabled: true }
  );

  const selectedCountry = countries?.find((c: any) => c.countryCode === countryCode);

  // Filter by search query
  const filteredTemplates = templates?.filter((tpl: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      tpl.titleEn?.toLowerCase().includes(q) ||
      tpl.titleZh?.toLowerCase().includes(q) ||
      tpl.countryCode?.toLowerCase().includes(q)
    );
  }) || [];

  // Group by country
  const groupedByCountry = filteredTemplates.reduce((acc: Record<string, any[]>, tpl: any) => {
    const key = tpl.countryCode || "GLOBAL";
    if (!acc[key]) acc[key] = [];
    acc[key].push(tpl);
    return acc;
  }, {} as Record<string, any[]>);

  const handleDownload = (tpl: any) => {
    if (tpl.fileUrl) {
      window.open(tpl.fileUrl, "_blank");
    } else {
      toast.error(t("templates.no_file"));
    }
  };

  const handleAddToProposal = () => {
    if (!filteredTemplates.length) return;
    const item = {
      type: "templates" as const,
      country: selectedCountry?.countryName || countryCode || "All",
      data: filteredTemplates.map((tpl: any) => ({
        title: language === "zh" ? tpl.titleZh : tpl.titleEn,
        type: tpl.templateType,
        country: tpl.countryCode,
      })),
    };
    const existing = JSON.parse(localStorage.getItem("proposalCart") || "[]");
    existing.push(item);
    localStorage.setItem("proposalCart", JSON.stringify(existing));
    toast.success(t("templates.added_to_proposal"));
  };

  return (
    <Layout title={t("templates.title")}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-primary" />
              {t("templates.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("templates.subtitle")}</p>
          </div>
          {filteredTemplates.length ? (
            <Button variant="outline" onClick={handleAddToProposal}>
              <Plus className="mr-2 h-4 w-4" />
              {t("templates.add_to_proposal")}
            </Button>
          ) : null}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("templates.country")}</label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("templates.all_countries")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("templates.all_countries")}</SelectItem>
                    {countries?.map((c: any) => (
                      <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("templates.type")}</label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("templates.all_types")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("templates.all_types")}</SelectItem>
                    {Object.entries(TEMPLATE_TYPE_LABELS).map(([key, labels]) => (
                      <SelectItem key={key} value={key}>
                        {TEMPLATE_TYPE_ICONS[key]} {language === "zh" ? labels.zh : labels.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("templates.search")}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("templates.search_placeholder")}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates grouped by country */}
        {Object.entries(groupedByCountry).map(([cc, tpls]) => {
          const countryName = countries?.find((c: any) => c.countryCode === cc)?.countryName || cc;
          return (
            <Card key={cc} className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-xl">{cc === "GLOBAL" ? "🌐" : ""}</span>
                  {cc === "GLOBAL" ? t("templates.global") : countryName}
                  <Badge variant="secondary">{(tpls as any[]).length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>{t("templates.template_name")}</TableHead>
                      <TableHead>{t("templates.type")}</TableHead>
                      <TableHead>{t("templates.format")}</TableHead>
                      <TableHead>{t("templates.version")}</TableHead>
                      <TableHead>{t("templates.source")}</TableHead>
                      <TableHead className="w-[100px]">{t("templates.action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(tpls as any[]).map((tpl: any) => (
                      <TableRow key={tpl.id}>
                        <TableCell>
                          <span className="text-lg">{TEMPLATE_TYPE_ICONS[tpl.templateType] || "📄"}</span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {language === "zh" ? tpl.titleZh : tpl.titleEn}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {language === "zh"
                              ? TEMPLATE_TYPE_LABELS[tpl.templateType]?.zh
                              : TEMPLATE_TYPE_LABELS[tpl.templateType]?.en
                              || tpl.templateType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="uppercase text-xs">
                            {tpl.fileFormat || "PDF"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tpl.version || "1.0"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tpl.source === "gea_official" ? "default" : "outline"} className="text-xs">
                            {tpl.source || "ai_generated"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(tpl)}
                            disabled={!tpl.fileUrl}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {filteredTemplates.length === 0 && !isLoading && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("templates.no_data")}</p>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        {filteredTemplates.length > 0 && (
          <div className="bg-muted/50 p-3 rounded-lg flex gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p>{t("templates.disclaimer")}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
