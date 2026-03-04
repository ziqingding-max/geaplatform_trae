import { workerTrpc } from "@/lib/workerTrpc";
import WorkerLayout from "./WorkerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function WorkerInvoices() {
  const { data, isLoading } = workerTrpc.invoices.list.useQuery({ page: 1, pageSize: 20 });

  return (
    <WorkerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>My Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No invoices found.
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.items.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold">{invoice.currency} {invoice.totalAmount}</p>
                          <Badge variant={
                            invoice.status === "paid" ? "default" : 
                            invoice.status === "approved" ? "secondary" : 
                            "outline"
                          }>
                            {invoice.status}
                          </Badge>
                        </div>
                        {/* TODO: Add download functionality */}
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </WorkerLayout>
  );
}
