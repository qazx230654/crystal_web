"use client";

import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function getNextPath() {
  if (typeof window === "undefined") return "/admin/orders";

  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/admin") ? next : "/admin/orders";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      body: JSON.stringify({ token }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "登入失敗");
      return;
    }

    router.replace(getNextPath());
    router.refresh();
  }

  return (
    <section className="container-shell grid min-h-[66vh] place-items-center py-12">
      <form className="w-full max-w-md rounded-md border border-crystal-line bg-white/80 p-8 shadow-soft" onSubmit={handleSubmit}>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-crystal-ink text-white">
          <LockKeyhole size={20} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Admin</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold">後台登入</h1>
        <label className="mt-7 block text-sm font-semibold text-crystal-ink" htmlFor="admin-token">
          管理密碼
        </label>
        <input
          autoComplete="current-password"
          autoFocus
          className="mt-2 w-full rounded-md border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose"
          id="admin-token"
          onChange={(event) => setToken(event.target.value)}
          placeholder="請輸入後台管理密碼"
          type="password"
          value={token}
        />
        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <button className="mt-6 w-full rounded-full bg-crystal-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={submitting} type="submit">
          {submitting ? "登入中..." : "登入後台"}
        </button>
      </form>
    </section>
  );
}
