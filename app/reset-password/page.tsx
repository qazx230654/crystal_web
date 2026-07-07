"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    setAccessToken(hashParams.get("access_token") ?? "");
  }, []);

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
    const response = await fetch("/api/auth/reset-password", {
      body: JSON.stringify({ accessToken, password }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "密碼更新失敗");
      return;
    }

    setMessage("密碼已更新，請使用新密碼登入。");
    window.setTimeout(() => router.replace("/login"), 1200);
  }

  return (
    <section className="container-shell flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-md border border-crystal-line bg-white/76 p-8 shadow-soft">
        <Link className="font-serif text-2xl font-semibold text-crystal-ink" href="/">
          Crystal
        </Link>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.28em] text-crystal-muted">Crystal Energy</p>
        <h1 className="mt-8 text-3xl font-semibold">重設密碼</h1>
        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">新密碼</span>
            <input autoComplete="new-password" className="border border-crystal-line bg-white p-4 outline-crystal-rose" name="password" placeholder="至少 8 個字元" required type="password" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">確認新密碼</span>
            <input autoComplete="new-password" className="border border-crystal-line bg-white p-4 outline-crystal-rose" name="confirmPassword" placeholder="再次輸入密碼" required type="password" />
          </label>
          {error ? <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
          <button className="bg-crystal-ink px-6 py-3 font-semibold text-white disabled:opacity-60" disabled={submitting || !accessToken} type="submit">
            {submitting ? "更新中..." : "更新密碼"}
          </button>
          {!accessToken ? <p className="text-sm text-crystal-muted">請從 Email 中的重設密碼連結開啟此頁。</p> : null}
        </form>
      </div>
    </section>
  );
}
