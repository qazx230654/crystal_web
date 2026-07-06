import Link from "next/link";
import { ProductCard } from "@/components/product-card";
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
    <section className="container-shell py-14">
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-crystal-rose">All Products</p>
      <h1 className="mt-3 font-serif text-5xl font-semibold">所有商品</h1>
      {modules.product.categoryFilters ? <div className="mt-10 flex flex-wrap gap-2">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <Link
            className={`rounded-full border px-4 py-2 text-sm ${
              (!category && key === "all") || category === key
                ? "border-crystal-ink bg-crystal-ink text-white"
                : "border-crystal-line bg-white/72 text-crystal-muted"
            }`}
            href={key === "all" ? "/products" : `/products?category=${key}`}
            key={key}
          >
            {label}
          </Link>
        ))}
      </div> : null}
      <div className="mt-8 flex flex-col justify-between gap-4 border-y border-crystal-line py-4 text-sm text-crystal-muted sm:flex-row sm:items-center">
        <span>共 {products.length} 件商品</span>
        {modules.product.sortControls ? <div className="flex flex-wrap gap-2">
          {productSortOptions.map((item) => (
            <Link
              className={`rounded-full px-3 py-1.5 ${sort === item ? "bg-crystal-rose text-white" : "bg-white/72"}`}
              href={`/products?${category ? `category=${category}&` : ""}sort=${encodeURIComponent(item)}`}
              key={item}
            >
              {item}
            </Link>
          ))}
        </div> : null}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </section>
  );
}
