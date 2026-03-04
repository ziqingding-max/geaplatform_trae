import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Globe, PlusCircle } from "lucide-react";

export default function CountryGuideList() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const { data: countries, isLoading } = trpc.countries.list.useQuery();

  return (
    <Layout breadcrumb={["GEA", t("nav.marketing"), t("nav.countryGuide")]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("country_guide_admin.title")}</h1>
            <p className="text-muted-foreground">{t("country_guide_admin.subtitle")}</p>
          </div>
          <Button onClick={() => setLocation(`/admin/knowledge/country-guides/new`)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {t("country_guide_admin.button.new_guide")}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countries?.map((country) => (
              <Card 
                key={country.countryCode} 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setLocation(`/admin/knowledge/country-guides/${country.countryCode}`)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {country.countryName}
                  </CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{country.countryCode}</div>
                  <p className="text-xs text-muted-foreground">
                    {country.localCurrency}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
