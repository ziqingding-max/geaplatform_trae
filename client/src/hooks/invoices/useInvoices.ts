
import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

/**
 * Parse URL search params into filter state.
 * All filter values are persisted in URL so that navigating back
 * from invoice detail restores the exact same view.
 */
function parseUrlFilters(searchString: string) {
  const params = new URLSearchParams(searchString);
  return {
    status: params.get("status") || "all",
    type: params.get("type") || "all",
    month: params.get("month") || "",
    search: params.get("search") || "",
    customer: params.get("customer") || "all",
    activePage: Math.max(1, parseInt(params.get("page") || "1", 10) || 1),
    historyPage: Math.max(1, parseInt(params.get("hpage") || "1", 10) || 1),
    tab: (params.get("tab") as "list" | "history" | "monthly") || "list",
  };
}

/**
 * Build URL search string from filter state.
 * Only includes non-default values to keep URLs clean.
 */
function buildUrlSearch(filters: {
  status: string;
  type: string;
  month: string;
  search: string;
  customer: string;
  activePage: number;
  historyPage: number;
  tab: string;
}): string {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.month) params.set("month", filters.month);
  if (filters.search) params.set("search", filters.search);
  if (filters.customer && filters.customer !== "all") params.set("customer", filters.customer);
  if (filters.activePage > 1) params.set("page", String(filters.activePage));
  if (filters.historyPage > 1) params.set("hpage", String(filters.historyPage));
  if (filters.tab && filters.tab !== "list") params.set("tab", filters.tab);
  const str = params.toString();
  return str ? `?${str}` : "";
}

