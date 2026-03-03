import { useState, useRef, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/i18n";
import Layout from "@/components/Layout";
import {
  Card, CardContent
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import CountrySelect from "@/components/CountrySelect";
import CurrencySelect from "@/components/CurrencySelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Users, Plus, Search, ChevronRight, Briefcase
} from "lucide-react";
import { formatCurrencyAmount } from "@/components/CurrencyAmount";

export default function ContractorList() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [, setLocation] = useLocation();
  const searchString = useSearch();

  // Initialize page from URL params (e.g. /employees?page=2)
  const getUrlPage = () => {
    const p = parseInt(new URLSearchParams(searchString).get("page") || "1", 10);
    return isNaN(p) ? 1 : p;
  };
  const [page, setPage] = useState(getUrlPage);
  const pageSize = 20;
  const isInitialMount = useRef(true);

  // Sync page from URL when navigating back from detail page
  useEffect(() => {
    setPage(getUrlPage());
  }, [searchString]);

  // Reset to page 1 when filters change (skip initial mount to preserve URL page)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(1);
  }, [search, statusFilter, customerFilter, countryFilter]);

  const { data, isLoading, refetch } = trpc.contractors.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    customerId: customerFilter !== "all" ? parseInt(customerFilter) : undefined,
    country: countryFilter !== "all" ? countryFilter : undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: 0,
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    currency: "USD",
    rateAmount: "",
    payFrequency: "monthly" as "monthly" | "semi_monthly" | "milestone",
    rateType: "fixed_monthly" as "fixed_monthly" | "hourly" | "daily" | "milestone_only",
    startDate: "",
    defaultApproverId: 0,
  });

  const createMutation = trpc.contractors.create.useMutation({
    onSuccess: () => {
      toast.success("Contractor created successfully");
      setCreateOpen(false);
      refetch();
      setFormData({
        customerId: 0,
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        currency: "USD",
        rateAmount: "",
        payFrequency: "monthly",
        rateType: "fixed_monthly",
        startDate: "",
        defaultApproverId: 0,
      });
    },
    onError: (err) => toast.error(err.message),
  });

  const { data: customers } = trpc.customers.list.useQuery({ limit: 200 });
  const { data: countriesList } = trpc.countries.list.useQuery();
  const { data: approvers } = trpc.contractors.getApprovers.useQuery();

  const statusColors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-gray-50 text-gray-700 border-gray-200",
    terminated: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <Layout>
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t("contractors.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("contractors.description")}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t("contractors.actions.addContractor")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("contractors.actions.addContractor")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>First Name</Label>
                   <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Last Name</Label>
                   <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Email</Label>
                   <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Start Date</Label>
                   <Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <Label>Customer</Label>
                 <Select value={String(formData.customerId)} onValueChange={v => setFormData({...formData, customerId: parseInt(v)})}>
                   <SelectTrigger><SelectValue placeholder="Select Customer" /></SelectTrigger>
                   <SelectContent>
                     {customers?.data?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.companyName}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="space-y-2">
                 <Label>Country</Label>
                 <CountrySelect value={formData.country} onValueChange={v => setFormData({...formData, country: v})} showCode={false} scope="all" />
               </div>

               <div className="space-y-2">
                 <Label>Default Approver</Label>
                 <Select value={formData.defaultApproverId ? String(formData.defaultApproverId) : ""} onValueChange={v => setFormData({...formData, defaultApproverId: parseInt(v)})}>
                   <SelectTrigger><SelectValue placeholder="Select Approver" /></SelectTrigger>
                   <SelectContent>
                     {approvers?.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.email})</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Currency</Label>
                   <CurrencySelect value={formData.currency} onValueChange={v => setFormData({...formData, currency: v})} />
                 </div>
                 <div className="space-y-2">
                    <Label>Payment Frequency</Label>
                    <Select value={formData.payFrequency} onValueChange={v => setFormData({...formData, payFrequency: v as any})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="semi_monthly">Semi-Monthly</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Rate Type</Label>
                   <Select value={formData.rateType} onValueChange={v => setFormData({...formData, rateType: v as any})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed_monthly">Fixed Monthly</SelectItem>
                        <SelectItem value="milestone_only">Milestone Only</SelectItem>
                      </SelectContent>
                   </Select>
                 </div>
                 {formData.rateType !== "milestone_only" && (
                   <div className="space-y-2">
                     <Label>{formData.payFrequency === 'semi_monthly' ? 'Semi-Monthly Amount' : 'Monthly Salary'}</Label>
                     <Input type="number" value={formData.rateAmount} onChange={e => setFormData({...formData, rateAmount: e.target.value})} />
                     {formData.payFrequency === 'semi_monthly' && (
                       <p className="text-xs text-muted-foreground mt-1">Paid {formatCurrencyAmount(formData.rateAmount, formData.currency)} on 15th and EOM</p>
                     )}
                   </div>
                 )}
               </div>
               
               <div className="flex justify-end gap-3 pt-2">
                 <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
                 <Button onClick={() => {
                   const submitData: any = {
                     ...formData,
                     paymentFrequency: formData.payFrequency, // Map local state to backend field
                   };
                   if (!submitData.customerId) { toast.error("Customer is required"); return; }
                   if (submitData.defaultApproverId === 0) delete submitData.defaultApproverId;
                   // rateAmount is already string, handled by backend
                   createMutation.mutate(submitData);
                 }} disabled={createMutation.isPending}>
                   {createMutation.isPending ? "Creating..." : "Create Contractor"}
                 </Button>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder={t("employees.create.form.customer")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("employees.list.filters.customer.all")}</SelectItem>
            {customers?.data?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.companyName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder={t("employees.list.table.header.country")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("employees.list.filters.country.all")}</SelectItem>
            {countriesList?.map((c: any) => (
              <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryCode} — {c.countryName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder={t("employees.list.table.header.status")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("employees.all_statuses")}</SelectItem>
            <SelectItem value="active">{t("status.active")}</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="terminated">{t("status.terminated")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("contractors.list.table.header.contractor")}</TableHead>
                <TableHead>{t("employees.create.form.customer")}</TableHead>
                <TableHead>{t("employees.list.table.header.country")}</TableHead>
                <TableHead>{t("contractors.list.table.header.rate")}</TableHead>
                <TableHead>{t("contractors.list.table.header.status")}</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                    ))}
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((con: any) => (
                  <TableRow key={con.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setLocation(`/contractors/${con.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {con.firstName?.[0]}{con.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{con.firstName} {con.lastName}</div>
                          <div className="text-xs text-muted-foreground">{con.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{con.customerName || `Customer #${con.customerId}`}</div>
                    </TableCell>
                    <TableCell className="text-sm">{con.country}</TableCell>
                    <TableCell className="text-sm font-mono">
                      {con.currency} {con.rateAmount ? formatCurrencyAmount(con.rateAmount, con.currency || "USD") : "—"}
                      <span className="text-xs text-muted-foreground ml-1">/ {con.paymentFrequency}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${statusColors[con.status] || ""}`}>
                        {con.status}
                      </Badge>
                    </TableCell>
                    <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">{t("contractors.list.empty.message")}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {data && (() => {
        const totalPages = Math.ceil(data.total / pageSize);
        return (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.total)} of {data.total} contractors</p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t("employees.list.pagination.previous")}</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>{t("employees.list.pagination.next")}</Button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
    </Layout>
  );
}
