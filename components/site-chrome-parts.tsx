"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navLinks } from "@/data/site";
import { Brand } from "@/components/brand";
import { useCart } from "@/components/cart-context";
import { useAuth } from "@/components/auth-context";
import { contactLinks } from "@/config/contact";
import { modules } from "@/config/modules";

export function AnnouncementMarquee() {
  if (!modules.chrome.announcementMarquee) {
    return null;
  }

  return (
    <div className="overflow-hidden border-b border-crystal-gold/25 bg-white/92 py-2 text-[11px] font-medium tracking-[0.18em] text-crystal-gold">
      <div className="marquee-track flex w-max gap-12">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index}>任選兩件商品免運 · 天然晶石手作配置 · Crystal Energy ·</span>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { lines, openCart } = useCart();
  const { member } = useAuth();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const accountHref = member ? "/account" : "/login";
  const accountTitle = member ? "會員中心" : "會員登入";

  const categoryMenu = [
    { href: "/products", label: "查看全部商品", muted: "Shop all" },
    { href: "/custom", label: "客製化方案", muted: "Custom plans" }
  ];
  const visibleNavLinks = navLinks.filter((link) => !["訂單查詢"].includes(link.label));

  function openCategoryMenu() {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
      categoryCloseTimer.current = null;
    }
    setCategoryOpen(true);
  }

  function scheduleCategoryMenuClose() {
    categoryCloseTimer.current = setTimeout(() => setCategoryOpen(false), 150);
  }

  useEffect(() => {
    setCategoryOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (categoryCloseTimer.current) clearTimeout(categoryCloseTimer.current);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-crystal-gold/20 bg-crystal-cream/88 shadow-[0_10px_30px_rgba(90,65,55,0.04)] backdrop-blur-xl">
        <div className="container-shell relative z-20 flex h-16 items-center justify-between gap-4">
          <Brand />
          <nav className="hidden items-center gap-7 text-xs font-medium tracking-[0.08em] text-crystal-muted lg:flex">
            <Link className="transition hover:text-crystal-gold" href="/products?category=monthly" onClick={() => setCategoryOpen(false)}>
              每月限量
            </Link>
            <div className="relative" onMouseEnter={openCategoryMenu} onMouseLeave={scheduleCategoryMenuClose}>
              <button
                className="inline-flex items-center gap-1.5 transition hover:text-crystal-gold"
                onClick={() => setCategoryOpen((value) => !value)}
                type="button"
              >
                商品分類
                <ChevronDown className={`transition ${categoryOpen ? "rotate-180" : ""}`} size={13} />
              </button>
              {categoryOpen ? (
                <div className="absolute left-1/2 top-9 z-50 w-60 -translate-x-1/2 border border-crystal-champagne/80 bg-white/95 shadow-soft backdrop-blur">
                  <div className="border-b border-crystal-champagne/70 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.26em] text-crystal-gold">
                    Shop by Category
                  </div>
                  <div className="grid">
                    {categoryMenu.map((item) => (
                      <Link
                        className="flex items-center justify-between border-b border-crystal-line px-5 py-4 text-sm transition hover:bg-crystal-pearl"
                        href={item.href}
                        key={item.href}
                        onClick={() => setCategoryOpen(false)}
                      >
                        <span>
                          <span className="block text-crystal-ink">{item.label}</span>
                          <span className="mt-1 block text-[11px] text-crystal-muted">{item.muted}</span>
                        </span>
                        <span className="text-crystal-muted">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            {visibleNavLinks.slice(1).map((link) => (
              <Link className="transition hover:text-crystal-gold" href={link.href} key={link.href} onClick={() => setCategoryOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {modules.chrome.searchShortcut ? (
              <Link
                className="hidden h-9 w-9 place-items-center rounded-full border border-crystal-line bg-white/70 text-crystal-muted transition hover:border-crystal-gold hover:text-crystal-gold md:grid"
                href="/products"
                title="搜尋商品"
              >
                <Search size={18} />
              </Link>
            ) : null}
            {modules.chrome.authShortcut ? (
              <Link
                className="hidden h-9 w-9 place-items-center rounded-full border border-crystal-line bg-white/70 text-crystal-muted transition hover:border-crystal-gold hover:text-crystal-gold md:grid"
                href={accountHref}
                title={accountTitle}
              >
                <User size={18} />
              </Link>
            ) : null}
            {modules.chrome.cart ? (
              <button
                className="relative grid h-9 w-9 place-items-center rounded-full border border-crystal-line bg-white/70 text-crystal-muted transition hover:border-crystal-gold hover:text-crystal-gold"
                onClick={openCart}
                title="購物車"
                type="button"
              >
                <ShoppingBag size={18} />
                {count ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-crystal-gold px-1 text-[11px] font-bold text-white">
                    {count}
                  </span>
                ) : null}
              </button>
            ) : null}
            {modules.chrome.mobileMenu ? (
              <button
                className="grid h-9 w-9 place-items-center rounded-full border border-crystal-line bg-white/70 text-crystal-muted lg:hidden"
                onClick={() => setMenuOpen(true)}
                title="選單"
                type="button"
              >
                <Menu size={19} />
              </button>
            ) : null}
          </div>
        </div>
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
              {[{ label: "所有商品", href: "/products" }, { label: "客製化方案", href: "/custom" }, ...visibleNavLinks].map((link) => (
                <Link
                  className="rounded-md border border-crystal-line bg-white/70 px-4 py-3 text-crystal-ink"
                  href={link.href}
                  key={`${link.href}-${link.label}`}
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

export function Footer() {
  return (
    <footer className="mt-24 border-t border-crystal-gold/20 bg-white/50 py-12">
      <div className="container-shell grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="mt-5 max-w-sm text-xs leading-7 text-crystal-muted">
            專屬你的能量水晶，陪你走向更好的每一天。
          </p>
        </div>
        <div className="grid gap-3 text-xs  text-crystal-muted">
          <span className="luxury-eyebrow">Explore</span>
          <Link href="/products">所有商品</Link>
          <Link href="/custom">客製化方案</Link>
          <Link href="/order-lookup">訂單查詢</Link>
          <Link href="/shopping-guide">購物說明</Link>
        </div>
        <div className="grid gap-3 text-xs text-crystal-muted">
          <span className="luxury-eyebrow">Contact</span>
          <Link href="/contact">聯絡我們</Link>
          <a href={contactLinks.instagram.href} rel="noreferrer" target="_blank">
            Instagram
          </a>
          <a href={contactLinks.line.href} rel="noreferrer" target="_blank">
            LINE
          </a>
        </div>
      </div>
    </footer>
  );
}
