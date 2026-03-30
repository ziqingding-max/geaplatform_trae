/**
 * ProposalCartDrawer — Floating "shopping cart" drawer for toolkit proposal builder.
 *
 * Displays as a floating action button (FAB) with item count badge.
 * When opened, shows a slide-over drawer listing all collected sections,
 * with options to remove items, set client name, and generate PDF.
 */
import React, { useState } from "react";
import { ShoppingCart, X, Trash2, Download, FileText, Loader2 } from "lucide-react";
import { useProposalCart, type CartItem } from "../contexts/ProposalCartContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useI18n } from "../lib/i18n";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, string> = {
  benefits: "🎁",
  compliance: "⚖️",
  salary: "📊",
  start_date: "📅",
  templates: "📄",
  cost_simulator: "🧮",
};

const TYPE_LABELS_EN: Record<string, string> = {
  benefits: "Benefits",
  compliance: "Compliance",
  salary: "Salary Benchmark",
  start_date: "Start Date",
  templates: "Templates",
  cost_simulator: "Cost Breakdown",
};

const TYPE_LABELS_ZH: Record<string, string> = {
  benefits: "福利",
  compliance: "合规",
  salary: "薪酬基准",
  start_date: "入职日",
  templates: "文档模版",
  cost_simulator: "成本明细",
};

export function ProposalCartDrawer() {
  const { t, locale } = useI18n();
  const { items, removeItem, clearCart, itemCount, isDrawerOpen, setDrawerOpen, toggleDrawer } =
    useProposalCart();
  const [clientName, setClientName] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMutation = trpc.toolkitEnhanced.generateProposal.useMutation();

  const typeLabels = locale === "zh" ? TYPE_LABELS_ZH : TYPE_LABELS_EN;

  const handleGenerate = async () => {
    if (items.length === 0) return;
    setIsGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        sections: items.map((item) => ({
          type: item.type,
          countryCode: item.countryCode,
          metadata: item.metadata,
        })),
        locale: locale === "zh" ? "zh" : "en",
        clientName: clientName || undefined,
        preparedBy: preparedBy || undefined,
      });

      // Decode base64 and trigger download
      const byteCharacters = atob(result.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        locale === "zh"
          ? `PDF 提案已生成（${itemCount} 项）`
          : `PDF Proposal generated (${itemCount} items)`
      );
    } catch (error: any) {
      console.error("Failed to generate proposal:", error);
      const errMsg = error?.message || (locale === "zh" ? "未知错误" : "Unknown error");
      toast.error(
        locale === "zh"
          ? `提案生成失败：${errMsg}`
          : `Proposal generation failed: ${errMsg}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Group items by country
  const groupedItems = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    const key = item.countryName || item.countryCode;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleDrawer}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        title={locale === "zh" ? "提案购物车" : "Proposal Cart"}
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
            {itemCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-96 bg-background border-l shadow-xl transform transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h3 className="font-semibold text-lg">
                {locale === "zh" ? "提案生成器" : "Proposal Builder"}
              </h3>
              {itemCount > 0 && (
                <Badge variant="secondary">{itemCount}</Badge>
              )}
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="rounded-md p-1 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm text-center">
                  {locale === "zh"
                    ? "还没有添加任何内容。\n在各工具页面点击「加入提案」来收集数据。"
                    : "No items yet.\nClick \"Add to Proposal\" in toolkit pages to collect data."}
                </p>
              </div>
            ) : (
              <>
                {/* Grouped items */}
                {Object.entries(groupedItems).map(([country, countryItems]) => (
                  <div key={country} className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      {country}
                    </h4>
                    {countryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border p-3 bg-card"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{TYPE_ICONS[item.type]}</span>
                          <div>
                            <p className="text-sm font-medium">{typeLabels[item.type]}</p>
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Clear all */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="w-full text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {locale === "zh" ? "清空全部" : "Clear All"}
                </Button>
              </>
            )}
          </div>

          {/* Footer — Export options */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">
                  {locale === "zh" ? "客户名称（可选）" : "Client Name (optional)"}
                </Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={locale === "zh" ? "输入客户公司名称" : "Enter client company name"}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">
                  {locale === "zh" ? "制作人（可选）" : "Prepared By (optional)"}
                </Label>
                <Input
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  placeholder={locale === "zh" ? "输入您的姓名" : "Enter your name"}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {locale === "zh" ? "生成中..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {locale === "zh"
                      ? `导出 PDF 提案 (${itemCount} 项)`
                      : `Export PDF Proposal (${itemCount} items)`}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
