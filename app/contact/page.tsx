import Link from "next/link";
import { Camera, MessageCircle } from "lucide-react";
import { contactLinks } from "@/config/contact";

export default function ContactPage() {
  return (
    <section className="container-shell py-14">
      <div className="text-sm text-crystal-muted">
        <Link href="/">首頁</Link> / 聯絡我們
      </div>
      <p className="mt-8 luxury-eyebrow">Contact Us</p>
      <h1 className="mt-3 font-serif text-5xl font-semibold">聯絡我們</h1>
      <p className="mt-5 max-w-2xl leading-8 text-crystal-muted">有任何關於商品、訂單或能量水晶的問題，歡迎透過以下方式聯絡我們。</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <a className="rounded-md luxury-surface p-7 transition duration-500 hover:-translate-y-1" href={contactLinks.instagram.href} rel="noreferrer" target="_blank">
          <Camera className="text-crystal-gold" />
          <h2 className="mt-5 text-2xl font-semibold">Instagram</h2>
          <p className="mt-2 text-crystal-muted">{contactLinks.instagram.label}</p>
        </a>
        <a className="rounded-md luxury-surface p-7 transition duration-500 hover:-translate-y-1" href={contactLinks.line.href} rel="noreferrer" target="_blank">
          <MessageCircle className="text-crystal-gold" />
          <h2 className="mt-5 text-2xl font-semibold">LINE 官方帳號</h2>
          <p className="mt-2 text-crystal-muted">{contactLinks.line.label}</p>
        </a>
      </div>
      <div className="mt-8 border border-crystal-gold/28 bg-white/84 p-8 shadow-[0_20px_56px_rgba(185,151,91,0.1)]">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-gold">Quick Contact</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold">立即聯繫我們</h2>
        <p className="mt-4 text-crystal-muted">官方管道僅提供 LINE 與 Instagram，點擊上方卡片即可直接前往。</p>
      </div>
    </section>
  );
}
