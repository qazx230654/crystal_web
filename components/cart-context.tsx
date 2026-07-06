"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useEffect } from "react";
import type { Product } from "@/data/products";

export type CartLine = {
  product: Product;
  quantity: number;
  options?: Record<string, string>;
};

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, options?: Record<string, string>) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("gooday-cart");
    if (!saved) return;

    try {
      setLines(JSON.parse(saved) as CartLine[]);
    } catch {
      window.localStorage.removeItem("gooday-cart");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("gooday-cart", JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

    return {
      lines,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product, options) => {
        setLines((current) => {
          const existing = current.find((line) => line.product.id === product.id);
          if (existing) {
            return current.map((line) =>
              line.product.id === product.id ? { ...line, quantity: line.quantity + 1, options } : line
            );
          }
          return [...current, { product, quantity: 1, options }];
        });
        setIsOpen(true);
      },
      clearCart: () => setLines([]),
      updateQuantity: (id, quantity) => {
        setLines((current) =>
          current
            .map((line) => (line.product.id === id ? { ...line, quantity } : line))
            .filter((line) => line.quantity > 0)
        );
      },
      total
    };
  }, [isOpen, lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return value;
}
