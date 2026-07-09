import type { Product } from "@/src/domain/product";

export const cartStorageKey = "gooday-cart";

export type CartItem = {
  productId: string;
  slug: string;
  quantity: number;
  selectedVariant?: Record<string, string>;
  customization?: Record<string, string>;
};

export type CartLine = CartItem & {
  key: string;
  options?: Record<string, string>;
  product: Product;
};

export type LegacyCartLine = {
  product?: Product;
  quantity?: number;
  options?: Record<string, string>;
};

export function toCartLine(item: CartItem, product?: Product): CartLine | null {
  if (!product) return null;

  return {
    ...item,
    key: getCartItemKey(item),
    options: {
      ...(item.selectedVariant ?? {}),
      ...(item.customization ?? {})
    },
    product
  };
}

export function getCartItemKey(item: CartItem) {
  return [
    item.productId,
    item.slug,
    stableStringify(item.selectedVariant),
    stableStringify(item.customization)
  ].join("|");
}

export function normalizeStoredCartItem(item: CartItem | LegacyCartLine): CartItem | null {
  if ("product" in item && item.product) {
    return {
      productId: item.product.id,
      slug: item.product.slug,
      quantity: normalizeQuantity(item.quantity),
      selectedVariant: item.options
    };
  }

  if (!("productId" in item) || !("slug" in item)) return null;

  return {
    productId: item.productId,
    slug: item.slug,
    quantity: normalizeQuantity(item.quantity),
    selectedVariant: item.selectedVariant,
    customization: item.customization
  };
}

function stableStringify(value?: Record<string, string>) {
  if (!value) return "";
  return JSON.stringify(
    Object.keys(value)
      .sort()
      .reduce<Record<string, string>>((acc, key) => {
        acc[key] = value[key];
        return acc;
      }, {})
  );
}

function normalizeQuantity(quantity: unknown) {
  return Math.max(1, Math.floor(Number(quantity) || 1));
}
