import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <section className="container-shell py-14">
      <div className="text-sm text-crystal-muted">
        <Link href="/">首頁</Link> / 聯絡我們
      </div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.32em] text-crystal-rose">Contact Us</p>
      <h1 className="mt-3 font-serif text-5xl font-semibold">聯絡我們</h1>
      <p className="mt-5 max-w-2xl leading-8 text-crystal-muted">有任何關於商品、訂單或能量水晶的問題，歡迎透過以下方式聯絡我們。</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <a className="rounded-md border border-crystal-line bg-white/72 p-7 shadow-soft" href="https://instagram.com/gooday_tarot_" rel="noreferrer" target="_blank">
          <Instagram className="text-crystal-rose" />
          <h2 className="mt-5 text-2xl font-semibold">Instagram</h2>
          <p className="mt-2 text-crystal-muted">gooday_tarot_</p>
        </a>
        <a className="rounded-md border border-crystal-line bg-white/72 p-7 shadow-soft" href="https://line.me/R/ti/p/@011tymeh" rel="noreferrer" target="_blank">
          <MessageCircle className="text-crystal-rose" />
          <h2 className="mt-5 text-2xl font-semibold">LINE 官方帳號</h2>
          <p className="mt-2 text-crystal-muted">@011tymeh</p>
        </a>
      </div>
      <div className="mt-8 rounded-md border border-crystal-line bg-crystal-ink p-8 text-white shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-blush">Quick Contact</p>
        <h2 className="mt-3 text-3xl font-semibold">立即聯繫我們</h2>
        <p className="mt-4 text-white/75">官方管道僅提供 LINE 與 Instagram，點擊上方卡片即可直接前往。</p>
      </div>
    </section>
  );
}
