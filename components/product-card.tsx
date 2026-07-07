"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/components/cart-context";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const soldOut = product.status === "soldout";

  return (
    <article className="group overflow-hidden rounded-md border border-crystal-line bg-white/75 shadow-[0_10px_30px_rgba(90,65,55,0.06)] transition hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-crystal-pearl">
          <Image
            alt={product.name}
            className="object-cover transition duration-500 group-hover:scale-105"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            src={product.image}
          />
          <button
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-crystal-ink shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
            disabled={soldOut}
            onClick={(event) => {
              event.preventDefault();
              if (soldOut) return;
              addItem(product);
            }}
            title={soldOut ? "商品售完" : "加入購物袋"}
            type="button"
          >
            <ShoppingBag size={17} />
          </button>
          {soldOut ? <span className="absolute bottom-3 left-3 bg-crystal-ink/88 px-3 py-1 text-[11px] font-semibold text-white">售完展示</span> : null}
        </div>
        <div className="p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {[...product.minerals, ...product.benefits].slice(0, 5).map((tag) => (
              <span className="rounded-full bg-crystal-pearl px-2.5 py-1 text-[11px] text-crystal-muted" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <h3 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-crystal-ink">{product.name}</h3>
          <div className="mt-3 flex items-baseline gap-2">
            {product.originalPrice ? (
              <span className="text-sm text-crystal-muted line-through">NT$ {product.originalPrice.toLocaleString()}</span>
            ) : null}
            <span className="font-semibold text-crystal-rose">NT$ {product.price.toLocaleString()}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
