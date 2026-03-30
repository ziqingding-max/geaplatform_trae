/**
 * Enhanced Salary Benchmark
 * Card-based grouped view with horizontal range bars for P25/P50/P75.
 * Groups by jobCategory, each job displayed as a visual salary range card.
 */

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Filter, Briefcase } from "lucide-react";
import { AddToProposalButton } from "@/components/AddToProposalButton";

/* ─── Seniority color mapping ─────────────────────────────────────────────── */
const SENIORITY_COLORS: Record<string, { bg: string; bar: string; dot: string }> = {
  junior:     { bg: "bg-blue-50",   bar: "bg-blue-200",   dot: "bg-blue-500" },
  mid:        { bg: "bg-green-50",  bar: "bg-green-200",  dot: "bg-green-500" },
  senior:     { bg: "bg-amber-50",  bar: "bg-amber-200",  dot: "bg-amber-500" },
  lead:       { bg: "bg-purple-50", bar: "bg-purple-200", dot: "bg-purple-500" },
  manager:    { bg: "bg-rose-50",   bar: "bg-rose-200",   dot: "bg-rose-500" },
  director:   { bg: "bg-indigo-50", bar: "bg-indigo-200", dot: "bg-indigo-500" },
  vp:         { bg: "bg-teal-50",   bar: "bg-teal-200",   dot: "bg-teal-500" },
  executive:  { bg: "bg-red-50",    bar: "bg-red-200",    dot: "bg-red-500" },
};

const DEFAULT_COLOR = { bg: "bg-gray-50", bar: "bg-gray-200", dot: "bg-gray-500" };

function getSeniorityColor(level: string) {
  const key = level?.toLowerCase().replace(/[-_\s]/g, "") || "";
  return SENIORITY_COLORS[key] || DEFAULT_COLOR;
}

