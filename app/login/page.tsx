"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-context";

function getNextPath() {
  if (typeof window === "undefined") return "/account";

  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") ? next : "/account";
}

export default function LoginPage() {
  const router = useRouter();
  const { refreshMember } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? "")
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "登入失敗");
      return;
    }

    await refreshMember();
    router.replace(getNextPath());
  }

  return (
    <section className="container-shell flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-md rounded-md border border-crystal-line bg-white/76 p-8 shadow-soft">
        <Link className="font-serif text-2xl font-semibold text-crystal-rose" href="/">
          椛 · Crystal
        </Link>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.28em] text-crystal-muted">Crystal Energy</p>
        <h1 className="mt-8 text-3xl font-semibold">會員登入</h1>
        <p className="mt-3 text-sm text-crystal-muted">
          還沒有帳號？ <Link className="text-crystal-rose" href="/register">立即註冊</Link>
        </p>
        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-crystal-muted">Email</span>
            <input autoComplete="email" className="rounded-md border border-crystal-line bg-white p-4 outline-crystal-rose" name="email" placeholder="your@email.com" required type="email" />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold">密碼</span>
            <input autoComplete="current-password" className="rounded-md border border-crystal-line bg-white p-4 outline-crystal-rose" name="password" placeholder="請輸入密碼" required type="password" />
          </label>
          <Link className="text-right text-sm text-crystal-muted" href="/forgot-password">
            忘記密碼？
          </Link>
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <button className="rounded-full bg-crystal-ink px-6 py-3 font-semibold text-white disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? "登入中..." : "登入"}
          </button>
          <Link className="text-center text-sm text-crystal-muted" href="/">
            返回首頁
          </Link>
        </form>
      </div>
    </section>
  );
}
