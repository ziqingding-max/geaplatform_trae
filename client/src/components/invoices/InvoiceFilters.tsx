
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MonthPicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Search, XCircle, FilterX } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface CustomerOption {
  id: number;
  companyName: string;
}

interface InvoiceFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter?: string;
  setStatusFilter?: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  monthFilter?: string;
  setMonthFilter?: (val: string) => void;
  customerFilter?: string;
  setCustomerFilter?: (val: string) => void;
  customers?: CustomerOption[];
  showStatusFilter?: boolean;
  hasActiveFilters?: boolean;
  onClearAll?: () => void;
}

export function InvoiceFilters({
  search, setSearch,
  statusFilter, setStatusFilter,
  typeFilter, setTypeFilter,
  monthFilter, setMonthFilter,
  customerFilter, setCustomerFilter, customers,
  showStatusFilter = true,
  hasActiveFilters = false,
  onClearAll,
}: InvoiceFiltersProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          className="pl-9" 
          placeholder={t("invoices.list.filter.searchInvoiceCustomerPlaceholder")} 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>
      
      {showStatusFilter && statusFilter !== undefined && setStatusFilter && (
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t("invoices.list.filter.statusLabel")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("invoices.list.filter.allStatuses")}</SelectItem>
            <SelectItem value="draft">{t("invoices.status.draft")}</SelectItem>
            <SelectItem value="pending_review">{t("invoices.status.pendingReview")}</SelectItem>
            <SelectItem value="sent">{t("invoices.status.sent")}</SelectItem>
            <SelectItem value="paid">{t("invoices.detail.summary.paid")}</SelectItem>
            <SelectItem value="overdue">{t("invoices.status.overdue")}</SelectItem>
            <SelectItem value="cancelled">{t("invoices.status.cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      )}

      {customerFilter !== undefined && setCustomerFilter && customers && (
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder={t("invoices.list.filter.customerLabel") || "Customer"} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("invoices.list.filter.allCustomers") || "All Customers"}</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.companyName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-44"><SelectValue placeholder={t("invoices.list.filter.typeLabel")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("invoices.list.filter.allTypes")}</SelectItem>
          <SelectItem value="monthly_eor">{t("invoices.type.monthlyEor")}</SelectItem>
          <SelectItem value="monthly_visa_eor">{t("invoices.type.monthlyVisaEor")}</SelectItem>
          <SelectItem value="monthly_aor">{t("invoices.type.monthlyAor")}</SelectItem>
          <SelectItem value="visa_service">{t("invoices.type.visaService")}</SelectItem>
          <SelectItem value="deposit">{t("invoices.type.deposit")}</SelectItem>
          <SelectItem value="deposit_refund">{t("invoices.type.depositRefund")}</SelectItem>
          <SelectItem value="credit_note">{t("invoices.type.creditNote")}</SelectItem>
          <SelectItem value="manual">{t("invoices.type.manual")}</SelectItem>
        </SelectContent>
      </Select>

      {monthFilter !== undefined && setMonthFilter && (
        <div className="flex items-center gap-2">
          <MonthPicker 
            value={monthFilter} 
            onChange={setMonthFilter} 
            placeholder={t("invoices.list.filter.allMonths")} 
            className="w-40" 
          />
          {monthFilter && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonthFilter("")}>
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Clear All Filters Button */}
      {hasActiveFilters && onClearAll && (
        <Button variant="outline" size="sm" onClick={onClearAll} className="gap-1.5 text-muted-foreground hover:text-foreground">
          <FilterX className="w-3.5 h-3.5" />
          {t("invoices.list.filter.clearAll") || "Clear All Filters"}
        </Button>
      )}
    </div>
  );
}
