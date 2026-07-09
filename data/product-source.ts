import { mockProducts } from "@/data/mock-products";
import {
  decodeStoredStockLabel,
  isProductCategory,
  isProductVisible,
  type Category,
  type Product
} from "@/src/domain/product";
import { productRepository, type SupabaseProductRow } from "@/repositories/product-repository";
import { SupabaseConfigError } from "@/services/supabase-rest";

export const products = mockProducts;

export async function getProducts(options?: { includeInactive?: boolean }): Promise<Product[]> {
  const source = getProductSource();

  if (source !== "supabase") {
    return filterVisible(mockProducts, options?.includeInactive);
  }

  try {
    const rows = await productRepository.listProducts();
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

export async function findProductBySlug(slug: string, options?: { includeInactive?: boolean }): Promise<Product | null> {
  const productList = await getProducts(options);
  return productList.find((product) => product.slug === slug) ?? null;
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
    deletedAt: row.deleted_at,
    status: parsedStatus.status
  };
}

function normalizeList(value: string[] | null) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeCategoryList(value: string[] | null): Category[] {
  return normalizeList(value).filter(isProductCategory);
}

function filterVisible(productsToFilter: Product[], includeInactive?: boolean) {
  if (includeInactive) return productsToFilter;

  return productsToFilter.filter(isProductVisible);
}
