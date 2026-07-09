"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isProductSellable, type Product } from "@/src/domain/product";

export function ProductCard({
  className,
  mediaClassName,
  product
}: {
  className?: string;
  mediaClassName?: string;
  product: Product;
}) {
  const { addItem } = useCart();
  const soldOut = !isProductSellable(product);

  return (
    <article className={cn("group overflow-hidden bg-transparent", className)}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className={cn("relative aspect-4/5 overflow-hidden bg-crystal-pearl", mediaClassName)}>
          <Image
            alt={product.name}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            src={product.image}
          />
          <Button
            className="absolute right-3 top-3 border-crystal-gold/35 bg-white/90 text-crystal-ink hover:bg-crystal-champagne/40 disabled:cursor-not-allowed"
            disabled={soldOut}
            onClick={(event) => {
              event.preventDefault();
              if (soldOut) return;
              addItem(product);
            }}
            size="icon"
            title={soldOut ? "商品售完" : "加入購物袋"}
            type="button"
            variant="outline"
          >
            <ShoppingBag size={17} />
          </Button>
          {soldOut ? <span className="absolute bottom-3 left-3 border border-crystal-gold/35 bg-white/90 px-3 py-1 text-[11px] font-semibold text-crystal-muted">售完展示</span> : null}
        </div>
        <div className="pt-3">
          <div className="mb-3 overflow-x-auto no-scrollbar">
            <div className="flex w-max gap-1.5">
              {[...product.minerals, ...product.benefits]
                .slice(0, 5)
                .map((tag) => (
                  <span
                    key={tag}
                    className="shrink-0 border border-crystal-line bg-white/35 px-2.5 py-1 text-[11px] leading-none text-crystal-muted"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
          <h3 className="line-clamp-2 min-h-1 text-[13px] font-semibold leading-5 text-crystal-ink">{product.name}</h3>
          <div className="mt-2 flex items-baseline gap-5">
            {product.originalPrice ? (
              <span className="text-xs text-crystal-muted line-through">NT$ {product.originalPrice.toLocaleString()}</span>
            ) : null}
            <span className="text-[13px] font-medium text-crystal-ink">NT$ {product.price.toLocaleString()}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
