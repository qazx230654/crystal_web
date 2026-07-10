import type { ProductStatus } from "@/src/domain/product";
import type { ProductFormState, ProductOptions } from "./product-editor-sections";

export type StockType = "instock" | "limited";

export function buildStockLabel(stockType: StockType, stockDays: string) {
  const days = String(Math.max(1, Math.floor(Number(stockDays)) || 1));
  return stockType === "limited" ? `限量商品 ${days} 個工作天寄出` : `現貨 ${days} 個工作天寄出`;
}

export function parseStockLabel(label: string): { stockDays: string; stockType: StockType } {
  const stockType: StockType = label.includes("限量") ? "limited" : "instock";
  const match = label.match(/\d+/);
  return { stockDays: match ? match[0] : "3", stockType };
}

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string[];
  minerals: string[];
  benefits: string[];
  image: string;
  images?: string[];
  description: string;
  stockLabel: string;
  deletedAt?: string | null;
  status?: ProductStatus;
};

export type ProductPayload = {
  data: AdminProduct[];
  meta: {
    options: ProductOptions;
  };
};

export type SingleProductPayload = {
  data: AdminProduct;
};

export type ErrorPayload = {
  error?: {
    message?: string;
  };
};

export const defaultFormState: ProductFormState = {
  benefits: [],
  category: [],
  customBenefits: "",
  customMinerals: "",
  description: "",
  image: "",
  images: [],
  minerals: [],
  name: "",
  originalPrice: "",
  price: "",
  slug: "",
  status: "active",
  stockDays: "3",
  stockLabel: buildStockLabel("instock", "3"),
  stockType: "instock"
};

export function parseProductList(value: string) {
  return value
    .split(/\n|,|，|、/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isOptionsPayload(payload: ProductPayload | ErrorPayload | null): payload is ProductPayload {
  return Boolean(payload && "data" in payload && "meta" in payload);
}

export function isSingleProductPayload(payload: SingleProductPayload | ErrorPayload | null): payload is SingleProductPayload {
  return Boolean(payload && "data" in payload);
}

export function validateProductForm(input: {
  formState: ProductFormState;
  hasMainImageFile: boolean;
}) {
  const { formState } = input;

  if (!formState.name.trim()) return "請輸入商品名稱";
  if (!formState.price || Number(formState.price) <= 0) return "請輸入正確的折扣價格";
  if (formState.originalPrice && Number(formState.originalPrice) < Number(formState.price)) return "原價不可低於折扣價格";
  if (!formState.category.length) return "請至少勾選一個分類";
  if (!formState.minerals.length && !parseProductList(formState.customMinerals).length) return "請至少勾選或輸入一種礦石";
  if (!formState.description.trim()) return "請輸入商品描述";
  if (!formState.stockDays || Number(formState.stockDays) <= 0) return "請輸入預計出貨天數";
  if (!formState.image && !input.hasMainImageFile) return "請上傳商品主圖";
  return null;
}
