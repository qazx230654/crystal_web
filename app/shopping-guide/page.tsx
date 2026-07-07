import Link from "next/link";
import { guideSections } from "@/data/site";

export default function ShoppingGuidePage() {
  return (
    <section className="container-shell py-14">
      <div className="text-sm text-crystal-muted">
        <Link href="/">首頁</Link> / 購物說明
      </div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.32em] text-crystal-rose">Shopping Guide</p>
      <h1 className="mt-3 font-serif text-5xl font-semibold">購物說明</h1>
      <nav className="mt-8 flex flex-wrap gap-2">
        {guideSections.map((section) => (
          <a className="rounded-full border border-crystal-line bg-white/72 px-4 py-2 text-sm" href={`#${section.id}`} key={section.id}>
            {section.title}
          </a>
        ))}
      </nav>
      <div className="mt-10 grid gap-5">
        {guideSections.map((section) => (
          <article className="rounded-md border border-crystal-line bg-white/72 p-7 shadow-soft" id={section.id} key={section.id}>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-crystal-rose">{section.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold">{section.title}</h2>
            <div className="mt-4 space-y-3 text-crystal-muted">
              {section.body.map((line) => (
                <p className="leading-8" key={line}>{line}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="mt-8 rounded-md border border-crystal-line bg-crystal-pearl p-7">
        <h3 className="text-2xl font-semibold">還有其他問題？</h3>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="rounded-full bg-crystal-ink px-5 py-3 text-sm font-semibold text-white" href="/contact">
            聯絡我們
          </Link>
          <button className="rounded-full border border-crystal-line bg-white px-5 py-3 text-sm font-semibold" type="button">
            問問24小時 Crystal 小助人工智能服務
          </button>
        </div>
      </div>
    </section>
  );
}
