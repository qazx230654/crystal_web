"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "@/src/domain/product";
import {
  cartStorageKey,
  getCartItemKey,
  normalizeStoredCartItem,
  toCartLine,
  type CartItem,
  type CartLine,
  type LegacyCartLine
} from "@/components/cart-model";

export type { CartItem, CartLine } from "@/components/cart-model";

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  unavailableItems: CartItem[];
  isHydrating: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    product: Product,
    selectedVariant?: Record<string, string>,
    customization?: Record<string, string>
  ) => void;
  clearCart: () => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  refreshCartProducts: () => Promise<CartLine[]>;
  total: number;
  removedItemCount: number;
  dismissRemovedItemNotice: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [productsBySlug, setProductsBySlug] = useState<Record<string, Product>>({});
  const [isHydrating, setIsHydrating] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [removedItemCount, setRemovedItemCount] = useState(0);

  const hydrateProducts = useCallback(async (cartItems: CartItem[]) => {
    if (!cartItems.length) {
      setProductsBySlug({});
      setIsHydrating(false);
      return [];
    }

    setIsHydrating(true);
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const payload = await response.json();
      const products = Array.isArray(payload.data) ? (payload.data as Product[]) : [];
      const nextProductsBySlug = products.reduce<Record<string, Product>>((acc, product) => {
        acc[product.slug] = product;
        return acc;
      }, {});

      setProductsBySlug(nextProductsBySlug);

      // Items whose product no longer exists (deleted/renamed) would otherwise sit
      // invisibly in the cart forever, silently hidden from the drawer but still
      // counted at checkout — blocking it with no way for the customer to fix it.
      // Prune them here so the raw cart state always matches what's shown. The diff
      // is computed against the latest state (not the cartItems snapshot) so
      // overlapping hydrate calls during startup don't double-count removals.
      setItems((current) => {
        const next = current.filter((item) => nextProductsBySlug[item.slug]);
        if (next.length === current.length) return current;
        setRemovedItemCount((count) => count + (current.length - next.length));
        return next;
      });

      return cartItems
        .map((item) => toCartLine(item, nextProductsBySlug[item.slug]))
        .filter((line): line is CartLine => Boolean(line));
    } catch {
      return [];
    } finally {
      setIsHydrating(false);
    }
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(cartStorageKey);
    if (!saved) {
      setIsHydrating(false);
      setIsLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Array<CartItem | LegacyCartLine>;
      const nextItems = parsed.map(normalizeStoredCartItem).filter(Boolean) as CartItem[];
      setItems(nextItems);
      setIsLoaded(true);
      void hydrateProducts(nextItems);
    } catch {
      window.localStorage.removeItem(cartStorageKey);
      setIsHydrating(false);
      setIsLoaded(true);
    }
  }, [hydrateProducts]);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
    void hydrateProducts(items);
  }, [hydrateProducts, isLoaded, items]);

  const lines = useMemo(
    () =>
      items
        .map((item) => toCartLine(item, productsBySlug[item.slug]))
        .filter((line): line is CartLine => Boolean(line)),
    [items, productsBySlug]
  );
  const unavailableItems = useMemo(
    () => items.filter((item) => !productsBySlug[item.slug]),
    [items, productsBySlug]
  );

  const value = useMemo<CartContextValue>(() => {
    const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

    return {
      items,
      lines,
      unavailableItems,
      isHydrating,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product, selectedVariant, customization) => {
        setItems((current) => {
          const nextItem: CartItem = {
            productId: product.id,
            slug: product.slug,
            quantity: 1,
            selectedVariant,
            customization
          };
          const nextKey = getCartItemKey(nextItem);
          const existing = current.find((item) => getCartItemKey(item) === nextKey);

          if (existing) {
            return current.map((item) =>
              getCartItemKey(item) === nextKey ? { ...item, quantity: item.quantity + 1 } : item
            );
          }

          return [...current, nextItem];
        });
        setProductsBySlug((current) => ({ ...current, [product.slug]: product }));
        setIsOpen(true);
      },
      clearCart: () => setItems([]),
      updateQuantity: (key, quantity) => {
        setItems((current) =>
          current
            .map((item) => (getCartItemKey(item) === key ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0)
        );
      },
      removeItem: (key) => {
        setItems((current) => current.filter((item) => getCartItemKey(item) !== key));
      },
      refreshCartProducts: () => hydrateProducts(items),
      total,
      removedItemCount,
      dismissRemovedItemNotice: () => setRemovedItemCount(0)
    };
  }, [hydrateProducts, isHydrating, isOpen, items, lines, removedItemCount, unavailableItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return value;
}
