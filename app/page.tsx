import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { modules } from "@/config/modules";
import { categoryHighlights, customPlans } from "@/data/site";
import { listProducts } from "@/services/product-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const productList = await listProducts();

  return (
    <>
      {modules.home.hero ? <section className="container-shell grid min-h-[calc(100vh-112px)] items-center gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="fade-in">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-crystal-rose">Crystal Energy</p>
          <h1 className="mt-5 font-serif text-6xl font-semibold leading-[0.95] text-crystal-ink md:text-8xl">
            找到屬於你的
            <span className="block text-crystal-rose">能量水晶</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-crystal-muted">
            提升愛情、財運與內在平衡，從今天開始改變你的能量場。每一顆天然水晶，都是大地億萬年的結晶。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-full bg-crystal-ink px-6 py-3 text-sm font-semibold text-white" href="/products?category=monthly">
              每月限量
            </Link>
            <Link className="rounded-full border border-crystal-line bg-white/75 px-6 py-3 text-sm font-semibold text-crystal-ink" href="/custom">
              客製款
            </Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {["10,000+ 滿意顧客", "4.9 平均評分", "100% 天然水晶"].map((stat) => (
              <div className="rounded-md border border-crystal-line bg-white/64 p-4 text-sm font-semibold text-crystal-ink" key={stat}>
                {stat}
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-crystal-line bg-crystal-pearl shadow-soft">
            <Image
              alt="水晶手鍊"
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              src="https://goodaytarot.com/images/about-crystal.jpg"
            />
          </div>
          <div className="absolute -bottom-5 left-6 right-6 rounded-md border border-crystal-line bg-white/88 p-5 shadow-soft backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-crystal-rose">Today's Energy</p>
            <p className="mt-2 text-sm leading-6 text-crystal-muted">每一天都是嶄新的開始，讓水晶的能量陪伴你前行。</p>
          </div>
        </div>
      </section> : null}

      {modules.home.energyMarquee ? <section className="overflow-hidden bg-crystal-ink py-3 text-sm font-medium text-crystal-cream">
        <div className="marquee-track flex w-max gap-12">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index}>天然水晶 · 能量淨化 · 手工設計 · 正緣桃花 · 招財轉運 · 情緒療癒 ·</span>
          ))}
        </div>
      </section> : null}

      {modules.home.categoryHighlights ? <section className="container-shell py-20">
        <div className="grid gap-4 md:grid-cols-4">
          {categoryHighlights.map((item) => (
            <Link className="rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft transition hover:-translate-y-1" href={item.href} key={item.title}>
              <item.icon className="text-crystal-rose" size={26} />
              <h3 className="mt-8 text-xs font-bold uppercase tracking-[0.26em] text-crystal-muted">{item.title}</h3>
              <p className="mt-2 text-2xl font-semibold">{item.label}</p>
            </Link>
          ))}
        </div>
      </section> : null}

      {modules.home.featuredProducts ? <section className="container-shell py-8">
        <SectionHeading eyebrow="Featured Products" title="人氣熱銷" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {productList.slice(0, 8).map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link className="inline-flex items-center gap-2 rounded-full bg-crystal-ink px-6 py-3 text-sm font-semibold text-white" href="/products">
            查看全部商品 <ArrowRight size={16} />
          </Link>
        </div>
      </section> : null}

      {modules.home.customAndBestSellers ? <section className="container-shell grid gap-6 py-20 md:grid-cols-2">
        <div className="rounded-md border border-crystal-line bg-white/72 p-8 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-crystal-rose">Custom Crystal</p>
          <h3 className="mt-3 text-3xl font-semibold">想要專屬定制？</h3>
          <p className="mt-4 leading-7 text-crystal-muted">根據你的需求量身打造，提供塔羅、脈輪、生命靈數等多種客製化方案。</p>
          <Link className="mt-8 inline-flex items-center gap-2 rounded-full border border-crystal-line px-5 py-3 text-sm font-semibold" href="/custom">
            了解客製化方案 <ArrowRight size={15} />
          </Link>
        </div>
        <div className="rounded-md border border-crystal-line bg-crystal-ink p-8 text-white shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-crystal-blush">Best Sellers</p>
          <h3 className="mt-3 text-3xl font-semibold">經典熱銷系列</h3>
          <div className="mt-8 grid gap-3">
            {customPlans.slice(0, 3).map((plan) => (
              <div className="flex items-center gap-3" key={plan.code}>
                <Star className="text-crystal-blush" size={16} />
                <span>{plan.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section> : null}
    </>
  );
}
