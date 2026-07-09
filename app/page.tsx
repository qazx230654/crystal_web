import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { FeaturedProductsCarousel } from "@/components/featured-products-carousel";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { modules } from "@/config/modules";
import { categoryHighlights, customPlans } from "@/data/site";
import { listProducts } from "@/services/product-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const productList = await listProducts();

  return (
    <>
      {modules.home.hero ? <section className="hero-stage relative isolate overflow-hidden">
        <div className="hero-ambient" aria-hidden="true">
          <span className="hero-veil hero-veil-one" />
          <span className="hero-veil hero-veil-two" />
          <span className="hero-lattice" />
          <span className="hero-cut hero-cut-one" />
          <span className="hero-cut hero-cut-two" />
        </div>

        <div className="container-shell relative z-10 grid min-h-[calc(100vh-112px)] items-center gap-12 py-20 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="luxury-reveal">
            <p className="luxury-eyebrow">Energy Atelier</p>
            <h1 className="mt-5 font-serif text-[2.65rem] font-semibold leading-[1.08] text-crystal-ink md:text-6xl">
              與你的頻率相遇
              <span className="block text-crystal-gold">
                讓晶石
                <span className="block">成為日常光感</span>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-8 text-crystal-muted">
              以天然晶石承載愛情、財運與內在安定的祈願，為每一天選一段更靠近自己的能量節奏。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/products?category=monthly">探索限量作品</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/custom">預約專屬配置</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {["10,000+ 滿意顧客", "4.9 平均評分", "100% 天然晶石"].map((stat) => (
                <div className="rounded-md border border-crystal-champagne/70 bg-white/64 p-4 text-sm font-semibold text-crystal-ink shadow-[0_14px_34px_rgba(90,65,55,0.06)] backdrop-blur" key={stat}>
                  {stat}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="hero-image-frame relative aspect-[4/5] overflow-hidden rounded-md border border-crystal-champagne/70 bg-crystal-pearl shadow-soft">
              <Image
                alt="水晶手鍊"
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                src="https://goodaytarot.com/images/about-crystal.jpg"
              />
            </div>
            <div className="absolute -bottom-5 left-6 right-6 rounded-md border border-crystal-champagne/70 bg-white/88 p-5 shadow-soft backdrop-blur">
              <p className="luxury-eyebrow">Daily Alignment</p>
              <p className="mt-2 text-sm leading-6 text-crystal-muted">讓晶石的光澤，安靜提醒你回到最適合自己的步調。</p>
            </div>
          </div>
        </div>
      </section> : null}

      {modules.home.energyMarquee ? <section className="overflow-hidden bg-crystal-ink py-3 text-sm font-medium text-crystal-cream">
        <div className="marquee-track flex w-max gap-12">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index}>天然晶石 · 溫柔淨化 · 手作配置 · 關係祝福 · 豐盛流動 · 內在安定 ·</span>
          ))}
        </div>
      </section> : null}

      {modules.home.categoryHighlights ? <section className="home-panel home-panel-gold relative isolate overflow-hidden py-20">
        <div className="home-panel-ambient" aria-hidden="true" />
        <div className="container-shell relative z-10">
          <div className="grid gap-4 md:grid-cols-4">
            {categoryHighlights.map((item) => (
              <Link className="rounded-md luxury-surface p-6 transition duration-500 hover:-translate-y-1" href={item.href} key={item.title}>
                <item.icon className="text-crystal-gold" size={26} />
                <h3 className="mt-8 text-[11px] font-bold uppercase tracking-[0.24em] text-crystal-muted">{item.title}</h3>
                <p className="mt-2 font-serif text-xl font-semibold">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section> : null}

      {modules.home.featuredProducts ? <section className="home-panel home-panel-crystal relative isolate overflow-hidden py-20">
        <div className="home-panel-ambient" aria-hidden="true" />
        <div className="container-shell relative z-10">
          <FeaturedProductsCarousel products={productList.slice(0, 8)} />
          <div className="mt-10 text-center">
            <Button asChild size="lg">
              <Link href="/products">
                查看全部商品 <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section> : null}

      {modules.home.customAndBestSellers ? <section className="home-panel home-panel-ink relative isolate overflow-hidden py-20">
        <div className="home-panel-ambient" aria-hidden="true" />
        <div className="container-shell relative z-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-md luxury-surface p-8">
            <p className="luxury-eyebrow">Bespoke Energy</p>
            <h3 className="mt-3 font-serif text-2xl font-semibold md:text-3xl">配置專屬於您的頻率</h3>
            <p className="mt-4 leading-7 text-crystal-muted">從想靠近的狀態出發，依照功效、色系與配戴習慣，整理成能長久陪伴的晶石作品。</p>
            <Button asChild className="mt-8" variant="outline">
              <Link href="/custom">
                查看客製流程 <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
          <div className="rounded-md border border-crystal-gold/35 bg-crystal-ink/92 p-8 text-white shadow-soft backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-crystal-blush">Best Sellers</p>
            <h3 className="mt-3 font-serif text-2xl font-semibold md:text-3xl">經典熱銷系列</h3>
            <div className="mt-8 grid gap-3">
              {customPlans.slice(0, 3).map((plan) => (
                <div className="flex items-center gap-3" key={plan.code}>
                  <Star className="text-crystal-champagne" size={16} />
                  <span>{plan.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> : null}
    </>
  );
}
