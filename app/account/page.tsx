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
  const [activeTab, setActiveTab] = useState<"orders" | "settings">("orders");
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

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
        lineId: member?.profile?.line_id ?? "",
        name: String(formData.get("name") ?? ""),
        phone: member?.profile?.phone ?? ""
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

  async function resendVerification() {
    setError(null);
    setMessage(null);
    setResending(true);

    const response = await fetch("/api/auth/resend-verification", { method: "POST" });
    const payload = await response.json();
    setResending(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "驗證信發送失敗");
      return;
    }

    setMessage("驗證信已重新寄出");
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
  const email = profile?.email ?? member.user.email ?? "";
  const metadataName = typeof member.user.user_metadata?.name === "string" ? member.user.user_metadata.name : "";
  const displayName = profile?.name || metadataName || email.split("@")[0] || "會員";
  const emailVerified = Boolean(member.user.email_confirmed_at);

  return (
    <section className="bg-[#f8f5f2] pb-20">
      <div className="border-b border-crystal-line bg-white">
        <div className="container-shell flex items-start justify-between gap-4 py-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.34em] text-crystal-muted">Member Center</p>
            <h1 className="mt-2 text-2xl font-semibold text-crystal-ink">歡迎回來，{displayName}</h1>
            <p className="mt-1 text-sm text-crystal-muted">{email}</p>
          </div>
          <button className="border border-crystal-line bg-white px-5 py-3 text-sm text-crystal-muted transition hover:border-crystal-ink hover:text-crystal-ink" onClick={handleLogout} type="button">
            登出
          </button>
        </div>
      </div>

      <div className="container-shell py-10">
        {!emailVerified ? (
          <div className="flex flex-wrap items-center justify-between gap-4 border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-700">
            <div>
              <p className="font-semibold">請驗證您的 Email</p>
              <p className="mt-1">發送驗證信到 {email}，點擊信中連結即可完成驗證。</p>
            </div>
            <button className="border border-amber-400 bg-white px-5 py-3 text-sm font-semibold text-amber-700 disabled:opacity-60" disabled={resending} onClick={resendVerification} type="button">
              {resending ? "發送中..." : "重新發送驗證信"}
            </button>
          </div>
        ) : null}

        {error ? <p className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="mt-6 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p> : null}

        <div className="mt-8 border-b border-crystal-line">
          <button
            className={`px-6 py-4 text-sm ${activeTab === "orders" ? "border-b-2 border-crystal-ink text-crystal-ink" : "text-crystal-muted"}`}
            onClick={() => setActiveTab("orders")}
            type="button"
          >
            我的訂單
          </button>
          <button
            className={`px-6 py-4 text-sm ${activeTab === "settings" ? "border-b-2 border-crystal-ink text-crystal-ink" : "text-crystal-muted"}`}
            onClick={() => setActiveTab("settings")}
            type="button"
          >
            帳號設定
          </button>
        </div>

        {activeTab === "orders" ? (
          <section className="min-h-[340px] py-12">
            {ordersLoading ? <p className="text-center text-crystal-muted">訂單讀取中...</p> : null}
            {!ordersLoading && !orders.length ? (
              <div className="grid place-items-center py-20 text-center">
                <div className="text-4xl">🛍️</div>
                <p className="mt-4 text-sm text-crystal-muted">還沒有任何訂單</p>
                <Link className="mt-6 border border-crystal-ink bg-white px-6 py-3 text-sm font-semibold text-crystal-ink" href="/products">
                  去逛逛
                </Link>
              </div>
            ) : null}
            {orders.length ? (
              <div className="divide-y divide-crystal-line border border-crystal-line bg-white">
                {orders.map((order) => (
                  <Link className="grid gap-2 px-5 py-4 text-sm md:grid-cols-[1fr_0.8fr_0.7fr_0.7fr]" href={`/orders/${order.id}/success`} key={order.id}>
                    <span className="font-semibold">{order.order_number}</span>
                    <span className="text-crystal-muted">{new Date(order.created_at).toLocaleDateString("zh-TW")}</span>
                    <span>{getStatusLabel(order.status)}</span>
                    <span className="font-semibold md:text-right">NT$ {order.total.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        ) : (
          <section className="py-8">
            <form className="max-w-md border border-crystal-line bg-white p-8" key={member.user.id} onSubmit={handleProfileSubmit}>
              <h2 className="text-xl font-semibold">修改姓名</h2>
              <div className="mt-7 grid gap-5">
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-crystal-ink">Email（不可修改）</span>
                  <input className="border border-crystal-line bg-crystal-pearl px-4 py-3 text-sm text-crystal-muted" disabled value={email} />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-crystal-ink">姓名</span>
                  <input className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" defaultValue={profile?.name ?? ""} name="name" />
                </label>
              </div>
              <button className="mt-6 bg-crystal-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={saving} type="submit">
                {saving ? "儲存中..." : "儲存變更"}
              </button>
            </form>
          </section>
        )}
      </div>
    </section>
  );
}
