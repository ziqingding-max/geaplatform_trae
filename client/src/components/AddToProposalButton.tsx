/**
 * AddToProposalButton — Reusable button component for adding toolkit sections to the proposal cart.
 *
 * Used across all toolkit pages (Benefits, Compliance, Salary, Start Date, Templates).
 * Shows "Added" state when the item is already in the cart.
 */
import React from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useProposalCart, type CartItemType } from "../contexts/ProposalCartContext";
import { useI18n } from "../lib/i18n";

interface AddToProposalButtonProps {
  type: CartItemType;
  countryCode: string;
  countryName: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function AddToProposalButton({
  type,
  countryCode,
  countryName,
  className,
  size = "sm",
  variant = "outline",
}: AddToProposalButtonProps) {
  const { locale } = useI18n();
  const { addItem, removeItem, isInCart } = useProposalCart();
  const inCart = isInCart(type, countryCode);

  const typeLabelsEn: Record<CartItemType, string> = {
    benefits: "Benefits",
    compliance: "Compliance",
    salary: "Salary Benchmark",
    start_date: "Start Date Prediction",
    templates: "Document Templates",
  };

  const typeLabelsZh: Record<CartItemType, string> = {
    benefits: "福利数据",
    compliance: "合规速查",
    salary: "薪酬基准",
    start_date: "入职日预测",
    templates: "文档模版",
  };

  const typeLabels = locale === "zh" ? typeLabelsZh : typeLabelsEn;

  const handleClick = () => {
    if (inCart) {
      removeItem(`${type}-${countryCode}`);
    } else {
      addItem({
        type,
        countryCode,
        countryName,
        label: `${countryName} — ${typeLabels[type]}`,
      });
    }
  };

  return (
    <Button
      variant={inCart ? "default" : variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      {inCart ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          {locale === "zh" ? "已加入提案" : "Added to Proposal"}
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 mr-1" />
          {locale === "zh" ? "加入提案" : "Add to Proposal"}
        </>
      )}
    </Button>
  );
}
