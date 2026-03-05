import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Download, Eye, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { Link } from "wouter";

export default function Quotations() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error, refetch } = trpc.quotations.list.useQuery({
    limit,
    offset: (page - 1) * limit,
  });

  const downloadMutation = trpc.quotations.downloadPdf.useMutation({
    onSuccess: (data) => {
        window.open(data.url, "_blank");
    }
  });

  return (
    <Layout breadcrumb={["GEA", t("nav.sales"), t("nav.quotations")]}>
      <div className="p-6 space-y-6 page-enter">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("quotations.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("quotations.subtitle")}</p>
          </div>
          <Link href="/quotations/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />{t("quotations.createButton")}
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="p-12 text-center text-destructive">
                <p>Error loading quotations: {error.message}</p>
                <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t("common.no_data")}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("quotations.table.number")}</TableHead>
                    <TableHead>{t("quotations.table.customer")}</TableHead>
                    <TableHead>{t("quotations.table.total")}</TableHead>
                    <TableHead>{t("quotations.table.validUntil")}</TableHead>
                    <TableHead>{t("quotations.table.status")}</TableHead>
                    <TableHead className="text-right">{t("quotations.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.quotationNumber}</TableCell>
                      <TableCell>
                        {q.customer?.companyName || q.salesLead?.companyName || "—"}
                      </TableCell>
                      <TableCell>
                        {q.currency} {q.totalMonthly}
                      </TableCell>
                      <TableCell>
                        {q.validUntil ? formatDateTime(q.validUntil) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`quotations.status.${q.status}`)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => downloadMutation.mutate(q.id)} title={t("quotations.actions.download")}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
