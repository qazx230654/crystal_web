import { defaultStockLabelForStatus, type ProductStatus } from "@/src/domain/product";
import type { ProductFormState, ProductOptions } from "./product-editor-sections";

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
  stockLabel: defaultStockLabelForStatus("active")
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
  if (!formState.stockLabel.trim()) return "請輸入出貨或庫存文字";
  if (!formState.image && !input.hasMainImageFile) return "請上傳商品主圖";
  return null;
}
