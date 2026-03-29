/**
 * Global Benefits Explorer
 * Structured view of statutory and customary benefits by country.
 */

import { useState } from "react";
import Layout from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gift, Plus, Shield, Sparkles, Info, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { AddToProposalButton } from "@/components/AddToProposalButton";

export default function GlobalBenefits() {
  const { t, locale: language } = useI18n();
  const [countryCode, setCountryCode] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: benefits, isLoading } = trpc.toolkitEnhanced.getBenefitsByCountry.useQuery(
    { countryCode },
    { enabled: !!countryCode }
  );

  const selectedCountry = countries?.find((c: any) => c.countryCode === countryCode);

  const statutory = benefits?.filter((b: any) => b.benefitType === "statutory") || [];
  const customary = benefits?.filter((b: any) => b.benefitType === "customary") || [];

  const handleCopyPitch = (benefit: any) => {
    const text = language === "zh" ? benefit.pitchCardZh : benefit.pitchCardEn;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedId(benefit.id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success(t("benefits.copied"));
    }
  };



  const BenefitTable = ({ items }: { items: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">{t("benefits.name")}</TableHead>
          <TableHead>{t("benefits.description")}</TableHead>
          <TableHead className="w-[120px]">{t("benefits.cost_indication")}</TableHead>
          <TableHead className="w-[80px]">{t("benefits.pitch_card")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              {t("benefits.no_data")}
            </TableCell>
          </TableRow>
        ) : (
          items.map((b: any) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium">
                {language === "zh" ? b.nameZh : b.nameEn}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-md">
                {language === "zh" ? b.descriptionZh : b.descriptionEn}
              </TableCell>
              <TableCell>
                {b.costIndication ? (
                  <Badge variant="outline">{b.costIndication}</Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell>
                {(b.pitchCardEn || b.pitchCardZh) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyPitch(b)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedId === b.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <Layout title={t("benefits.title")}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary" />
              {t("benefits.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("benefits.subtitle")}</p>
          </div>
          {benefits?.length && selectedCountry ? (
            <AddToProposalButton
              type="benefits"
              countryCode={countryCode}
              countryName={selectedCountry.countryName}
            />
          ) : null}
        </div>

        {/* Country Selector */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="max-w-sm">
              <Label className="text-sm font-medium mb-2 block">{t("benefits.select_country")}</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger>
                  <SelectValue placeholder={t("benefits.country_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((c: any) => (
                    <SelectItem key={c.countryCode} value={c.countryCode}>
                      {c.countryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Content */}
        {countryCode && (
          <Tabs defaultValue="statutory" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="statutory" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("benefits.statutory")} ({statutory.length})
              </TabsTrigger>
              <TabsTrigger value="customary" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {t("benefits.customary")} ({customary.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="statutory">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" />
                    {t("benefits.statutory")}
                  </CardTitle>
                  <CardDescription>{t("benefits.statutory_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <BenefitTable items={statutory} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customary">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    {t("benefits.customary")}
                  </CardTitle>
                  <CardDescription>{t("benefits.customary_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <BenefitTable items={customary} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Source Disclaimer */}
        {benefits?.length ? (
          <div className="bg-muted/50 p-3 rounded-lg flex gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p>{t("benefits.disclaimer")}</p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
