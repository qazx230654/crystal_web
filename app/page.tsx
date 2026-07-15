import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { FeaturedProductsCarousel } from "@/components/featured-products-carousel";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { modules } from "@/config/modules";
import { shopHome } from "@/config/shop";
import { categoryHighlights, customPlans } from "@/data/site";
import { listProducts } from "@/services/product-service";

function heroDelay(ms: number): CSSProperties {
  return { "--hero-delay": `${ms}ms` } as CSSProperties;
}

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
          <div>
            <p className="luxury-eyebrow hero-fade" style={heroDelay(0)}>{shopHome.hero.eyebrow}</p>
            <h1 className="mt-5 font-serif text-[2.65rem] font-semibold leading-[1.08] text-crystal-ink hero-fade md:text-6xl" style={heroDelay(120)}>
              {shopHome.hero.titleLines.map((line) => (
                <span className="block" key={line}>{line}</span>
              ))}
              <span className="block text-crystal-gold">
                {shopHome.hero.accentLines.map((line) => (
                  <span className="block" key={line}>{line}</span>
                ))}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-8 text-crystal-muted hero-fade" style={heroDelay(280)}>
              {shopHome.hero.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 hero-fade" style={heroDelay(420)}>
              <Button asChild size="lg">
                <Link href={shopHome.hero.primaryCta.href}>{shopHome.hero.primaryCta.label}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={shopHome.hero.secondaryCta.href}>{shopHome.hero.secondaryCta.label}</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 hero-fade" style={heroDelay(540)}>
              {shopHome.hero.stats.map((stat) => (
                <div className="rounded-md border border-crystal-champagne/70 bg-white/64 p-4 text-sm font-semibold text-crystal-ink shadow-[0_14px_34px_rgba(90,65,55,0.06)] backdrop-blur" key={stat}>
                  {stat}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="hero-image-frame hero-visual-reveal relative aspect-4/5 overflow-hidden rounded-md border border-crystal-champagne/70 bg-crystal-pearl shadow-soft" style={heroDelay(180)}>
              <Image
                alt={shopHome.hero.banner.alt}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                src={shopHome.hero.banner.src}
              />
            </div>
            <div className="absolute -bottom-5 left-6 right-6 rounded-md border border-crystal-champagne/70 bg-white/88 p-5 shadow-soft backdrop-blur hero-fade" style={heroDelay(620)}>
              <p className="luxury-eyebrow">{shopHome.hero.note.eyebrow}</p>
              <p className="mt-2 text-sm leading-6 text-crystal-muted">{shopHome.hero.note.body}</p>
            </div>
          </div>
        </div>
      </section> : null}

      {modules.home.energyMarquee ? <section className="overflow-hidden border-y border-crystal-gold/25 bg-white/92 py-3 text-sm font-medium text-crystal-gold">
        <div className="marquee-track flex w-max gap-12">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index}>{shopHome.energyMarquee}</span>
          ))}
        </div>
      </section> : null}

      {modules.home.categoryHighlights ? <section className="home-panel home-panel-gold relative isolate overflow-hidden py-20">
        <div className="home-panel-ambient" aria-hidden="true" />
        <div className="container-shell relative z-10">
          <div className="grid gap-4 md:grid-cols-4">
            {categoryHighlights.map((item, index) => (
              <Reveal
                as={Link}
                className="rounded-md luxury-surface p-6 transition duration-500 hover:-translate-y-1"
                delay={index * 80}
                href={item.href}
                key={item.title}
                variant="group"
              >
                <span className="reveal-item block" style={{ "--reveal-item-delay": `${index * 80}ms` } as CSSProperties}>
                  <item.icon className="text-crystal-gold" size={26} />
                </span>
                <span className="reveal-item block" style={{ "--reveal-item-delay": `${index * 80 + 100}ms` } as CSSProperties}>
                  <h3 className="mt-8 text-[11px] font-bold uppercase tracking-[0.24em] text-crystal-muted">{item.title}</h3>
                  <p className="mt-2 font-serif text-xl font-semibold">{item.label}</p>
                </span>
              </Reveal>
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
            <p className="luxury-eyebrow">{shopHome.customBlock.eyebrow}</p>
            <h3 className="mt-3 font-serif text-2xl font-semibold md:text-3xl">{shopHome.customBlock.title}</h3>
            <p className="mt-4 leading-7 text-crystal-muted">{shopHome.customBlock.body}</p>
            <Button asChild className="mt-8" variant="outline">
              <Link href={shopHome.customBlock.cta.href}>
                {shopHome.customBlock.cta.label} <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
          <div className="rounded-md border border-crystal-gold/35 bg-crystal-ink/92 p-8 text-white shadow-soft backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-crystal-blush">{shopHome.bestSellersBlock.eyebrow}</p>
            <h3 className="mt-3 font-serif text-2xl font-semibold md:text-3xl">{shopHome.bestSellersBlock.title}</h3>
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
