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

export async function createSupabaseProduct(input: {
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
}) {
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

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "");
}
