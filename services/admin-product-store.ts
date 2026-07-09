import { promises as fs } from "node:fs";
import path from "node:path";
import {
  defaultBenefitOptions,
  defaultMineralOptions,
  productCategoryLabels,
  productStatusLabels,
  sortProductTags,
  type Category,
  type Product,
  type ProductStatus
} from "@/src/domain/product";

const adminProductsFile = path.join(process.cwd(), "data", "admin-products.json");

export type AdminManagedProduct = Product & {
  status: ProductStatus;
  updatedAt: string;
};

export type ProductFormInput = {
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

export async function readAdminProducts(): Promise<AdminManagedProduct[]> {
  try {
    const text = await fs.readFile(adminProductsFile, "utf8");
    const payload = JSON.parse(text) as AdminManagedProduct[];
    return Array.isArray(payload) ? payload : [];
  } catch (error: unknown) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "ENOENT") return [];
    throw error;
  }
}

export async function createAdminProduct(input: ProductFormInput) {
  const records = await readAdminProducts();
  const now = new Date().toISOString();
  const slug = normalizeSlug(input.slug || input.name);

  if (records.some((item) => item.slug === slug)) {
    throw new Error("已有相同 slug 的商品，請更換商品名稱或自訂 slug。");
  }

  const product: AdminManagedProduct = {
    id: `admin-${Date.now()}`,
    slug,
    name: input.name.trim(),
    price: Number(input.price),
    originalPrice: input.originalPrice ? Number(input.originalPrice) : undefined,
    category: input.category,
    minerals: input.minerals,
    benefits: input.benefits,
    image: input.image.trim(),
    images: input.images.length ? input.images : [input.image.trim()],
    description: input.description.trim(),
    stockLabel: input.stockLabel.trim(),
    sales: 0,
    createdAt: now,
    status: input.status,
    updatedAt: now
  };

  records.unshift(product);
  await saveAdminProducts(records);
  return product;
}

export async function updateAdminProductStatus(id: string, status: ProductStatus, seedProduct?: Product) {
  const records = await readAdminProducts();
  let target = records.find((item) => item.id === id);

  if (!target && seedProduct) {
    target = {
      ...seedProduct,
      status,
      updatedAt: new Date().toISOString()
    };
    records.unshift(target);
  }

  if (!target) {
    throw new Error("找不到要更新的商品。");
  }

  target.status = status;
  target.updatedAt = new Date().toISOString();
  await saveAdminProducts(records);
  return target;
}

export function getProductFormOptions(products: Product[]) {
  const mineralSet = new Set<string>();
  const benefitSet = new Set<string>();

  products.forEach((product) => {
    product.minerals.forEach((item) => mineralSet.add(item));
    product.benefits.forEach((item) => benefitSet.add(item));
  });

  return {
    benefits: sortProductTags([...defaultBenefitOptions, ...Array.from(benefitSet)]),
    categories: productCategoryLabels,
    minerals: sortProductTags([...defaultMineralOptions, ...Array.from(mineralSet)]),
    statuses: productStatusLabels
  };
}

async function saveAdminProducts(records: AdminManagedProduct[]) {
  await fs.writeFile(adminProductsFile, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "");
}
