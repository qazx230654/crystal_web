"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

function getNextPath() {
  if (typeof window === "undefined") return "/admin/dashboard";

  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/admin") ? next : "/admin/dashboard";
}

export default function AdminLoginPage() {
  const next = getNextPath();

  return (
    <section className="container-shell grid min-h-[66vh] place-items-center py-12">
      <div className="w-full max-w-md rounded-md border border-crystal-line bg-white/80 p-8 text-center shadow-soft">
        <div className="mx-auto grid h-12 w-12 place-items-center border border-crystal-gold/40 bg-crystal-champagne/30 text-crystal-gold">
          <LockKeyhole size={20} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Admin</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold">後台權限</h1>
        <p className="mt-4 text-sm leading-7 text-crystal-muted">
          後台已改用會員登入。請使用 Supabase Auth 管理員帳號登入，系統會依會員資料中的 role 判斷是否能進入後台。
        </p>
        <Button asChild className="mt-7 w-full" size="lg">
          <Link href={`/login?next=${encodeURIComponent(next)}`}>前往會員登入</Link>
        </Button>
      </div>
    </section>
  );
}
