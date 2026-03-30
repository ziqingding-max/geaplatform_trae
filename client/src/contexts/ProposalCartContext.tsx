/**
 * ProposalCartContext — Global state for the "Add to Proposal" shopping cart.
 *
 * Allows users to collect toolkit sections (benefits, compliance, salary, etc.)
 * across different pages and then generate a combined PDF proposal.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type CartItemType = "benefits" | "compliance" | "salary" | "start_date" | "templates" | "cost_simulator";

export interface CartItem {
  id: string; // unique key: `${type}-${countryCode}`
  type: CartItemType;
  countryCode: string;
  countryName: string;
  label: string; // human-readable label for display
  addedAt: Date;
  /** Optional metadata for dynamic data (e.g., cost simulator results) */
  metadata?: Record<string, any>;
}

interface ProposalCartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "addedAt">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (type: CartItemType, countryCode: string) => boolean;
  itemCount: number;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
}

const ProposalCartContext = createContext<ProposalCartContextValue | null>(null);

export function ProposalCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const addItem = useCallback(
    (item: Omit<CartItem, "id" | "addedAt">) => {
      const id = `${item.type}-${item.countryCode}`;
      setItems((prev) => {
        // For cost_simulator, replace existing entry (data may change)
        if (item.type === "cost_simulator") {
          const filtered = prev.filter((i) => i.id !== id);
          return [...filtered, { ...item, id, addedAt: new Date() }];
        }
        // Prevent duplicates for other types
        if (prev.some((i) => i.id === id)) return prev;
        return [...prev, { ...item, id, addedAt: new Date() }];
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (type: CartItemType, countryCode: string) => {
      const id = `${type}-${countryCode}`;
      return items.some((i) => i.id === id);
    },
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearCart,
      isInCart,
      itemCount: items.length,
      isDrawerOpen,
      setDrawerOpen,
      toggleDrawer: () => setDrawerOpen((prev) => !prev),
    }),
    [items, addItem, removeItem, clearCart, isInCart, isDrawerOpen]
  );

  return (
    <ProposalCartContext.Provider value={value}>
      {children}
    </ProposalCartContext.Provider>
  );
}

export function useProposalCart() {
  const ctx = useContext(ProposalCartContext);
  if (!ctx) {
    throw new Error("useProposalCart must be used within a ProposalCartProvider");
  }
  return ctx;
}
