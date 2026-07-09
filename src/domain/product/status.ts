import type { Product, ProductArchiveStatus, ProductDisplayStatus, ProductStatus } from "@/src/domain/product/types";

export const productStatusLabels: Record<ProductStatus, string> = {
  active: "上架中",
  soldout: "售完展示",
  draft: "草稿",
  hidden: "隱藏"
};

export const productDisplayStatusLabels: Record<ProductDisplayStatus, string> = {
  ...productStatusLabels,
  archived: "已封存"
};

export const productStatusColors: Record<ProductDisplayStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  soldout: "bg-red-50 text-red-700",
  draft: "bg-slate-100 text-slate-700",
  hidden: "bg-zinc-100 text-zinc-700",
  archived: "border border-amber-200 bg-amber-50 text-amber-800"
};

export const productStatusPrefixes: Record<Exclude<ProductStatus, "active">, string> = {
  soldout: "[soldout]",
  draft: "[draft]",
  hidden: "[hidden]"
};

export function getProductDisplayStatus(product: Pick<Product, "deletedAt" | "status">): ProductDisplayStatus {
  if (product.deletedAt) return "archived";
  return product.status ?? "active";
}

export type ProductStatusCounts = Record<ProductDisplayStatus | "total", number>;

export function getProductStatusCounts(products: Array<Pick<Product, "deletedAt" | "status">>): ProductStatusCounts {
  return products.reduce<ProductStatusCounts>(
    (counts, product) => {
      counts.total += 1;
      counts[getProductDisplayStatus(product)] += 1;
      return counts;
    },
    { active: 0, archived: 0, draft: 0, hidden: 0, soldout: 0, total: 0 }
  );
}

export function getProductStatusFilterOptions(counts: ProductStatusCounts) {
  return [
    ["all", `全部狀態（${counts.total}）`],
    ["active", `${productStatusLabels.active}（${counts.active}）`],
    ["hidden", `${productStatusLabels.hidden}（${counts.hidden}）`],
    ["soldout", `${productStatusLabels.soldout}（${counts.soldout}）`],
    ["draft", `${productStatusLabels.draft}（${counts.draft}）`],
    ["archived", `${productDisplayStatusLabels.archived}（${counts.archived}）`]
  ] as const;
}

export function getProductStatusLabel(status?: string | null) {
  if (!status) return productStatusLabels.active;
  return status in productDisplayStatusLabels ? productDisplayStatusLabels[status as ProductDisplayStatus] : status;
}

export function getProductStatusColor(status?: string | null) {
  return status && status in productStatusColors
    ? productStatusColors[status as ProductDisplayStatus]
    : productStatusColors.active;
}

export function isProductVisible(product: Pick<Product, "deletedAt" | "status">) {
  if (product.deletedAt) return false;
  const status = product.status ?? "active";
  return status === "active" || status === "soldout";
}

export function isProductSellable(product: Pick<Product, "deletedAt" | "status">) {
  return !product.deletedAt && (product.status ?? "active") === "active";
}

export function getUnavailableProductMessage(product: Pick<Product, "deletedAt" | "name" | "status">) {
  if (product.deletedAt || product.status === "hidden" || product.status === "draft") {
    return `商品「${product.name}」目前未上架，請從購物袋移除後重新確認。`;
  }

  if (product.status === "soldout") {
    return `商品「${product.name}」目前庫存不足，請從購物袋移除後重新確認。`;
  }

  return null;
}

export function decodeStoredStockLabel(value?: string | null): { status: ProductStatus; stockLabel: string } {
  const raw = String(value ?? "").trim();

  for (const [status, prefix] of Object.entries(productStatusPrefixes) as Array<[Exclude<ProductStatus, "active">, string]>) {
    if (raw.startsWith(prefix)) {
      const stockLabel = raw.slice(prefix.length).trim() || defaultStockLabelForStatus(status);
      return { status, stockLabel };
    }
  }

  if (/售完|缺貨/i.test(raw)) {
    return { status: "soldout", stockLabel: raw || defaultStockLabelForStatus("soldout") };
  }

  return {
    status: "active",
    stockLabel: raw || defaultStockLabelForStatus("active")
  };
}

export function encodeStoredStockLabel(stockLabel: string, status: ProductStatus) {
  const clean = stripStatusPrefix(stockLabel).trim() || defaultStockLabelForStatus(status);

  if (status === "active") {
    return clean;
  }

  return `${productStatusPrefixes[status]} ${clean}`;
}

export function stripStatusPrefix(value: string) {
  return value.replace(/^\[(soldout|draft|hidden)\]\s*/i, "");
}

export function defaultStockLabelForStatus(status: ProductStatus) {
  if (status === "soldout") return "售完";
  if (status === "draft") return "草稿";
  if (status === "hidden") return "隱藏";
  return "現貨 2-5 個工作天寄出";
}
