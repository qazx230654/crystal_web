import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { listOrders, type OrderRecord } from "@/services/order-service";
import { Button } from "@/components/ui/button";
import { getOrderStatus, getOrderStatusLabel, getPaymentStatus } from "@/src/domain/order";

export const dynamic = "force-dynamic";

type ChartPoint = {
  label: string;
  value: number;
};

function formatCurrency(value: number) {
  return `NT$ ${value.toLocaleString("zh-TW")}`;
}

function getTaipeiDateKey(value?: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("sv-SE", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Taipei",
    year: "numeric"
  }).format(new Date(value));
}

function getTaipeiMonthKey(value?: string) {
  return getTaipeiDateKey(value).slice(0, 7);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function sumRevenue(orders: OrderRecord[], predicate: (order: OrderRecord) => boolean) {
  return orders
    .filter((order) => getPaymentStatus(order) === "paid" && predicate(order))
    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
}

function buildDailyRevenue(orders: OrderRecord[], days = 14): ChartPoint[] {
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - days + 1);
    const key = getTaipeiDateKey(date.toISOString());
    const label = key.slice(5).replace("-", "/");

    return {
      label,
      value: sumRevenue(orders, (order) => getTaipeiDateKey(order.created_at) === key)
    };
  });
}

function buildMonthlyRevenue(orders: OrderRecord[], months = 6): ChartPoint[] {
  const today = new Date();

  return Array.from({ length: months }, (_, index) => {
    const date = addMonths(today, index - months + 1);
    const key = getTaipeiMonthKey(date.toISOString());

    return {
      label: key.replace("-", "/"),
      value: sumRevenue(orders, (order) => getTaipeiMonthKey(order.created_at) === key)
    };
  });
}

export default async function AdminRevenuePage() {
  const orders = await listOrders(1000);
  const todayKey = getTaipeiDateKey(new Date().toISOString());
  const monthKey = getTaipeiMonthKey(new Date().toISOString());
  const dailyRevenue = buildDailyRevenue(orders);
  const monthlyRevenue = buildMonthlyRevenue(orders);
  const revenueOrders = orders.filter((order) => getPaymentStatus(order) === "paid").slice(0, 8);
  const todayRevenue = sumRevenue(orders, (order) => getTaipeiDateKey(order.created_at) === todayKey);
  const monthRevenue = sumRevenue(orders, (order) => getTaipeiMonthKey(order.created_at) === monthKey);
  const paidOrderCount = orders.filter((order) => getPaymentStatus(order) === "paid").length;

  return (
    <section className="container-shell py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Revenue</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold">營收圖表</h1>
          <p className="mt-3 text-sm text-crystal-muted">統計金流狀態為已付款的訂單營收。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/dashboard">
              <ArrowLeft size={16} />
              後台總覽
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/orders">訂單管理</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="今日營收" note={todayKey} value={formatCurrency(todayRevenue)} />
        <StatCard label="本月營收" note={monthKey} value={formatCurrency(monthRevenue)} />
        <StatCard label="已計入訂單" note="payment_status = paid" value={paidOrderCount.toLocaleString("zh-TW")} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <RevenueChart description="近 14 日每日營收" points={dailyRevenue} title="每日營收趨勢" />
        <RevenueChart description="近 6 個月每月營收" points={monthlyRevenue} title="月營收趨勢" />
      </div>

      <section className="mt-8 border border-crystal-line bg-white/78 p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-crystal-muted">Revenue Orders</p>
            <h2 className="mt-2 text-xl font-semibold">最近已計入營收訂單</h2>
          </div>
          <Link className="text-sm font-semibold text-crystal-ink" href="/admin/orders">
            查看訂單
          </Link>
        </div>

        <div className="mt-5 divide-y divide-crystal-line">
          {revenueOrders.length ? revenueOrders.map((order) => (
            <div className="grid gap-3 py-4 text-sm md:grid-cols-[1fr_0.7fr_0.7fr_0.6fr] md:items-center" key={order.id}>
              <div>
                <p className="font-semibold text-crystal-ink">{order.order_number}</p>
                <p className="mt-1 text-xs text-crystal-muted">{order.customer_name ?? "-"}</p>
              </div>
              <p className="text-crystal-muted">{order.created_at ? new Date(order.created_at).toLocaleString("zh-TW") : "-"}</p>
              <p className="font-semibold">{formatCurrency(Number(order.total ?? 0))}</p>
              <span className="w-fit bg-crystal-pearl px-3 py-1 text-xs font-semibold text-crystal-muted">
                {getOrderStatusLabel(getOrderStatus(order))}
              </span>
            </div>
          )) : <p className="py-8 text-sm text-crystal-muted">目前沒有可計入營收的訂單。</p>}
        </div>
      </section>
    </section>
  );
}

function StatCard({ label, note, value }: { label: string; note: string; value: string }) {
  return (
    <div className="border border-crystal-line bg-white/78 p-5 shadow-soft">
      <p className="text-sm font-semibold text-crystal-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-crystal-ink">{value}</p>
      <p className="mt-2 text-xs text-crystal-muted">{note}</p>
    </div>
  );
}

function RevenueChart({ description, points, title }: { description: string; points: ChartPoint[]; title: string }) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <section className="border border-crystal-line bg-white/78 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-crystal-muted">Chart</p>
          <h2 className="mt-2 text-xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-crystal-muted">{description}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center border border-crystal-line bg-crystal-pearl text-crystal-ink">
          <BarChart3 size={18} />
        </span>
      </div>

      <div className="mt-6 flex h-72 items-end gap-2 border-b border-crystal-line pb-4">
        {points.map((point) => {
          const height = Math.max(6, Math.round((point.value / maxValue) * 100));

          return (
            <div className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2" key={point.label}>
              <span className="text-center text-[11px] font-semibold text-crystal-muted">{point.value ? formatCurrency(point.value).replace("NT$ ", "") : "0"}</span>
              <div className="relative flex flex-1 items-end">
                <div className="w-full bg-crystal-gold/70 transition hover:bg-crystal-gold" style={{ height: `${height}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
        {points.map((point) => (
          <span className="truncate text-center text-[11px] text-crystal-muted" key={point.label}>
            {point.label}
          </span>
        ))}
      </div>
    </section>
  );
}
