/**
 * Admin Cost Simulator — Calculate employer costs and social insurance contributions
 * Supports both forward (Gross → Net) and reverse (Net → Gross) calculation modes.
 * Uses admin tRPC (trpc.countries.* and trpc.calculation.*).
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Calculator, Info, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import Layout from "@/components/Layout";
import { useProposalCart } from "@/contexts/ProposalCartContext";

type CalcMode = "gross_to_net" | "net_to_gross";

export default function AdminCostSimulator() {
  const { t } = useI18n();
  const { addItem, isInCart, toggleDrawer } = useProposalCart();
  const [countryCode, setCountryCode] = useState<string>("");
  const [regionCode, setRegionCode] = useState<string>("");
  const [inputAmount, setInputAmount] = useState<string>("");
  const [calcMode, setCalcMode] = useState<CalcMode>("gross_to_net");
  const [result, setResult] = useState<any>(null);

  const { data: countries } = trpc.countries.list.useQuery();

  const forwardMutation = trpc.calculation.calculateContributions.useMutation({
    onSuccess: (data) => setResult({ ...data, mode: "forward" }),
    onError: (err) => toast.error(err.message || "Calculation failed"),
  });

  const reverseMutation = trpc.calculation.calculateReverse.useMutation({
    onSuccess: (data) => setResult({ ...data, mode: "reverse" }),
    onError: (err) => toast.error(err.message || "Reverse calculation failed"),
  });

  const isPending = forwardMutation.isPending || reverseMutation.isPending;

  const handleCalculate = () => {
    if (!countryCode || !inputAmount) return;
    setResult(null);

    if (calcMode === "gross_to_net") {
      forwardMutation.mutate({
        countryCode,
        salary: parseFloat(inputAmount),
        regionCode: regionCode || undefined,
      });
    } else {
      reverseMutation.mutate({
        countryCode,
        netPay: parseFloat(inputAmount),
        regionCode: regionCode || undefined,
      });
    }
  };

  const selectedCountry = countries?.find((c: any) => c.countryCode === countryCode);
  const currency = result?.countryCode === "CN" ? "CNY" : selectedCountry?.localCurrency || "USD";

  return (
    <Layout breadcrumb={["GEA", "Toolkit", t("nav.costSimulator")]}>
      <div className="p-6 space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("nav.costSimulator")}</h1>
          <p className="text-muted-foreground">{t("cost_simulator.subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle>{t("cost_simulator.parameters_title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Calculation Mode Toggle */}
              <div className="space-y-2">
                <Label>{t("cost_simulator.calc_mode_label")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={calcMode === "gross_to_net" ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => { setCalcMode("gross_to_net"); setResult(null); setInputAmount(""); }}
                  >
                    {t("cost_simulator.mode_gross_to_net")}
                  </Button>
                  <Button
                    type="button"
                    variant={calcMode === "net_to_gross" ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => { setCalcMode("net_to_gross"); setResult(null); setInputAmount(""); }}
                  >
                    {t("cost_simulator.mode_net_to_gross")}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("cost_simulator.country_label")}</Label>
                <Select value={countryCode} onValueChange={(v) => { setCountryCode(v); setRegionCode(""); setResult(null); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("cost_simulator.country_placeholder")} />
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

              {countryCode === "CN" && (
                <div className="space-y-2">
                  <Label>{t("cost_simulator.city_label")}</Label>
                  <Select value={regionCode} onValueChange={setRegionCode}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("cost_simulator.city_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CN-BJ">Beijing</SelectItem>
                      <SelectItem value="CN-SH">Shanghai</SelectItem>
                      <SelectItem value="CN-SZ">Shenzhen</SelectItem>
                      <SelectItem value="CN-GZ">Guangzhou</SelectItem>
                      <SelectItem value="CN-HZ">Hangzhou</SelectItem>
                      <SelectItem value="CN-CD">Chengdu</SelectItem>
                      <SelectItem value="CN-CQ">Chongqing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>
                  {calcMode === "gross_to_net"
                    ? t("cost_simulator.salary_label", { currency: selectedCountry?.localCurrency || "USD" })
                    : t("cost_simulator.net_pay_label", { currency: selectedCountry?.localCurrency || "USD" })}
                </Label>
                <Input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder={calcMode === "gross_to_net"
                    ? t("cost_simulator.salary_placeholder")
                    : t("cost_simulator.net_pay_placeholder")}
                />
              </div>

              <Button
                onClick={handleCalculate}
                disabled={isPending || !countryCode || !inputAmount}
                className="w-full"
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                {t("cost_simulator.calculate")}
              </Button>
            </CardContent>
          </Card>

          {/* Result Card */}
          {result && (
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-primary">{t("cost_simulator.total_employment_cost")}</CardTitle>
                <div className="text-3xl font-bold mt-2">
                  {formatCurrency(currency, parseFloat(result.totalCost))}
                </div>
                <CardDescription>
                  {t("cost_simulator.base_plus_contributions")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Waterfall Breakdown */}
                <div className="space-y-2">
                  {/* Gross Salary */}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("cost_simulator.base_salary")}
                      {result.mode === "reverse" && (
                        <span className="ml-1 text-xs text-primary font-medium">({t("cost_simulator.calculated")})</span>
                      )}
                    </span>
                    <span className="font-medium">{formatCurrency(currency, result.salary)}</span>
                  </div>

                  {/* Employer Contributions */}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cost_simulator.employer_contributions")}</span>
                    <span className="font-medium text-destructive">+{formatCurrency(currency, parseFloat(result.totalEmployer))}</span>
                  </div>

                  {/* Employee Contributions */}
                  {parseFloat(result.totalEmployee) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("cost_simulator.employee_contributions")}</span>
                      <span className="font-medium text-orange-600">-{formatCurrency(currency, parseFloat(result.totalEmployee))}</span>
                    </div>
                  )}

                  {/* Income Tax */}
                  {parseFloat(result.incomeTax) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("cost_simulator.income_tax")}</span>
                      <span className="font-medium text-orange-600">-{formatCurrency(currency, parseFloat(result.incomeTax))}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t my-2" />

                  {/* Net Pay */}
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-foreground">
                      {t("cost_simulator.net_pay")}
                      {result.mode === "forward" && parseFloat(result.incomeTax) > 0 && (
                        <span className="ml-1 text-xs text-primary font-medium">({t("cost_simulator.estimated")})</span>
                      )}
                    </span>
                    <span className="text-primary">{formatCurrency(currency, parseFloat(result.netPay))}</span>
                  </div>
                </div>

                {/* Effective Tax Rate */}
                {result.taxDetails && parseFloat(result.incomeTax) > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("cost_simulator.effective_tax_rate")}</span>
                      <span className="font-medium">{result.taxDetails.effectiveTaxRate}</span>
                    </div>
                  </div>
                )}

                {/* Employer Contribution Breakdown */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 text-sm">{t("cost_simulator.breakdown_title")}</h4>
                  <div className="space-y-2">
                    {result.items.map((item: any) => (
                      parseFloat(item.employerContribution) > 0 && (
                        <div key={item.itemKey} className="flex justify-between text-sm">
                          <span>{item.itemNameEn} <span className="text-xs text-muted-foreground">({item.employerRate})</span></span>
                          <span>{formatCurrency(currency, parseFloat(item.employerContribution))}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Employee Deduction Breakdown */}
                {result.items.some((item: any) => parseFloat(item.employeeContribution) > 0) && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 text-sm">{t("cost_simulator.employee_breakdown_title")}</h4>
                    <div className="space-y-2">
                      {result.items.map((item: any) => (
                        parseFloat(item.employeeContribution) > 0 && (
                          <div key={`emp-${item.itemKey}`} className="flex justify-between text-sm">
                            <span>{item.itemNameEn} <span className="text-xs text-muted-foreground">({item.employeeRate})</span></span>
                            <span>{formatCurrency(currency, parseFloat(item.employeeContribution))}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Proposal Button */}
                <div className="border-t pt-4">
                  <Button
                    variant={isInCart("cost_simulator", countryCode) ? "outline" : "default"}
                    className="w-full"
                    onClick={() => {
                      addItem({
                        type: "cost_simulator",
                        countryCode,
                        countryName: selectedCountry?.countryName || countryCode,
                        label: `${selectedCountry?.countryName || countryCode} — ${calcMode === "gross_to_net" ? "Gross→Net" : "Net→Gross"} ${formatCurrency(currency, result.salary)}`,
                        metadata: {
                          mode: result.mode,
                          calcMode,
                          salary: result.salary,
                          totalCost: result.totalCost,
                          totalEmployer: result.totalEmployer,
                          totalEmployee: result.totalEmployee,
                          incomeTax: result.incomeTax,
                          netPay: result.netPay,
                          currency,
                          items: result.items,
                          taxDetails: result.taxDetails,
                          regionCode: regionCode || undefined,
                        },
                      });
                      toggleDrawer();
                    }}
                  >
                    {isInCart("cost_simulator", countryCode) ? (
                      <><Check className="mr-2 h-4 w-4" />{t("cost_simulator.added_to_proposal")}</>
                    ) : (
                      <><ShoppingCart className="mr-2 h-4 w-4" />{t("cost_simulator.add_to_proposal")}</>
                    )}
                  </Button>
                </div>

                {/* Disclaimer */}
                <div className="bg-muted/50 p-3 rounded-lg flex gap-2 text-xs text-muted-foreground">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <p>{t("cost_simulator.disclaimer_enhanced")}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
