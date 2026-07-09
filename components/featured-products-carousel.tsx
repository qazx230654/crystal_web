"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/src/domain/product";

export function FeaturedProductsCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCards(direction: "next" | "prev") {
    const track = trackRef.current;
    const firstCard = track?.querySelector<HTMLElement>("[data-carousel-card]");
    if (!track || !firstCard) return;

    const gap = 20;
    const distance = (firstCard.offsetWidth + gap) * 2;
    const nextLeft = direction === "next" ? track.scrollLeft + distance : track.scrollLeft - distance;
    const reachedEnd = direction === "next" && nextLeft >= track.scrollWidth - track.clientWidth - 8;

    track.scrollTo({
      behavior: "smooth",
      left: reachedEnd ? 0 : Math.max(0, nextLeft)
    });
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      scrollByCards("next");
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="luxury-eyebrow">Featured Products</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-crystal-ink md:text-4xl">人氣熱銷</h2>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            aria-label="上一組人氣商品"
            className="grid size-9 place-items-center border border-crystal-line bg-white/40 text-crystal-ink transition hover:border-crystal-gold hover:bg-crystal-champagne/25"
            onClick={() => scrollByCards("prev")}
            type="button"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="下一組人氣商品"
            className="grid size-9 place-items-center border border-crystal-line bg-white/40 text-crystal-ink transition hover:border-crystal-gold hover:bg-crystal-champagne/25"
            onClick={() => scrollByCards("next")}
            type="button"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
        ref={trackRef}
      >
        {products.map((product) => (
          <div
            className="featured-carousel-card h-[420px] snap-start"
            data-carousel-card
            key={product.id}
          >
            <ProductCard
              className="h-full"
              mediaClassName="aspect-auto h-[300px] lg:h-[320px]"
              product={product}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
