"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { navLinks } from "@/data/site";
import { categoryLabels } from "@/data/product-types";
import { Brand } from "@/components/brand";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider, useCart } from "@/components/cart-context";
import { AuthProvider, useAuth } from "@/components/auth-context";
import { CrystalAdvisor } from "@/components/crystal-advisor";
import { modules } from "@/config/modules";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const { lines, openCart } = useCart();
  const { member } = useAuth();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const accountHref = member ? "/account" : "/login";
  const accountTitle = member ? "會員中心" : "會員登入";

  const categoryEntries = Object.entries(categoryLabels).filter(([key]) => key !== "all");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-crystal-line/80 bg-crystal-cream/88 backdrop-blur-xl">
        <div className="container-shell relative z-20 flex h-20 items-center justify-between gap-4">
          <Brand />
          <nav className="hidden items-center gap-7 text-sm font-medium text-crystal-muted lg:flex">
            <Link className="hover:text-crystal-ink" href="/products?category=monthly">
              每月限量
            </Link>
            <div className="relative">
              <button
                className="hover:text-crystal-ink"
                onClick={() => setCategoryOpen((value) => !value)}
                type="button"
              >
                商品分類
              </button>
              {categoryOpen ? (
                <div className="absolute left-1/2 top-9 z-50 grid w-48 -translate-x-1/2 gap-1 rounded-md border border-crystal-line bg-white p-2 shadow-soft">
                  {categoryEntries.map(([key, label]) => (
                    <Link
                      className="rounded px-3 py-2 text-sm hover:bg-crystal-pearl"
                      href={`/products?category=${key}`}
                      key={key}
                      onClick={() => setCategoryOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            {navLinks.slice(1).map((link) => (
              <Link className="hover:text-crystal-ink" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {modules.chrome.searchShortcut ? (
              <Link
                className="hidden h-10 w-10 place-items-center rounded-full border border-crystal-line bg-white/70 text-crystal-muted transition hover:text-crystal-ink md:grid"
                href="/products"
                title="搜尋商品"
              >
                <Search size={18} />
              </Link>
            ) : null}
            {modules.chrome.authShortcut ? (
              <Link
                className="hidden h-10 w-10 place-items-center rounded-full border border-crystal-line bg-white/70 text-crystal-muted transition hover:text-crystal-ink md:grid"
                href={accountHref}
                title={accountTitle}
              >
                <User size={18} />
              </Link>
            ) : null}
            {modules.chrome.cart ? (
              <button
                className="relative grid h-10 w-10 place-items-center rounded-full border border-crystal-line bg-white/70 text-crystal-muted transition hover:text-crystal-ink"
                onClick={openCart}
                title="購物車"
                type="button"
              >
                <ShoppingBag size={18} />
                {count ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-crystal-rose px-1 text-[11px] font-bold text-white">
                    {count}
                  </span>
                ) : null}
              </button>
            ) : null}
            {modules.chrome.mobileMenu ? (
              <button
                className="grid h-10 w-10 place-items-center rounded-full border border-crystal-line bg-white/70 text-crystal-muted lg:hidden"
                onClick={() => setMenuOpen(true)}
                title="選單"
                type="button"
              >
                <Menu size={19} />
              </button>
            ) : null}
          </div>
        </div>
        {modules.chrome.announcementMarquee ? (
          <div className="relative z-0 overflow-hidden border-t border-crystal-line/70 bg-crystal-ink py-2 text-xs font-medium text-crystal-cream">
            <div className="marquee-track flex w-max gap-12">
              {Array.from({ length: 8 }).map((_, index) => (
                <span key={index}>任選兩件商品免運 · 6/1-6/10 全面九折 ·</span>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 bg-crystal-ink/25 lg:hidden">
          <div className="ml-auto h-full w-[min(88vw,360px)] bg-crystal-cream p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <Brand />
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white" onClick={() => setMenuOpen(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <div className="mt-10 grid gap-3">
              {[{ label: "所有商品", href: "/products" }, ...navLinks].map((link) => (
                <Link
                  className="rounded-md border border-crystal-line bg-white/70 px-4 py-3 text-crystal-ink"
                  href={link.href}
                  key={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link className="rounded-md border border-crystal-line bg-white/70 px-4 py-3 text-crystal-ink" href={accountHref}>
                {member ? "會員中心" : "登入"}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-crystal-line bg-white/50 py-12">
      <div className="container-shell grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="mt-5 max-w-sm text-sm leading-7 text-crystal-muted">
            結合能量水晶、情緒療癒與個人轉運，讓每一天都成為好日子。
          </p>
        </div>
        <div className="grid gap-3 text-sm text-crystal-muted">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-crystal-rose">Explore</span>
          <Link href="/products">所有商品</Link>
          <Link href="/custom">客製化方案</Link>
          <Link href="/order-lookup">訂單查詢</Link>
          <Link href="/shopping-guide">購物說明</Link>
        </div>
        <div className="grid gap-3 text-sm text-crystal-muted">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-crystal-rose">Contact</span>
          <Link href="/contact">聯絡我們</Link>
          <a href="https://www.instagram.com/gooday_tarot_" rel="noreferrer" target="_blank">
            Instagram
          </a>
          <a href="https://line.me/R/ti/p/@011tymeh" rel="noreferrer" target="_blank">
            LINE
          </a>
        </div>
      </div>
    </footer>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        <main>{children}</main>
        {modules.chrome.footer ? <Footer /> : null}
        {modules.chrome.cart ? <CartDrawer /> : null}
        {modules.chrome.advisor ? <CrystalAdvisor /> : null}
      </CartProvider>
    </AuthProvider>
  );
}
