import type { Category, ProductStatus } from "@/data/product-types";
import { decodeStoredStockLabel, encodeStoredStockLabel } from "@/services/product-status";
import { supabaseRest } from "@/services/supabase-rest";

type SupabaseProductInsert = {
  slug: string;
  name: string;
  price: number;
  original_price?: number | null;
  category: Category[];
  minerals: string[];
  benefits: string[];
  image: string;
  images: string[];
  description?: string;
  stock_label: string;
  sales?: number;
  created_at?: string;
};

type SupabaseProductUpdate = Omit<SupabaseProductInsert, "created_at" | "sales">;

export type SupabaseProductInput = {
  benefits: string[];
  category: Category[];
  description: string;
  image: string;
  images: string[];
  minerals: string[];
  name: string;
  originalPrice?: number;
  price: number;
  slug?: string;
  status: ProductStatus;
  stockLabel: string;
};

export async function createSupabaseProduct(input: SupabaseProductInput) {
  const slug = normalizeSlug(input.slug || input.name);
  const payload: SupabaseProductInsert = {
    slug,
    name: input.name.trim(),
    price: Number(input.price),
    original_price: input.originalPrice ? Number(input.originalPrice) : null,
    category: input.category,
    minerals: input.minerals,
    benefits: input.benefits,
    image: input.image.trim(),
    images: input.images.length ? input.images : [input.image.trim()],
    description: input.description.trim(),
    stock_label: encodeStoredStockLabel(input.stockLabel, input.status),
    sales: 0,
    created_at: new Date().toISOString().slice(0, 10)
  };

  const [product] = await supabaseRest<Array<{ id: string } & SupabaseProductInsert>>("products", {
    body: payload,
    method: "POST"
  });

  return product;
}

export async function updateSupabaseProduct(id: string, input: SupabaseProductInput) {
  const slug = normalizeSlug(input.slug || input.name);
  const payload: SupabaseProductUpdate = {
    slug,
    name: input.name.trim(),
    price: Number(input.price),
    original_price: input.originalPrice ? Number(input.originalPrice) : null,
    category: input.category,
    minerals: input.minerals,
    benefits: input.benefits,
    image: input.image.trim(),
    images: input.images.length ? input.images : [input.image.trim()],
    description: input.description.trim(),
    stock_label: encodeStoredStockLabel(input.stockLabel, input.status)
  };

  const [product] = await supabaseRest<Array<{ id: string } & SupabaseProductUpdate>>("products", {
    body: payload,
    method: "PATCH",
    query: `?id=eq.${encodeURIComponent(id)}`
  });

  if (!product) {
    throw new Error("找不到要更新的商品。");
  }

  return product;
}

export async function updateSupabaseProductStatus(id: string, status: ProductStatus) {
  const [current] = await supabaseRest<Array<{ id: string; stock_label: string | null }>>("products", {
    query: `?id=eq.${encodeURIComponent(id)}&select=id,stock_label`
  });

  if (!current) {
    throw new Error("找不到要更新的商品。");
  }

  const parsed = decodeStoredStockLabel(current.stock_label);
  const [updated] = await supabaseRest<Array<{ id: string; stock_label: string | null }>>("products", {
    body: { stock_label: encodeStoredStockLabel(parsed.stockLabel, status) },
    method: "PATCH",
    query: `?id=eq.${encodeURIComponent(id)}`
  });

  return updated;
}

export async function archiveSupabaseProduct(id: string) {
  const [product] = await supabaseRest<Array<{ id: string; deleted_at: string | null }>>("products", {
    body: { deleted_at: new Date().toISOString() },
    method: "PATCH",
    query: `?id=eq.${encodeURIComponent(id)}`
  });

  if (!product) {
    throw new Error("找不到要封存的商品。");
  }

  return product;
}

export async function restoreSupabaseProduct(id: string) {
  const [product] = await supabaseRest<Array<{ id: string; deleted_at: string | null }>>("products", {
    body: { deleted_at: null },
    method: "PATCH",
    query: `?id=eq.${encodeURIComponent(id)}`
  });

  if (!product) {
    throw new Error("找不到要解除封存的商品。");
  }

  return product;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "");
}