export function useInvoices() {
  const { t } = useI18n();
  const searchString = useSearch();
  const [, setLocation] = useLocation();

  // Parse all filter state from URL
  const urlFilters = useMemo(() => parseUrlFilters(searchString), [searchString]);

  const [statusFilter, setStatusFilterState] = useState(urlFilters.status);
  const [typeFilter, setTypeFilterState] = useState(urlFilters.type);
  const [monthFilter, setMonthFilterState] = useState(urlFilters.month);
  const [search, setSearchState] = useState(urlFilters.search);
  const [customerFilter, setCustomerFilterState] = useState(urlFilters.customer);
  const [activePage, setActivePageState] = useState(urlFilters.activePage);
  const [historyPage, setHistoryPageState] = useState(urlFilters.historyPage);
  const [activeTab, setActiveTabState] = useState(urlFilters.tab);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const PAGE_SIZE = 20;

  // Sync URL → state when URL changes (e.g. browser back/forward)
  useEffect(() => {
    const parsed = parseUrlFilters(searchString);
    setStatusFilterState(parsed.status);
    setTypeFilterState(parsed.type);
    setMonthFilterState(parsed.month);
    setSearchState(parsed.search);
    setCustomerFilterState(parsed.customer);
    setActivePageState(parsed.activePage);
    setHistoryPageState(parsed.historyPage);
    setActiveTabState(parsed.tab);
  }, [searchString]);

  // Helper: update URL with new filter values
  const updateUrl = useCallback((overrides: Partial<{
    status: string;
    type: string;
    month: string;
    search: string;
    customer: string;
    activePage: number;
    historyPage: number;
    tab: string;
  }>) => {
    const current = {
      status: statusFilter,
      type: typeFilter,
      month: monthFilter,
      search,
      customer: customerFilter,
      activePage,
      historyPage,
      tab: activeTab,
    };
    const merged = { ...current, ...overrides };
    const newSearch = buildUrlSearch(merged);
    setLocation(`/invoices${newSearch}`, { replace: true });
  }, [statusFilter, typeFilter, monthFilter, search, customerFilter, activePage, historyPage, activeTab, setLocation]);

  // Filter setters that also update URL and reset page
  const setStatusFilter = useCallback((val: string) => {
    setStatusFilterState(val);
    setActivePageState(1);
    setHistoryPageState(1);
    updateUrl({ status: val, activePage: 1, historyPage: 1 });
  }, [updateUrl]);

  const setTypeFilter = useCallback((val: string) => {
    setTypeFilterState(val);
    setActivePageState(1);
    setHistoryPageState(1);
    updateUrl({ type: val, activePage: 1, historyPage: 1 });
  }, [updateUrl]);

  const setMonthFilter = useCallback((val: string) => {
    setMonthFilterState(val);
    setActivePageState(1);
    setHistoryPageState(1);
    updateUrl({ month: val, activePage: 1, historyPage: 1 });
  }, [updateUrl]);

  const setSearch = useCallback((val: string) => {
    setSearchState(val);
    setActivePageState(1);
    setHistoryPageState(1);
    updateUrl({ search: val, activePage: 1, historyPage: 1 });
  }, [updateUrl]);

  const setCustomerFilter = useCallback((val: string) => {
    setCustomerFilterState(val);
    setActivePageState(1);
    setHistoryPageState(1);
    updateUrl({ customer: val, activePage: 1, historyPage: 1 });
  }, [updateUrl]);

  const setActivePage = useCallback((val: number | ((prev: number) => number)) => {
    setActivePageState((prev) => {
      const newVal = typeof val === "function" ? val(prev) : val;
      updateUrl({ activePage: newVal });
      return newVal;
    });
  }, [updateUrl]);

  const setHistoryPage = useCallback((val: number | ((prev: number) => number)) => {
    setHistoryPageState((prev) => {
      const newVal = typeof val === "function" ? val(prev) : val;
      updateUrl({ historyPage: newVal });
      return newVal;
    });
  }, [updateUrl]);

  const setActiveTab = useCallback((val: string) => {
    setActiveTabState(val as any);
    updateUrl({ tab: val });
  }, [updateUrl]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setStatusFilterState("all");
    setTypeFilterState("all");
    setMonthFilterState("");
    setSearchState("");
    setCustomerFilterState("all");
    setActivePageState(1);
    setHistoryPageState(1);
    setLocation(`/invoices${activeTab !== "list" ? `?tab=${activeTab}` : ""}`, { replace: true });
  }, [setLocation, activeTab]);

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all" || monthFilter !== "" || search !== "" || customerFilter !== "all";

  const utils = trpc.useUtils();

  // Build shared query filters for both tabs
  const sharedFilters = useMemo(() => ({
    status: statusFilter !== "all" ? statusFilter : undefined,
    invoiceType: typeFilter !== "all" ? typeFilter : undefined,
    invoiceMonth: monthFilter || undefined,
    search: search || undefined,
    customerId: customerFilter !== "all" ? parseInt(customerFilter, 10) : undefined,
    excludeCreditNotes: true,
  }), [statusFilter, typeFilter, monthFilter, search, customerFilter]);

  // Active invoices query (server-side pagination)
  const { data: activeData, isLoading: activeLoading } = trpc.invoices.list.useQuery({
    ...sharedFilters,
    tab: "active",
    limit: PAGE_SIZE,
    offset: (activePage - 1) * PAGE_SIZE,
  });

  // History invoices query (server-side pagination)
  const { data: historyData, isLoading: historyLoading } = trpc.invoices.list.useQuery({
    ...sharedFilters,
    tab: "history",
    limit: PAGE_SIZE,
    offset: (historyPage - 1) * PAGE_SIZE,
  });

  const activeInvoices = activeData?.data || [];
  const activeTotal = activeData?.total || 0;
  const historyInvoices = historyData?.data || [];
  const historyTotal = historyData?.total || 0;

  const isLoading = activeLoading || historyLoading;

  // Customer map from the data already returned (customerName is joined in backend)
  const customerMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const inv of [...activeInvoices, ...historyInvoices]) {
      if (inv.customerId && (inv as any).customerName) {
        map[inv.customerId] = (inv as any).customerName;
      }
    }
    return map;
  }, [activeInvoices, historyInvoices]);

  // Batch operations
  const batchMutation = trpc.invoices.batchUpdateStatus.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.summary.success}/${result.summary.total} invoices updated`);
      if (result.summary.failed > 0) {
        result.results.filter((r) => !r.success).forEach((r) => toast.error(`#${r.id}: ${r.message}`));
      }
      setSelectedIds(new Set());
      utils.invoices.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (items: any[]) => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((inv) => inv.id)));
    }
  };

  const handleBatchAction = (status: "pending_review" | "sent" | "paid" | "cancelled", paidAmount?: string) => {
    if (selectedIds.size === 0) {
      toast.warning(t("invoices.list.batch.noSelectionWarning"));
      return;
    }
    batchMutation.mutate({ 
      invoiceIds: Array.from(selectedIds), 
      status,
      paidAmount 
    });
  };

  return {
    isLoading,
    activeInvoices,
    activeTotal,
    historyInvoices,
    historyTotal,
    customerMap,
    filters: {
      status: statusFilter,
      setStatus: setStatusFilter,
      type: typeFilter,
      setType: setTypeFilter,
      month: monthFilter,
      setMonth: setMonthFilter,
      search,
      setSearch,
      customer: customerFilter,
      setCustomer: setCustomerFilter,
      clearAll: clearAllFilters,
      hasActiveFilters,
    },
    pagination: {
      activePage,
      setActivePage,
      historyPage,
      setHistoryPage,
      pageSize: PAGE_SIZE,
    },
    tab: {
      active: activeTab,
      setActive: setActiveTab,
    },
    selection: {
      selectedIds,
      setSelectedIds,
      toggleSelect,
      toggleSelectAll,
    },
    batch: {
      mutation: batchMutation,
      handleAction: handleBatchAction,
    }
  };
}
