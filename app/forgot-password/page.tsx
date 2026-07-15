"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { shopBrand } from "@/config/shop";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      body: JSON.stringify({ email: String(formData.get("email") ?? "") }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      const message = payload.error?.message ?? "重設密碼信發送失敗";
      setError(message.toLowerCase().includes("rate limit") ? "寄送太頻繁，請稍後再試。" : message);
      return;
    }

    setMessage("重設密碼信已送出，請到信箱點擊連結。");
  }

  return (
    <section className="container-shell flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-md border border-crystal-line bg-white/76 p-8 shadow-soft">
        <Link className="font-serif text-2xl font-semibold text-crystal-ink" href="/">
          {shopBrand.name}
        </Link>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.28em] text-crystal-muted">{shopBrand.tagline}</p>
        <h1 className="mt-8 text-3xl font-semibold">忘記密碼</h1>
        <p className="mt-3 text-sm leading-6 text-crystal-muted">輸入註冊 Email，我們會寄送重設密碼連結給您。</p>
        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-crystal-muted">Email</span>
            <input autoComplete="email" className="border border-crystal-line bg-white p-4 outline-crystal-rose" name="email" placeholder="your@email.com" required type="email" />
          </label>
          {error ? <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
          <button className="bg-crystal-ink px-6 py-3 font-semibold text-white disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? "發送中..." : "寄送重設密碼信"}
          </button>
          <Link className="text-center text-sm text-crystal-muted" href="/login">
            返回登入
          </Link>
        </form>
      </div>
    </section>
  );
}
