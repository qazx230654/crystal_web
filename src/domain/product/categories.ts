import type { Category } from "@/src/domain/product/types";

export const productCategoryLabels: Record<Category | "all", string> = {
  all: "全部商品",
  monthly: "每月限量",
  love: "愛情",
  wealth: "財運",
  protect: "能量",
  healing: "治癒",
  necklace: "項鍊",
  charm: "吊飾",
  perfume: "香氛",
  other: "其他"
};

export const productCategoryOptions = Object.entries(productCategoryLabels).map(([value, label]) => ({
  label,
  value
}));

export const adminProductCategoryOptions = productCategoryOptions.filter((item) => item.value !== "all");

export function isProductCategory(value: string): value is Category {
  return value in productCategoryLabels && value !== "all";
}
