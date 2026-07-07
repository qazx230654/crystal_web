import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="container-shell py-14">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-crystal-rose">Crystal</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight md:text-7xl">每一顆水晶，都在等一個對的人</h1>
          <p className="mt-6 leading-8 text-crystal-muted">Crystal 相信，每一顆水晶都帶著自己的頻率。它不修復你，它提醒你，你本來就是完整的。</p>
          <Link className="mt-8 inline-flex rounded-full bg-crystal-ink px-6 py-3 text-sm font-semibold text-white" href="/products">
            探索與你有緣的頻率
          </Link>
        </div>
        <div className="relative aspect-[1.1/1] overflow-hidden rounded-md border border-crystal-line shadow-soft">
          <Image alt="水晶手鍊細節" fill className="object-cover" src="https://goodaytarot.com/images/about-crystal.jpg" sizes="(min-width:1024px) 55vw, 100vw" />
        </div>
      </div>
      <article className="mx-auto mt-16 max-w-3xl rounded-md border border-crystal-line bg-white/70 p-8 text-center leading-9 shadow-soft">
        <h2 className="font-serif text-4xl font-semibold">Crystal，收藏每一段剛剛好的頻率。</h2>
        <p className="mt-6 text-crystal-muted">它在最美的時刻落下，卻從不覺得自己在消逝。療癒不是一個目的地，而是你每天與自己相處的方式。</p>
        <p className="mt-6 text-crystal-muted">水晶不是魔法，但它是一個錨點，讓你在忙碌、混亂、或疲憊的日子裡，想起自己值得被好好對待。</p>
      </article>
    </section>
  );
}
