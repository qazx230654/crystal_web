"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-context";

type AccountOrder = {
  created_at: string;
  id: string;
  order_number: string;
  status: string;
  total: number;
};

const statusLabels: Record<string, string> = {
  cancelled: "已取消",
  completed: "已完成",
  making: "製作中",
  paid: "已付款",
  pending: "待確認",
  shipped: "已出貨"
};

function getStatusLabel(status: string) {
  return statusLabels[status] ?? status;
}

export default function AccountPage() {
  const router = useRouter();
  const { loading, logout, member, refreshMember } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!member) {
      router.replace("/login?next=/account");
      return;
    }

    loadOrders();
  }, [loading, member?.user.id]);

  async function loadOrders() {
    setOrdersLoading(true);
    const response = await fetch("/api/account/orders");
    const payload = await response.json();
    setOrdersLoading(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "無法讀取訂單");
      return;
    }

    setOrders(payload.data);
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/account/profile", {
      body: JSON.stringify({
        lineId: String(formData.get("lineId") ?? ""),
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? "")
      }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH"
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "會員資料更新失敗");
      return;
    }

    await refreshMember();
    setMessage("會員資料已更新");
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (loading || !member) {
    return (
      <section className="container-shell grid min-h-[60vh] place-items-center py-16">
        <p className="text-crystal-muted">會員資料讀取中...</p>
      </section>
    );
  }

  const profile = member.profile;

  return (
    <section className="container-shell py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Account</p>
          <h1 className="mt-3 font-serif text-5xl font-semibold">會員中心</h1>
          <p className="mt-3 text-sm text-crystal-muted">{profile?.email ?? member.user.email}</p>
        </div>
        <button className="rounded-full border border-crystal-line bg-white px-5 py-3 text-sm font-semibold text-crystal-ink" onClick={handleLogout} type="button">
          登出
        </button>
      </div>

      {error ? <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-6 rounded-md bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <form className="h-fit rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft" key={member.user.id} onSubmit={handleProfileSubmit}>
          <h2 className="text-2xl font-semibold">個人資料</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">姓名</span>
              <input className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" defaultValue={profile?.name ?? ""} name="name" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">手機</span>
              <input className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" defaultValue={profile?.phone ?? ""} name="phone" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">LINE ID</span>
              <input className="rounded-md border border-crystal-line bg-white px-4 py-3 outline-crystal-rose" defaultValue={profile?.line_id ?? ""} name="lineId" />
            </label>
          </div>
          <button className="mt-6 w-full rounded-full bg-crystal-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={saving} type="submit">
            {saving ? "儲存中..." : "儲存資料"}
          </button>
        </form>

        <section className="rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">我的訂單</h2>
            <Link className="rounded-full bg-crystal-ink px-4 py-2 text-sm font-semibold text-white" href="/products">
              繼續選購
            </Link>
          </div>
          {ordersLoading ? <p className="mt-6 text-crystal-muted">訂單讀取中...</p> : null}
          {!ordersLoading && !orders.length ? <p className="mt-6 text-crystal-muted">目前尚無會員訂單。</p> : null}
          <div className="mt-5 divide-y divide-crystal-line">
            {orders.map((order) => (
              <Link className="grid gap-2 py-4 text-sm md:grid-cols-[1fr_0.8fr_0.7fr_0.7fr]" href={`/orders/${order.id}/success`} key={order.id}>
                <span className="font-semibold">{order.order_number}</span>
                <span className="text-crystal-muted">{new Date(order.created_at).toLocaleDateString("zh-TW")}</span>
                <span>{getStatusLabel(order.status)}</span>
                <span className="font-semibold md:text-right">NT$ {order.total.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
