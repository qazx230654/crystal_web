"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useCart } from "@/components/cart-context";
import { useAuth } from "@/components/auth-context";

export default function CheckoutPage() {
  const { clearCart, lines, total } = useCart();
  const { member } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);
  const profile = member?.profile;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", {
      body: JSON.stringify({
        customer: {
          email: String(formData.get("email") ?? ""),
          lineId: String(formData.get("lineId") ?? ""),
          name: String(formData.get("name") ?? ""),
          phone: String(formData.get("phone") ?? "")
        },
        items: lines.map((line) => ({
          options: line.options,
          productId: line.product.id,
          productSlug: line.product.slug,
          quantity: line.quantity
        })),
        note: String(formData.get("note") ?? ""),
        paymentMethod: String(formData.get("paymentMethod") ?? "bank-transfer"),
        shipping: {
          address: String(formData.get("address") ?? ""),
          method: String(formData.get("shippingMethod") ?? "711")
        }
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "訂單建立失敗");
      return;
    }

    clearCart();
    router.push(`/orders/${payload.data.id}/success`);
  }

  if (!lines.length) {
    return (
      <section className="container-shell grid min-h-[60vh] place-items-center py-16 text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Checkout</p>
          <h1 className="mt-3 font-serif text-5xl font-semibold">購物袋是空的</h1>
          <Link className="mt-8 inline-flex rounded-full bg-crystal-ink px-6 py-3 text-sm font-semibold text-white" href="/products">
            返回選購
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell py-12">
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-crystal-rose">Checkout</p>
      <h1 className="mt-3 font-serif text-5xl font-semibold">確認訂單</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_420px]">
        <form className="rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft md:p-8" key={member?.user.id ?? "guest"} onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">收件與付款資料</h2>
              {member ? <p className="mt-2 text-sm text-crystal-muted">已登入會員，訂單會自動保存在會員中心。</p> : null}
            </div>
            {!member ? (
              <Link className="rounded-full border border-crystal-line bg-white px-4 py-2 text-sm font-semibold text-crystal-ink" href="/login?next=/checkout">
                會員登入
              </Link>
            ) : null}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">姓名</span>
              <input className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" defaultValue={profile?.name ?? ""} name="name" required />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">手機</span>
              <input className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" defaultValue={profile?.phone ?? ""} name="phone" required />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Email</span>
              <input className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" defaultValue={profile?.email ?? member?.user.email ?? ""} name="email" type="email" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">LINE ID</span>
              <input className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" defaultValue={profile?.line_id ?? ""} name="lineId" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">運送方式</span>
              <select className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" name="shippingMethod">
                <option value="711">7-11 店到店</option>
                <option value="black-cat">黑貓宅急便</option>
                <option value="pickup">預約面交</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">付款方式</span>
              <select className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" name="paymentMethod">
                <option value="bank-transfer">轉帳</option>
                <option value="credit-card">信用卡</option>
                <option value="paypal">PayPal</option>
              </select>
            </label>
          </div>
          <label className="mt-4 grid gap-2">
            <span className="text-sm font-semibold">收件地址 / 門市資訊</span>
            <input className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" name="address" />
          </label>
          <label className="mt-4 grid gap-2">
            <span className="text-sm font-semibold">備註</span>
            <textarea className="min-h-28 rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" name="note" />
          </label>
          {error ? <p className="mt-5 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
          <button className="mt-6 w-full rounded-full bg-crystal-ink px-6 py-3 font-semibold text-white disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? "建立訂單中..." : "送出訂單"}
          </button>
        </form>
        <aside className="h-fit rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">訂單明細</h2>
          <div className="mt-5 space-y-4">
            {lines.map((line) => (
              <div className="flex gap-3" key={`${line.product.id}-${JSON.stringify(line.options)}`}>
                <div className="relative h-16 w-16 overflow-hidden rounded-md bg-crystal-pearl">
                  <Image alt={line.product.name} fill className="object-cover" src={line.product.image} sizes="64px" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{line.product.name}</p>
                  <p className="text-sm text-crystal-muted">數量 {line.quantity}</p>
                </div>
                <p className="font-semibold">NT$ {(line.product.price * line.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-crystal-line pt-4">
            <div className="flex justify-between text-sm text-crystal-muted">
              <span>商品件數</span>
              <span>{itemCount}</span>
            </div>
            <div className="mt-3 flex justify-between text-xl font-semibold">
              <span>小計</span>
              <span>NT$ {total.toLocaleString()}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
