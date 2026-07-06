"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-context";

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
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        lineId: String(formData.get("lineId") ?? ""),
        name: String(formData.get("name") ?? ""),
        password: String(formData.get("password") ?? ""),
        phone: String(formData.get("phone") ?? "")
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
    <section className="container-shell flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-md rounded-md border border-crystal-line bg-white/76 p-8 shadow-soft">
        <Link className="font-serif text-2xl font-semibold text-crystal-rose" href="/">
          椛 · Crystal
        </Link>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.28em] text-crystal-muted">Crystal Energy</p>
        <h1 className="mt-8 text-3xl font-semibold">會員註冊</h1>
        <p className="mt-3 text-sm text-crystal-muted">
          已經有帳號？ <Link className="text-crystal-rose" href="/login">前往登入</Link>
        </p>
        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">姓名</span>
            <input autoComplete="name" className="rounded-md border border-crystal-line bg-white p-4 outline-crystal-rose" name="name" required />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Email</span>
            <input autoComplete="email" className="rounded-md border border-crystal-line bg-white p-4 outline-crystal-rose" name="email" required type="email" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">密碼</span>
            <input autoComplete="new-password" className="rounded-md border border-crystal-line bg-white p-4 outline-crystal-rose" name="password" required type="password" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">手機</span>
              <input autoComplete="tel" className="rounded-md border border-crystal-line bg-white p-4 outline-crystal-rose" name="phone" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">LINE ID</span>
              <input className="rounded-md border border-crystal-line bg-white p-4 outline-crystal-rose" name="lineId" />
            </label>
          </div>
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
          <button className="rounded-full bg-crystal-ink px-6 py-3 font-semibold text-white disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? "建立中..." : "建立會員"}
          </button>
        </form>
      </div>
    </section>
  );
}
