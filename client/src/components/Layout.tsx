/*
 * GEA Admin — Layout Component
 * Design: Fixed left sidebar (deep slate) + top header + main content area
 * Sidebar: 240px fixed, collapsible to 64px icon-only mode
 * i18n: Supports English/Chinese toggle
 */

import { useState, useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Globe,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronDown,
  CalendarDays,
  Receipt,
  ArrowUpDown,
  Landmark,
  ClipboardList,
  Languages,
  Truck,
  FileStack,
  BarChart3,
  Briefcase,
  BookOpen,
  Bot,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import NotificationCenter from "@/components/NotificationCenter";

import { useMemo } from "react";

function useNavGroups(user: any) {
  const { t } = useI18n();
  const roleStr = user?.role || "user";
  
  const hasRole = (allowed: string[]) => {
    const roles = roleStr.split(",").map((r: string) => r.trim());
    return allowed.some(r => roles.includes(r));
  };

  return useMemo(() => [
    {
      label: t("nav.overview"),
      items: [
        { label: t("nav.dashboard"), icon: LayoutDashboard, href: "/" },
      ],
    },
    {
      label: t("nav.sales"),
      items: [
        { label: t("nav.crm_pipeline"), icon: Briefcase, href: "/sales-crm" },
        { label: t("nav.quotations"), icon: FileText, href: "/quotations" },
      ].filter(() => hasRole(["admin", "sales", "customer_manager"])),
    },
    {
      label: t("nav.marketing"),
      items: [
        { label: t("nav.knowledge_admin"), icon: BookOpen, href: "/knowledge-base-admin", roles: ["admin"] },
        { label: t("nav.countryGuide"), icon: Globe, href: "/admin/knowledge/country-guides", roles: ["admin", "sales", "customer_manager"] },
      ].filter(item => !item.roles || hasRole(item.roles)),
    },
    {
      label: t("nav.client_management"),
      items: [
        { label: t("nav.customers"), icon: Building2, href: "/customers" },
        { label: t("nav.people"), icon: Users, href: "/people" },
      ].filter(() => hasRole(["admin", "customer_manager"])),
    },
    {
      label: t("nav.operations"),
      items: [
        { label: t("nav.payroll"), icon: DollarSign, href: "/payroll" },
        { label: t("nav.adjustments"), icon: ArrowUpDown, href: "/adjustments" },
        { label: t("nav.reimbursements"), icon: Receipt, href: "/reimbursements" },
        { label: t("nav.leave"), icon: CalendarDays, href: "/leave" },
      ].filter(() => hasRole(["admin", "operations_manager"])),
    },
    {
      label: t("nav.finance"),
      items: [
        { label: t("nav.invoices"), icon: Receipt, href: "/invoices" },
        { label: "Contractor Invoices", icon: FileText, href: "/admin/contractor-invoices" },
        { label: "Release Tasks", icon: CheckCircle, href: "/admin/release-tasks" },
        { label: t("nav.vendors"), icon: Truck, href: "/vendors" },
        { label: t("nav.vendor_bills"), icon: FileStack, href: "/vendor-bills" },
        { label: t("nav.profit_loss"), icon: BarChart3, href: "/reports/profit-loss" },
      ].filter(() => hasRole(["admin", "finance_manager"])),
    },
    {
      label: t("nav.system"),
      items: [
        { label: t("nav.settings"), icon: Settings, href: "/settings", roles: ["admin"] },
      ].filter(item => !item.roles || hasRole(item.roles)),
    },
  ].filter(group => group.items.length > 0), [t, roleStr]);
}

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: string[];
}

export default function Layout({ children, title, breadcrumb }: LayoutProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const navGroups = useNavGroups(user);

  const navRef = useRef<HTMLElement>(null);

  // Removed scroll restoration logic that was causing unwanted jumps
  // useLayoutEffect(() => { ... })

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-4 border-b",
        "border-sidebar-border"
      )}>
        <img 
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663378930055/eXXlZiimGUkORVcw.png" 
          alt="GEA" 
          className="w-8 h-8 rounded-lg flex-shrink-0 object-contain"
        />
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-sidebar-accent-foreground leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              GEA
            </div>
            <div className="text-xs text-sidebar-foreground/60 leading-tight">Global Employment Advisors</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  {group.label}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer",
                        collapsed ? "justify-center" : "",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                      {!collapsed && (
                        <span className="flex-1">{item.label}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        {/* User */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 mt-2 rounded-md cursor-pointer",
          "hover:bg-sidebar-accent transition-all duration-150"
        )}>
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary-foreground">{userInitials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-sidebar-accent-foreground truncate">{user?.name || "Admin"}</div>
              <div className="text-xs text-sidebar-foreground/60 truncate">{user?.email || ""}</div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center w-full py-2 border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col flex-shrink-0 transition-all duration-250 ease-in-out",
          collapsed ? "w-16" : "w-60"
        )}
        style={{ background: "var(--sidebar)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-60 flex flex-col z-50" style={{ background: "var(--sidebar)" }}>
            <button
              className="absolute top-3 right-3 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex-shrink-0 h-14 bg-card border-b border-border flex items-center px-4 gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0">
            {breadcrumb && breadcrumb.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                {breadcrumb.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-muted-foreground">/</span>}
                    <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {crumb}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>



          {/* Language Toggle */}
          <button
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            title={lang === "en" ? "切换到中文" : "Switch to English"}
          >
            <Languages className="w-4 h-4" />
            <span className="text-xs font-medium">{lang === "en" ? "EN" : "中"}</span>
          </button>

          {/* Notifications */}
          <NotificationCenter />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">{userInitials}</span>
                </div>
                <span className="hidden md:block text-sm font-medium">{user?.name || "Admin"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">

              <DropdownMenuItem className="text-destructive" onClick={() => logout()}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div key={location} className="animate-page-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
