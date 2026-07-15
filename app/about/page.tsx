import Link from "next/link";
import { BrandStorySections } from "@/app/about/brand-story-sections";
import { brandStorySections } from "@/app/about/brand-story-model";
import { Reveal } from "@/components/reveal";
import { shopBrand } from "@/config/shop";

export default function AboutPage() {
  return (
    <section className="container-shell py-20 md:py-28">
      <Reveal as="div" className="mx-auto max-w-2xl text-center">
        <p className="luxury-eyebrow">Our Story</p>
        <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-crystal-ink md:text-6xl">與你的頻率相遇的故事</h1>
        <p className="mt-6 leading-8 text-crystal-muted">
          從一段自我安頓的日子開始，到今天陪伴超過萬名顧客——這是 {shopBrand.name} 一直沒有變過的初衷。
        </p>
      </Reveal>

      <div className="mt-20 md:mt-28">
        <BrandStorySections sections={brandStorySections} />
      </div>

      <Reveal
        as="div"
        className="mx-auto mt-24 max-w-3xl border-t border-crystal-line pt-16 text-center md:mt-32"
        delay={80}
      >
        <h2 className="font-serif text-3xl font-semibold text-crystal-ink md:text-4xl">收藏每一段剛剛好的頻率</h2>
        <p className="mt-6 leading-8 text-crystal-muted">它在最美的時刻落下，卻從不覺得自己在消逝。療癒不是一個目的地，而是你每天與自己相處的方式。</p>
        <Link
          className="mt-8 inline-flex border border-crystal-gold/45 bg-white/80 px-6 py-3 text-xs font-semibold tracking-[0.08em] text-crystal-ink shadow-[0_12px_28px_rgba(185,151,91,0.12)] transition hover:bg-crystal-champagne/30"
          href="/products"
        >
          探索與你有緣的頻率
        </Link>
      </Reveal>
    </section>
  );
}
