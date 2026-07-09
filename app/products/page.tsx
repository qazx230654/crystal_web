import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductSortSelect } from "@/components/product-sort-select";
import { modules } from "@/config/modules";
import { categoryLabels, type Category } from "@/data/products";
import { listProducts, productSortOptions } from "@/services/product-service";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { category?: Category; sort?: string };
}) {
  const category = searchParams.category;
  const sort = searchParams.sort ?? "銷售量";
  const products = await listProducts({ category, sort });

  return (
    <section className="bg-white/72 py-14">
      <div className="container-shell">
        <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-crystal-muted">All Products</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-normal text-crystal-ink md:text-5xl">所有商品</h1>
      </div>
      <div className="mt-10 border-y border-crystal-line bg-white/82">
        <div className="container-shell">
          {modules.product.categoryFilters ? (
            <div className="flex gap-6 overflow-x-auto py-5 text-xs text-crystal-muted">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const active = (!category && key === "all") || category === key;

                return (
                  <Link
                    className={`shrink-0 border-b px-1 pb-2 transition hover:border-crystal-gold hover:text-crystal-ink ${
                      active ? "border-crystal-ink text-crystal-ink" : "border-transparent"
                    }`}
                    href={key === "all" ? "/products" : `/products?category=${key}`}
                    key={key}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
      <div className="container-shell">
        <div className="flex flex-col justify-between gap-4 border-b border-crystal-line py-5 text-xs text-crystal-muted sm:flex-row sm:items-center">
          <span>共 {products.length} 件商品</span>
          {modules.product.sortControls ? <ProductSortSelect category={category} options={productSortOptions} value={sort} /> : null}
        </div>
        <div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
