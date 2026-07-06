"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function OrderLookupPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const lookup = encodeURIComponent(String(formData.get("lookup") ?? ""));
    const verifier = encodeURIComponent(String(formData.get("verifier") ?? ""));
    const response = await fetch(`/api/orders?lookup=${lookup}&verifier=${verifier}`);
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError("查無訂單，請確認訂單編號與 Email 或手機末三碼。");
      return;
    }

    setResult(payload.data);
  }

  return (
    <section className="container-shell py-14">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Order Lookup</p>
      <h1 className="mt-3 font-serif text-5xl font-semibold">訂單查詢</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[420px_1fr]">
        <form className="rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">訂單編號</span>
            <input className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" name="lookup" required />
          </label>
          <label className="mt-4 grid gap-2">
            <span className="text-sm font-semibold">Email 或手機末三碼</span>
            <input className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" name="verifier" required />
          </label>
          {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <button className="mt-6 w-full rounded-full bg-crystal-ink px-5 py-3 text-sm font-semibold text-white" disabled={loading} type="submit">
            {loading ? "查詢中..." : "查詢訂單"}
          </button>
        </form>
        <div className="rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft">
          {result ? (
            <div>
              <p className="text-sm text-crystal-muted">訂單編號</p>
              <h2 className="mt-1 text-3xl font-semibold text-crystal-rose">{result.order.order_number}</h2>
              <div className="mt-6 grid gap-3 text-sm">
                <p>狀態：{result.order.status}</p>
                <p>總計：NT$ {result.order.total.toLocaleString()}</p>
                <p>建立時間：{new Date(result.order.created_at).toLocaleString("zh-TW")}</p>
              </div>
              <Link className="mt-6 inline-flex rounded-full bg-crystal-ink px-5 py-3 text-sm font-semibold text-white" href={`/orders/${result.order.id}/success`}>
                查看訂單明細
              </Link>
            </div>
          ) : (
            <p className="text-crystal-muted">輸入資料後會顯示訂單狀態與明細入口。</p>
          )}
        </div>
      </div>
    </section>
  );
}
