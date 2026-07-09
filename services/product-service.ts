import { findProductBySlug, getProduct, getProducts } from "@/data/products";
import { productCategoryLabels, type Category, type Product } from "@/src/domain/product";

export const productSortOptions = ["銷售量", "價格低到高", "價格高到低", "最新商品"] as const;

export type ProductSort = (typeof productSortOptions)[number];

export type ProductQuery = {
  category?: Category;
  includeInactive?: boolean;
  sort?: string;
};

export type CategorySummary = {
  id: Category | "all";
  label: string;
  count: number;
};

export async function listProducts(query: ProductQuery = {}) {
  const products = await getProducts({ includeInactive: query.includeInactive });
  return sortProducts(filterProducts(products, query.category), query.sort);
}

export async function findProduct(slug: string) {
  return getProduct(slug);
}

export async function findProductStrict(slug: string, options?: { includeInactive?: boolean }) {
  return findProductBySlug(slug, options);
}

export async function listRelatedProducts(slug: string, limit = 2) {
  const [product, products] = await Promise.all([findProduct(slug), getProducts()]);
  return products.filter((item) => item.id !== product.id).slice(0, limit);
}

export async function listCategories(): Promise<CategorySummary[]> {
  const products = await getProducts();

  return Object.entries(productCategoryLabels).map(([id, label]) => ({
    id: id as Category | "all",
    label,
    count:
      id === "all"
        ? products.length
        : products.filter((product) => product.category.includes(id as Category)).length
  }));
}

function filterProducts(products: Product[], category?: Category) {
  return category ? products.filter((product) => product.category.includes(category)) : products;
}

function sortProducts(products: Product[], sort = "銷售量") {
  return [...products].sort((a, b) => {
    if (sort === "價格低到高") return a.price - b.price;
    if (sort === "價格高到低") return b.price - a.price;
    if (sort === "最新商品") return b.createdAt.localeCompare(a.createdAt);
    return b.sales - a.sales;
  });
}