/* ─── Salary Range Bar Component ──────────────────────────────────────────── */
function SalaryRangeBar({
  p25,
  p50,
  p75,
  globalMin,
  globalMax,
  currency,
  colors,
}: {
  p25: number;
  p50: number;
  p75: number;
  globalMin: number;
  globalMax: number;
  currency: string;
  colors: { bg: string; bar: string; dot: string };
}) {
  const range = globalMax - globalMin || 1;
  const leftPct = ((p25 - globalMin) / range) * 100;
  const widthPct = ((p75 - p25) / range) * 100;
  const midPct = ((p50 - globalMin) / range) * 100;

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: val >= 100000 ? "compact" : "standard",
    }).format(val);

  return (
    <div className="space-y-1">
      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>P25: {fmt(p25)}</span>
        <span className="font-semibold text-foreground">P50: {fmt(p50)}</span>
        <span>P75: {fmt(p75)}</span>
      </div>
      {/* Bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Range bar (P25 to P75) */}
        <div
          className={`absolute h-full rounded-full ${colors.bar} opacity-60`}
          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 1)}%` }}
        />
        {/* P50 marker */}
        <div
          className={`absolute top-0 h-full w-1.5 rounded-full ${colors.dot}`}
          style={{ left: `${midPct}%`, transform: "translateX(-50%)" }}
        />
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function SalaryBenchmark() {
  const { t, locale: language } = useI18n();
  const [countryCode, setCountryCode] = useState("");
  const [jobCategory, setJobCategory] = useState("");

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: benchmarks, isLoading } = trpc.toolkitEnhanced.getSalaryBenchmarks.useQuery(
    {
      countryCode,
      jobCategory: jobCategory || undefined,
    },
    { enabled: !!countryCode }
  );

  const selectedCountry = countries?.find((c: any) => c.countryCode === countryCode);
  const currency = selectedCountry?.localCurrency || "USD";

  // Extract unique job categories
  const jobCategories = useMemo(
    () => Array.from(new Set(benchmarks?.map((b: any) => b.jobCategory).filter(Boolean) || [])).sort(),
    [benchmarks]
  );

  // Group benchmarks by jobCategory
  const grouped = useMemo(() => {
    if (!benchmarks?.length) return {};
    const map: Record<string, any[]> = {};
    for (const b of benchmarks) {
      const cat = b.jobCategory || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(b);
    }
    // Sort within each group by seniority
    const seniorityOrder = ["junior", "mid", "senior", "lead", "manager", "director", "vp", "executive"];
    for (const cat of Object.keys(map)) {
      map[cat].sort((a: any, b: any) => {
        const ai = seniorityOrder.indexOf((a.seniorityLevel || "").toLowerCase());
        const bi = seniorityOrder.indexOf((b.seniorityLevel || "").toLowerCase());
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
    }
    return map;
  }, [benchmarks]);

  // Global min/max for consistent bar scaling
  const { globalMin, globalMax } = useMemo(() => {
    if (!benchmarks?.length) return { globalMin: 0, globalMax: 1 };
    let min = Infinity, max = -Infinity;
    for (const b of benchmarks) {
      const p25 = b.salaryP25 ? parseFloat(b.salaryP25) : 0;
      const p75 = b.salaryP75 ? parseFloat(b.salaryP75) : 0;
      if (p25 > 0 && p25 < min) min = p25;
      if (p75 > max) max = p75;
    }
    return { globalMin: min === Infinity ? 0 : min * 0.8, globalMax: max * 1.1 };
  }, [benchmarks]);

  const formatSalary = (val: string | number | null) => {
    if (!val) return "—";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const categoryCount = Object.keys(grouped).length;

  return (
    <Layout title={t("salary_benchmark.title")}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {t("salary_benchmark.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("salary_benchmark.subtitle")}</p>
          </div>
          {benchmarks?.length && selectedCountry ? (
            <AddToProposalButton
              type="salary"
              countryCode={countryCode}
              countryName={selectedCountry.countryName}
            />
          ) : null}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t("salary_benchmark.filters")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("salary_benchmark.country")}</label>
                <Select
                  value={countryCode}
                  onValueChange={(v) => {
                    setCountryCode(v);
                    setJobCategory("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("salary_benchmark.country_placeholder")} />
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
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("salary_benchmark.job_category")}</label>
                <Select
                  value={jobCategory || "__all__"}
                  onValueChange={(v) => setJobCategory(v === "__all__" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("salary_benchmark.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">{t("salary_benchmark.all")}</SelectItem>
                    {jobCategories.map((jc: string) => (
                      <SelectItem key={jc} value={jc}>
                        {jc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {benchmarks?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow bg-white/90 backdrop-blur-md">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold text-primary">{benchmarks.length}</p>
                <p className="text-xs text-muted-foreground">{t("salary_benchmark.records")}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow bg-white/90 backdrop-blur-md">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold text-primary">{categoryCount}</p>
                <p className="text-xs text-muted-foreground">{language === "zh" ? "职位类别" : "Categories"}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow bg-white/90 backdrop-blur-md">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold text-green-600">{formatSalary(globalMin / 0.8)}</p>
                <p className="text-xs text-muted-foreground">{language === "zh" ? "最低 P25" : "Lowest P25"}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow bg-white/90 backdrop-blur-md">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold text-amber-600">{formatSalary(globalMax / 1.1)}</p>
                <p className="text-xs text-muted-foreground">{language === "zh" ? "最高 P75" : "Highest P75"}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Grouped Cards */}
        {Object.entries(grouped).map(([category, items]) => (
          <Card key={category} className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                {category}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {items.length} {language === "zh" ? "个职位" : "roles"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((b: any) => {
                const p25 = b.salaryP25 ? parseFloat(b.salaryP25) : 0;
                const p50 = b.salaryP50 ? parseFloat(b.salaryP50) : 0;
                const p75 = b.salaryP75 ? parseFloat(b.salaryP75) : 0;
                if (!p25 && !p50 && !p75) return null;
                const colors = getSeniorityColor(b.seniorityLevel || "");
                return (
                  <div
                    key={b.id}
                    className={`rounded-lg p-4 ${colors.bg} border border-transparent hover:border-muted-foreground/10 transition-colors`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{b.jobTitle}</span>
                        {b.seniorityLevel && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {b.seniorityLevel}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{currency}/mo</span>
                    </div>
                    <SalaryRangeBar
                      p25={p25}
                      p50={p50}
                      p75={p75}
                      globalMin={globalMin}
                      globalMax={globalMax}
                      currency={currency}
                      colors={colors}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {countryCode && !isLoading && (!benchmarks || benchmarks.length === 0) && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardContent className="py-12 text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("salary_benchmark.no_data")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
