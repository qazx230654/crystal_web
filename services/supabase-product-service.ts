import type { Category, ProductStatus } from "@/src/domain/product";
import { productRepository, type ProductInsertRecord, type ProductUpdateRecord } from "@/repositories/product-repository";
import { decodeStoredStockLabel, encodeStoredStockLabel } from "@/services/product-status";

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
  stockQuantity?: number | null;
};

export async function createSupabaseProduct(input: SupabaseProductInput) {
  const slug = normalizeSlug(input.slug || input.name);
  const payload: ProductInsertRecord = {
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
    stock_quantity: input.stockQuantity ?? null,
    sales: 0,
    created_at: new Date().toISOString().slice(0, 10)
  };

  return productRepository.createProduct(payload);
}

export async function updateSupabaseProduct(id: string, input: SupabaseProductInput) {
  const slug = normalizeSlug(input.slug || input.name);
  const payload: ProductUpdateRecord = {
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
    stock_quantity: input.stockQuantity ?? null
  };

  const product = await productRepository.updateProduct(id, payload);

  if (!product) {
    throw new Error("找不到要更新的商品。");
  }

  return product;
}

export async function updateSupabaseProductStatus(id: string, status: ProductStatus) {
  const current = await productRepository.getProductStockLabel(id);

  if (!current) {
    throw new Error("找不到要更新的商品。");
  }

  const parsed = decodeStoredStockLabel(current.stock_label);
  const updated = await productRepository.updateProductStockLabel(id, encodeStoredStockLabel(parsed.stockLabel, status));

  return updated;
}

export async function archiveSupabaseProduct(id: string) {
  const product = await productRepository.archiveProduct(id);

  if (!product) {
    throw new Error("找不到要封存的商品。");
  }

  return product;
}

export async function restoreSupabaseProduct(id: string) {
  const product = await productRepository.restoreProduct(id);

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
