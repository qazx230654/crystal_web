import { mockProducts } from "@/data/mock-products";
import { categoryLabels, type Category, type Product } from "@/data/product-types";
import { decodeStoredStockLabel } from "@/services/product-status";
import { SupabaseConfigError, supabaseRest } from "@/services/supabase-rest";

type SupabaseProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  original_price: number | null;
  category: string[] | null;
  minerals: string[] | null;
  benefits: string[] | null;
  image: string | null;
  images: string[] | null;
  description: string | null;
  stock_label: string | null;
  sales: number | null;
  created_at: string | null;
};

export const products = mockProducts;

export async function getProducts(options?: { includeInactive?: boolean }): Promise<Product[]> {
  const source = getProductSource();

  if (source !== "supabase") {
    return filterVisible(mockProducts, options?.includeInactive);
  }

  try {
    const rows = await supabaseRest<SupabaseProductRow[]>("products", {
      query: "?select=*&order=created_at.desc.nullslast"
    });
    const normalized = rows.map(normalizeSupabaseProduct).filter(Boolean) as Product[];
    return filterVisible(normalized, options?.includeInactive);
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      return filterVisible(mockProducts, options?.includeInactive);
    }

    console.error("[products] Failed to load Supabase products. Falling back to mock data.", error);
    return filterVisible(mockProducts, options?.includeInactive);
  }
}

export async function getProduct(slug: string, options?: { includeInactive?: boolean }): Promise<Product> {
  const productList = await getProducts(options);
  return productList.find((product) => product.slug === slug) ?? productList[0] ?? mockProducts[0];
}

export function getProductSource() {
  if (process.env.PRODUCT_SOURCE === "mock") return "mock";
  if (process.env.PRODUCT_SOURCE === "supabase") return "supabase";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "supabase";
  }

  return "mock";
}

function normalizeSupabaseProduct(row: SupabaseProductRow): Product | null {
  if (!row.slug || !row.name || !row.price) return null;

  const parsedStatus = decodeStoredStockLabel(row.stock_label);
  const images = row.images?.length ? row.images.filter(Boolean) : row.image ? [row.image] : [];
  const image = row.image ?? images[0];

  if (!image) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    category: normalizeCategoryList(row.category),
    minerals: normalizeList(row.minerals),
    benefits: normalizeList(row.benefits),
    image,
    images,
    description: row.description ?? "",
    stockLabel: parsedStatus.stockLabel,
    sales: Number(row.sales ?? 0),
    createdAt: row.created_at ?? new Date().toISOString().slice(0, 10),
    status: parsedStatus.status
  };
}

function normalizeList(value: string[] | null) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeCategoryList(value: string[] | null): Category[] {
  return normalizeList(value).filter((item): item is Category => item in categoryLabels && item !== "all");
}

function filterVisible(productsToFilter: Product[], includeInactive?: boolean) {
  if (includeInactive) return productsToFilter;

  return productsToFilter.filter((product) => {
    const status = product.status ?? "active";
    return status === "active" || status === "soldout";
  });
}
