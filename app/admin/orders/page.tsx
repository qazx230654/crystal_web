"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAdminApi } from "@/hooks/useAdminApi";
import {
  adminOrderFilterTabs,
  matchesAdminOrderFilter
} from "@/src/domain/order";
import { OrderFilters } from "./order-filters";
import { OrderRow } from "./order-row";

export default function AdminOrdersPage() {
  const router = useRouter();
  const adminApi = useAdminApi({ initialLoading: true, nextPath: "/admin/orders" });
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, any>>({});
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const visibleOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = matchesAdminOrderFilter(order, statusFilter);
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
      adminOrderFilterTabs.forEach((tab) => {
        if (matchesAdminOrderFilter(order, tab.id)) {
          counts[tab.id] = (counts[tab.id] ?? 0) + 1;
        }
      });
      return counts;
    }, { all: 0 });
  }, [orders]);

  async function loadOrders() {
    const payload = await adminApi.request<{ data: any[] }>("/api/orders", undefined, {
      errorMessage: "無法讀取訂單"
    });

    if (!payload) {
      return;
    }

    setOrders(payload.data);
  }

  async function runOrderAction(order: any, action: string) {
    let message = "";
    if (action === "cancel_order") {
      const reason = window.prompt("請輸入取消原因");
      if (!reason?.trim()) return;
      message = `訂單已取消：${reason.trim()}`;
    }
    if (action === "refund_order") {
      const reason = window.prompt("請輸入退款原因或備註");
      if (reason === null) return;
      message = reason.trim();
    }

    const payload = await adminApi.request<{ data: any }>(`/api/orders/${order.id}`, {
      body: JSON.stringify({ action, message }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "PATCH"
    }, {
      errorMessage: "訂單操作失敗",
      loading: false
    });

    if (!payload) return;

    setDetails((current) => {
      const next = { ...current };
      delete next[order.id];
      return next;
    });
    loadOrders();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
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
    const payload = await adminApi.request<{ data: any }>(`/api/orders/${id}`, undefined, {
      errorMessage: "無法讀取訂單明細",
      loading: false
    });
    setDetailsLoading(null);

    if (!payload) {
      return;
    }

    setDetails((current) => ({ ...current, [id]: payload.data }));
  }

  useEffect(() => {
    const initialStatus = new URLSearchParams(window.location.search).get("status");
    if (initialStatus && adminOrderFilterTabs.some((tab) => tab.id === initialStatus)) {
      setStatusFilter(initialStatus);
    }
    loadOrders();
  }, []);

  return (
    <section className="bg-white py-10">
      <div className="container-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Admin</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold">訂單管理</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/dashboard">後台總覽</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/products">商品管理</Link>
          </Button>
          <Button onClick={logout} size="sm" type="button" variant="outline">
            登出
          </Button>
        </div>
      </div>
      {adminApi.error ? <p className="mt-6 rounded-md bg-red-50 p-4 text-red-700">{adminApi.error}</p> : null}

      <OrderFilters
        searchTerm={searchTerm}
        statusCounts={statusCounts}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
      />

      <div className="mt-6 overflow-hidden rounded-md border border-crystal-line bg-white/72 shadow-soft">
        <div className="hidden grid-cols-[1.05fr_0.72fr_0.9fr_0.95fr_1.12fr_44px] gap-3 border-b border-crystal-line px-5 py-3 text-xs font-bold tracking-[0.16em] text-crystal-muted lg:grid">
          <span>訂單</span>
          <span>顧客</span>
          <span>金額</span>
          <span>狀態</span>
          <span>操作</span>
          <span aria-hidden="true" />
        </div>
        {adminApi.loading ? <p className="p-5 text-crystal-muted">讀取中...</p> : null}
        {!adminApi.loading && !visibleOrders.length ? <p className="p-5 text-crystal-muted">沒有符合條件的訂單。</p> : null}
        {visibleOrders.map((order) => (
          <OrderRow
            detail={details[order.id]}
            detailsLoading={detailsLoading === order.id}
            expanded={expandedId === order.id}
            key={order.id}
            order={order}
            onAction={runOrderAction}
            onToggle={toggleDetails}
          />
        ))}
      </div>
      </div>
    </section>
  );
}
