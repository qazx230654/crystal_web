import Image from "next/image";
import Link from "next/link";
import { ProductPurchase } from "@/components/product-purchase";
import { SectionHeading } from "@/components/section-heading";
import { modules } from "@/config/modules";
import { findProduct, listRelatedProducts } from "@/services/product-service";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, related] = await Promise.all([
    findProduct(params.slug),
    listRelatedProducts(params.slug)
  ]);

  return (
    <section className="container-shell py-12">
      <div className="mb-8 text-sm text-crystal-muted">
        <Link href="/products">所有商品</Link>
        <span className="px-2">/</span>
        <span>{product.name}</span>
      </div>
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-4">
          <div className="relative aspect-square overflow-hidden rounded-md border border-crystal-line bg-crystal-pearl shadow-soft">
            <Image alt={product.name} fill priority className="object-cover" src={product.images?.[0] ?? product.image} sizes="(min-width:1024px) 48vw, 100vw" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(product.images ?? [product.image]).map((image, index) => (
              <div className="relative aspect-square overflow-hidden rounded-md border border-crystal-line bg-white" key={image}>
                <Image alt={`${product.name} 圖片 ${index + 1}`} fill className="object-cover" src={image} sizes="120px" />
              </div>
            ))}
          </div>
        </div>
        {modules.product.purchaseOptions ? <ProductPurchase product={product} /> : null}
      </div>

      <section className="mt-16 grid gap-4 md:grid-cols-4">
        {["功效說明", "商品內容", "保固與維修", "手圍測量"].map((tab, index) => (
          <article className="rounded-md border border-crystal-line bg-white/72 p-5" key={tab}>
            <h3 className="font-semibold">{tab}</h3>
            <p className="mt-3 text-sm leading-7 text-crystal-muted">
              {index === 0
                ? product.description
                : index === 1
                  ? `${product.minerals.join("、")}。商品會因手圍不同而有些微變化。`
                  : index === 2
                    ? "三個月內免費保固一次，包含換線、五金汰換與損壞維修。"
                    : "請用皮尺平貼在想戴手鍊的位置，繞一圈即為淨手圍。"}
            </p>
          </article>
        ))}
      </section>

      {modules.product.relatedProducts ? <section className="mt-20">
        <SectionHeading eyebrow="You May Also Like" title="相關商品" />
        <div className="grid gap-5 sm:grid-cols-2">
          {related.map((item) => (
            <Link className="flex gap-4 rounded-md border border-crystal-line bg-white/72 p-4" href={`/products/${item.slug}`} key={item.id}>
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md">
                <Image alt={item.name} fill className="object-cover" src={item.image} sizes="96px" />
              </div>
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="mt-2 text-crystal-rose">NT$ {item.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section> : null}
    </section>
  );
}
