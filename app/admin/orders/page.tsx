"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["pending", "paid", "making", "shipped", "completed", "cancelled"];
const filterStatuses = ["all", ...statuses];

const statusLabels: Record<string, string> = {
  pending: "待確認",
  paid: "已付款",
  making: "製作中",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消"
};

const statusTransitions: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["making", "cancelled"],
  making: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: []
};

const eventTypeLabels: Record<string, string> = {
  created: "建立訂單",
  status_changed: "狀態更新"
};

function getStatusLabel(status?: string) {
  if (!status) return "-";
  return statusLabels[status] ?? status;
}

function getEventMessage(event: any) {
  if (event.message) {
    return event.message.replace(/訂單狀態更新為\s+([a-z_]+)/gi, (_match: string, status: string) => `訂單狀態更新為 ${getStatusLabel(status)}`);
  }

  return eventTypeLabels[event.type] ?? event.type ?? "訂單紀錄";
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, any>>({});
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const visibleOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesKeyword = !keyword || [
        order.order_number,
        order.customer_name,
        order.customer_phone,
        order.customer_email
      ].some((value) => String(value ?? "").toLowerCase().includes(keyword));

      return matchesStatus && matchesKeyword;
    });
  }, [orders, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    return orders.reduce<Record<string, number>>((counts, order) => {
      counts.all += 1;
      counts[order.status] = (counts[order.status] ?? 0) + 1;
      return counts;
    }, { all: 0 });
  }, [orders]);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/orders");
    const payload = await response.json();
    setLoading(false);

    if (response.status === 401) {
      router.replace("/admin/login?next=/admin/orders");
      return;
    }

    if (!response.ok) {
      setError(payload.error?.message ?? "無法讀取訂單");
      return;
    }

    setOrders(payload.data);
  }

  async function updateStatus(order: any, status: string) {
    if (status === order.status) return;

    let message = "";
    if (status === "cancelled") {
      const reason = window.prompt("請輸入取消原因");
      if (!reason?.trim()) return;
      message = `訂單已取消：${reason.trim()}`;
    }

    const response = await fetch(`/api/orders/${order.id}`, {
      body: JSON.stringify({ message, status }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "PATCH"
    });

    if (response.status === 401) {
      router.replace("/admin/login?next=/admin/orders");
      return;
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error?.message ?? "訂單狀態更新失敗");
      return;
    }

    setDetails((current) => {
      const next = { ...current };
      delete next[order.id];
      return next;
    });
    loadOrders();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  async function toggleDetails(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);

    if (details[id]) return;

    setDetailsLoading(id);
    const response = await fetch(`/api/orders/${id}`);
    const payload = await response.json();
    setDetailsLoading(null);

    if (!response.ok) {
      setError(payload.error?.message ?? "無法讀取訂單明細");
      return;
    }

    setDetails((current) => ({ ...current, [id]: payload.data }));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <section className="container-shell py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Admin</p>
          <h1 className="mt-3 font-serif text-5xl font-semibold">訂單管理</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-full border border-crystal-line bg-white px-5 py-3 text-sm font-semibold text-crystal-ink" href="/admin/products">
            商品管理
          </Link>
          <button className="rounded-full border border-crystal-line bg-white px-5 py-3 text-sm font-semibold text-crystal-ink" onClick={logout} type="button">
            登出
          </button>
        </div>
      </div>
      {error ? <p className="mt-6 rounded-md bg-red-50 p-4 text-red-700">{error}</p> : null}

      <div className="mt-8 rounded-md border border-crystal-line bg-white/72 p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">搜尋訂單</span>
            <input
              className="rounded-md border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="訂單編號、姓名、手機、Email"
              value={searchTerm}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">狀態篩選</span>
            <select className="rounded-md border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              {filterStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "全部訂單" : getStatusLabel(status)}（{statusCounts[status] ?? 0}）
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {filterStatuses.map((status) => (
            <button
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${statusFilter === status ? "border-crystal-ink bg-crystal-ink text-white" : "border-crystal-line bg-white text-crystal-muted"}`}
              key={status}
              onClick={() => setStatusFilter(status)}
              type="button"
            >
              {status === "all" ? "全部" : getStatusLabel(status)} {statusCounts[status] ?? 0}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-crystal-line bg-white/72 shadow-soft">
        <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_1fr] gap-3 border-b border-crystal-line px-5 py-3 text-xs font-bold tracking-[0.16em] text-crystal-muted">
          <span>訂單</span>
          <span>顧客</span>
          <span>金額</span>
          <span>狀態</span>
          <span>操作</span>
        </div>
        {loading ? <p className="p-5 text-crystal-muted">讀取中...</p> : null}
        {!loading && !visibleOrders.length ? <p className="p-5 text-crystal-muted">沒有符合條件的訂單。</p> : null}
        {visibleOrders.map((order) => {
          const detail = details[order.id];
          const nextStatuses = statusTransitions[order.status] ?? [];
          const selectableStatuses = [order.status, ...nextStatuses];
          const canUpdateStatus = nextStatuses.length > 0;

          return (
            <div className="border-b border-crystal-line" key={order.id}>
              <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_1fr] gap-3 px-5 py-4 text-sm">
                <div>
                  <p className="font-semibold">{order.order_number}</p>
                  <p className="text-xs text-crystal-muted">{new Date(order.created_at).toLocaleString("zh-TW")}</p>
                </div>
                <div>
                  <p>{order.customer_name}</p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${order.user_id ? "bg-emerald-50 text-emerald-700" : "bg-crystal-cream text-crystal-muted"}`}>
                    {order.user_id ? "會員" : "非會員"}
                  </span>
                </div>
                <span>NT$ {order.total.toLocaleString()}</span>
                <span>{getStatusLabel(order.status)}</span>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="rounded border border-crystal-line bg-white px-2 py-1 disabled:bg-crystal-pearl disabled:text-crystal-muted"
                    disabled={!canUpdateStatus}
                    onChange={(event) => updateStatus(order, event.target.value)}
                    value={order.status}
                  >
                    {selectableStatuses.map((status) => (
                      <option key={status} value={status}>{getStatusLabel(status)}</option>
                    ))}
                  </select>
                  <button className="rounded-full bg-crystal-ink px-3 py-1 text-xs font-semibold text-white" onClick={() => toggleDetails(order.id)} type="button">
                    {expandedId === order.id ? "收合" : "明細"}
                  </button>
                </div>
              </div>
              {expandedId === order.id ? (
                <div className="bg-crystal-pearl/70 px-5 py-5">
                  {detailsLoading === order.id ? (
                    <p className="text-sm text-crystal-muted">明細讀取中...</p>
                  ) : detail ? (
                    <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
                      <section className="rounded-md border border-crystal-line bg-white/80 p-4">
                        <h2 className="font-semibold">收件資料</h2>
                        <dl className="mt-3 grid gap-2 text-sm text-crystal-muted">
                          <div className="flex justify-between gap-3"><dt>姓名</dt><dd className="text-right text-crystal-ink">{detail.order.customer_name}</dd></div>
                          <div className="flex justify-between gap-3"><dt>手機</dt><dd className="text-right text-crystal-ink">{detail.order.customer_phone}</dd></div>
                          <div className="flex justify-between gap-3"><dt>Email</dt><dd className="text-right text-crystal-ink">{detail.order.customer_email || "-"}</dd></div>
                          <div className="flex justify-between gap-3"><dt>LINE</dt><dd className="text-right text-crystal-ink">{detail.order.line_id || "-"}</dd></div>
                          <div className="flex justify-between gap-3"><dt>會員</dt><dd className="text-right text-crystal-ink">{detail.order.user_id ? "是" : "否"}</dd></div>
                          <div className="flex justify-between gap-3"><dt>配送</dt><dd className="text-right text-crystal-ink">{detail.order.shipping_method}</dd></div>
                          <div className="flex justify-between gap-3"><dt>地址</dt><dd className="text-right text-crystal-ink">{detail.order.shipping_address || "-"}</dd></div>
                        </dl>
                      </section>
                      <section className="rounded-md border border-crystal-line bg-white/80 p-4">
                        <h2 className="font-semibold">商品明細</h2>
                        <div className="mt-3 divide-y divide-crystal-line">
                          {detail.items.map((item: any) => (
                            <div className="py-3 text-sm" key={item.id}>
                              <div className="flex justify-between gap-3">
                                <span className="font-medium">{item.product_name}</span>
                                <span>NT$ {(item.unit_price * item.quantity).toLocaleString()}</span>
                              </div>
                              <p className="mt-1 text-crystal-muted">數量 {item.quantity}</p>
                              {item.options ? <p className="mt-1 text-xs text-crystal-muted">{JSON.stringify(item.options)}</p> : null}
                            </div>
                          ))}
                        </div>
                      </section>
                      <section className="rounded-md border border-crystal-line bg-white/80 p-4">
                        <h2 className="font-semibold">訂單紀錄</h2>
                        <dl className="mt-3 grid gap-2 text-sm">
                          <div className="flex justify-between"><dt className="text-crystal-muted">小計</dt><dd>NT$ {detail.order.subtotal.toLocaleString()}</dd></div>
                          <div className="flex justify-between"><dt className="text-crystal-muted">運費</dt><dd>NT$ {detail.order.shipping_fee.toLocaleString()}</dd></div>
                          <div className="flex justify-between font-semibold"><dt>總計</dt><dd>NT$ {detail.order.total.toLocaleString()}</dd></div>
                        </dl>
                        <div className="mt-4 space-y-2">
                          {detail.events.map((event: any) => (
                            <div className="rounded bg-crystal-cream p-2 text-xs text-crystal-muted" key={event.id}>
                              <p className="font-semibold text-crystal-ink">{getEventMessage(event)}</p>
                              <p>{new Date(event.created_at).toLocaleString("zh-TW")}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
