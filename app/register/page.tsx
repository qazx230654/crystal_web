"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { shopBrand } from "@/config/shop";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshMember } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致");
      return;
    }

    setSubmitting(true);

    const response = await fetch("/api/auth/register", {
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        name: String(formData.get("name") ?? ""),
        password
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "註冊失敗");
      return;
    }

    if (payload.data?.requiresEmailConfirmation) {
      setMessage("註冊完成，請先到信箱完成驗證後再登入。");
      return;
    }

    await refreshMember();
    router.replace("/account");
  }

  return (
    <section className="container-shell flex min-h-[78vh] items-center justify-center py-12">
      <div className="w-full max-w-[360px]">
        <div className="text-center">
          <Link className="font-serif text-2xl font-semibold tracking-[0.18em] text-crystal-ink" href="/">
            {shopBrand.name}
          </Link>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.32em] text-crystal-muted">{shopBrand.tagline}</p>
        </div>

        <div className="mt-8 border border-crystal-line bg-white p-8">
          <h1 className="text-xl font-semibold">建立帳號</h1>
          <p className="mt-2 text-sm text-crystal-muted">
            已有帳號？ <Link className="text-crystal-rose underline-offset-4 hover:underline" href="/login">直接登入</Link>
          </p>

          <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-crystal-ink">姓名</span>
              <input autoComplete="name" className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" name="name" placeholder="請輸入您的姓名" required />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-crystal-ink">Email</span>
              <input autoComplete="email" className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" name="email" placeholder="your@email.com" required type="email" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-crystal-ink">密碼</span>
              <input autoComplete="new-password" className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" name="password" placeholder="至少 8 個字元" required type="password" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-crystal-ink">確認密碼</span>
              <input autoComplete="new-password" className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" name="confirmPassword" placeholder="再次輸入密碼" required type="password" />
            </label>

            {error ? <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
            {message ? <p className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

            <button className="mt-1 bg-crystal-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={submitting} type="submit">
              {submitting ? "建立中..." : "建立帳號"}
            </button>
          </form>

          <div className="my-6 text-center text-xs text-crystal-muted">或</div>
          <button className="w-full border border-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-600" disabled type="button">
            使用 LINE 註冊 / 登入
          </button>
          <p className="mt-5 text-center text-[11px] leading-5 text-crystal-muted">註冊即表示您同意我們的服務條款與隱私政策</p>
        </div>

        <Link className="mt-6 block text-center text-xs text-crystal-muted" href="/">
          ← 返回首頁
        </Link>
      </div>
    </section>
  );
}
