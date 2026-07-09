import { categoryLabels, productStatusLabels, type Category, type ProductStatus } from "@/data/product-types";

export type { Category, ProductStatus };

export const productCategoryLabels = categoryLabels;
export const productStatusDomainLabels = productStatusLabels;

export const productStatusColors: Record<ProductStatus | "archived", string> = {
  active: "bg-emerald-50 text-emerald-700",
  soldout: "bg-red-50 text-red-700",
  draft: "bg-slate-100 text-slate-700",
  hidden: "bg-zinc-100 text-zinc-700",
  archived: "border border-amber-200 bg-amber-50 text-amber-800"
};

export function getProductStatusLabel(status?: string | null) {
  if (!status) return "上架中";
  return status in productStatusDomainLabels ? productStatusDomainLabels[status as ProductStatus] : status;
}

export function getProductStatusColor(status?: string | null) {
  return status && status in productStatusColors
    ? productStatusColors[status as ProductStatus | "archived"]
    : productStatusColors.active;
}
