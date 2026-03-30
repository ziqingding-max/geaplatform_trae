/**
 * Document Templates Library
 * Browse and download employment document templates by country.
 * Uses correct DB field names: documentType (not templateType), fileName, mimeType.
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
import { FolderOpen, Download, FileText, Plus, Info, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AddToProposalButton } from "@/components/AddToProposalButton";

const DOC_TYPE_ICONS: Record<string, string> = {
  employment_contract: "📝",
  offer_letter: "💌",
  nda: "🔒",
  termination_letter: "📋",
  employee_handbook: "📖",
  other: "📄",
};

export default function DocumentTemplates() {
  const { t, locale: language } = useI18n();
  const [countryCode, setCountryCode] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: templates, isLoading } = trpc.toolkitEnhanced.getDocumentTemplates.useQuery(
    {
      countryCode: countryCode || undefined,
      documentType: (documentType || undefined) as any,
    },
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

  const handleDownload = async (tpl: any) => {
    if (!tpl.fileUrl) {
      toast.error(t("templates.no_data"));
      return;
    }
    try {
      const response = await fetch(tpl.fileUrl);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = tpl.fileName || `${tpl.titleEn || "template"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: open in new tab
      window.open(tpl.fileUrl, "_blank");
    }
  };



  // Get file extension from fileName or mimeType
  const getFileFormat = (tpl: any) => {
    if (tpl.fileName) {
      const ext = tpl.fileName.split(".").pop()?.toUpperCase();
      if (ext) return ext;
    }
    if (tpl.mimeType) {
      if (tpl.mimeType.includes("pdf")) return "PDF";
      if (tpl.mimeType.includes("word") || tpl.mimeType.includes("docx")) return "DOCX";
    }
    return "PDF";
  };

  return (
    <Layout title={t("templates.title")}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-primary" />
              {t("templates.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("templates.subtitle")}</p>
          </div>
          {filteredTemplates.length && countryCode && selectedCountry ? (
            <AddToProposalButton
              type="templates"
              countryCode={countryCode}
              countryName={selectedCountry.countryName}
            />
          ) : null}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("templates.country_label")}</label>
                <Select value={countryCode || "__all__"} onValueChange={(v) => setCountryCode(v === "__all__" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("templates.country_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t("templates.country_placeholder")}</SelectItem>
                    {countries?.map((c: any) => (
                      <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("templates.type_label")}</label>
                <Select value={documentType || "__all__"} onValueChange={(v) => setDocumentType(v === "__all__" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("templates.type_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t("templates.type_placeholder")}</SelectItem>
                    <SelectItem value="employment_contract">{DOC_TYPE_ICONS.employment_contract} {t("templates.type_employment_contract")}</SelectItem>
                    <SelectItem value="offer_letter">{DOC_TYPE_ICONS.offer_letter} {t("templates.type_offer_letter")}</SelectItem>
                    <SelectItem value="nda">{DOC_TYPE_ICONS.nda} {t("templates.type_nda")}</SelectItem>
                    <SelectItem value="termination_letter">{DOC_TYPE_ICONS.termination_letter} {t("templates.type_termination_letter")}</SelectItem>
                    <SelectItem value="employee_handbook">{DOC_TYPE_ICONS.employee_handbook} {t("templates.type_employee_handbook")}</SelectItem>
                    <SelectItem value="other">{DOC_TYPE_ICONS.other} {t("templates.type_other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("templates.search_label") || "Search"}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("templates.search_placeholder") || "Search templates..."}
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
                  {cc === "GLOBAL" ? "🌐" : ""}
                  {cc === "GLOBAL" ? "Global" : countryName}
                  <Badge variant="secondary">{(tpls as any[]).length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>{t("templates.title") || "Template"}</TableHead>
                      <TableHead>{t("templates.type_label")}</TableHead>
                      <TableHead>{t("templates.file_size")}</TableHead>
                      <TableHead>{t("templates.version")}</TableHead>
                      <TableHead className="w-[100px]">{t("templates.download")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(tpls as any[]).map((tpl: any) => (
                      <TableRow key={tpl.id}>
                        <TableCell>
                          <span className="text-lg">{DOC_TYPE_ICONS[tpl.documentType] || "📄"}</span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {language === "zh" ? tpl.titleZh : tpl.titleEn}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {t(`templates.type_${tpl.documentType}`) || tpl.documentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="uppercase text-xs">
                            {getFileFormat(tpl)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tpl.version || "1.0"}
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
            <p>{t("templates.disclaimer") || "Templates are provided for reference only. Please consult local legal counsel before use."}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
