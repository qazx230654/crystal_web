import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { modules } from "@/config/modules";
import { findProduct, listRelatedProducts } from "@/services/product-service";
import { ProductInfoTabs } from "./product-info-tabs";

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

      <section className="mt-16">
        <ProductInfoTabs product={product} />
      </section>

      {modules.product.relatedProducts ? <section className="mt-20">
        <SectionHeading eyebrow="You May Also Like" title="相關商品" />
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item, index) => (
            <Reveal delay={(index % 4) * 80} key={item.id}>
              <ProductCard product={item} />
            </Reveal>
          ))}
        </div>
      </section> : null}
    </section>
  );
}
