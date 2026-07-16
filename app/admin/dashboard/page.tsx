import Link from "next/link";
import { ArrowRight, ClipboardList, CreditCard, PackageCheck, ShoppingBag, TrendingUp } from "lucide-react";
import { listOrders, type OrderRecord } from "@/services/order-service";
import { listProducts } from "@/services/product-service";
import { Button } from "@/components/ui/button";
import { getOrderStatus, getOrderStatusLabel, getPaymentStatus } from "@/src/domain/order";

export const dynamic = "force-dynamic";

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

function getPaymentLabel(value?: string | null) {
  if (value === "bank-transfer") return "轉帳";
  if (value === "credit-card") return "信用卡";
  if (value === "line-pay") return "LINE Pay";
  return value ?? "-";
}

function isBankTransferPending(order: OrderRecord) {
  const method = order.payment_method ?? "";
  return getPaymentStatus(order) === "unpaid" && (method.includes("bank") || method.includes("transfer") || method.includes("轉帳"));
}

function sumRevenue(orders: OrderRecord[], predicate: (order: OrderRecord) => boolean) {
  return orders
    .filter((order) => getPaymentStatus(order) === "paid" && predicate(order))
    .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
}

export default async function AdminDashboardPage() {
  const [orders, products] = await Promise.all([
    listOrders(500),
    listProducts({ includeInactive: true, sort: "銷售量" })
  ]);

  const now = new Date();
  const todayKey = getTaipeiDateKey(now.toISOString());
  const monthKey = getTaipeiMonthKey(now.toISOString());
  const pendingOrders = orders.filter((order) => getOrderStatus(order) === "pending");
  const bankTransferPending = orders.filter(isBankTransferPending);
  const shippingQueue = orders.filter((order) => getOrderStatus(order) === "paid" || getOrderStatus(order) === "making");
  const recentOrders = orders.slice(0, 6);
  const popularProducts = products
    .filter((product) => !product.deletedAt)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const metrics = [
    {
      href: "/admin/revenue?range=today",
      icon: TrendingUp,
      label: "今日營收",
      note: "金流狀態已付款計入",
      value: formatCurrency(sumRevenue(orders, (order) => getTaipeiDateKey(order.created_at) === todayKey))
    },
    {
      href: "/admin/revenue?range=month",
      icon: TrendingUp,
      label: "本月營收",
      note: `${monthKey} 累計`,
      value: formatCurrency(sumRevenue(orders, (order) => getTaipeiMonthKey(order.created_at) === monthKey))
    },
    {
      href: "/admin/orders?status=pending",
      icon: ClipboardList,
      label: "待處理訂單",
      note: "等待客人付款",
      value: pendingOrders.length.toLocaleString("zh-TW")
    },
    {
      href: "/admin/orders?status=paid",
      icon: PackageCheck,
      label: "待出貨",
      note: "已付款 / 製作中",
      value: shippingQueue.length.toLocaleString("zh-TW")
    },
    {
      href: "/admin/orders?status=pending",
      icon: CreditCard,
      label: "轉帳待確認",
      note: "轉帳訂單仍待核對",
      value: bankTransferPending.length.toLocaleString("zh-TW")
    },
    {
      href: "/admin/products",
      icon: ShoppingBag,
      label: "商品總數",
      note: "含隱藏與封存",
      value: products.length.toLocaleString("zh-TW")
    }
  ];

  return (
    <section className="container-shell py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Admin Dashboard</p>
          <h1 className="mt-3 font-serif text-5xl font-semibold">後台總覽</h1>
          <p className="mt-3 text-sm text-crystal-muted">快速確認營收、訂單處理進度與熱門商品。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/orders">訂單管理</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products">商品管理</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/bookings">預約管理</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/experiences">體驗設定</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Link className="group border border-crystal-gold/24 bg-white/86 p-5 shadow-[0_18px_48px_rgba(185,151,91,0.08)] transition hover:border-crystal-gold" href={metric.href} key={metric.label}>
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center border border-crystal-line bg-crystal-pearl text-crystal-ink">
                  <Icon size={18} />
                </span>
                <ArrowRight className="text-crystal-muted transition group-hover:translate-x-1 group-hover:text-crystal-ink" size={18} />
              </div>
              <p className="mt-5 text-sm font-semibold text-crystal-muted">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold text-crystal-ink">{metric.value}</p>
              <p className="mt-2 text-xs text-crystal-muted">{metric.note}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-crystal-line bg-white/78 p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-crystal-muted">Orders</p>
              <h2 className="mt-2 text-xl font-semibold">待處理焦點</h2>
            </div>
            <Link className="text-sm font-semibold text-crystal-ink" href="/admin/orders">
              查看全部
            </Link>
          </div>

          <div className="mt-5 divide-y divide-crystal-line">
            {recentOrders.length ? recentOrders.map((order) => (
              <div className="grid gap-3 py-4 text-sm md:grid-cols-[1fr_0.7fr_0.7fr_0.6fr] md:items-center" key={order.id}>
                <div>
                  <p className="font-semibold text-crystal-ink">{order.order_number}</p>
                  <p className="mt-1 text-xs text-crystal-muted">{order.customer_name ?? "-"}</p>
                </div>
                <p className="text-crystal-muted">{getPaymentLabel(order.payment_method)}</p>
                <p className="font-semibold">{formatCurrency(Number(order.total ?? 0))}</p>
                <span className="w-fit bg-crystal-pearl px-3 py-1 text-xs font-semibold text-crystal-muted">
                  {getOrderStatusLabel(getOrderStatus(order))}
                </span>
              </div>
            )) : <p className="py-8 text-sm text-crystal-muted">目前沒有訂單。</p>}
          </div>
        </section>

        <section className="border border-crystal-line bg-white/78 p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-crystal-muted">Products</p>
              <h2 className="mt-2 text-xl font-semibold">熱門商品</h2>
            </div>
            <Link className="text-sm font-semibold text-crystal-ink" href="/admin/products">
              管理商品
            </Link>
          </div>

          <div className="mt-5 divide-y divide-crystal-line">
            {popularProducts.length ? popularProducts.map((product, index) => (
              <Link className="grid grid-cols-[44px_1fr_auto] items-center gap-3 py-4 text-sm transition hover:text-crystal-ink" href={`/admin/products/${product.id}`} key={product.id}>
                <span className="grid h-9 w-9 place-items-center bg-crystal-pearl text-xs font-semibold text-crystal-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="mt-1 text-xs text-crystal-muted">{formatCurrency(product.price)}</p>
                </div>
                <span className="text-xs font-semibold text-crystal-muted">{product.sales.toLocaleString("zh-TW")} sold</span>
              </Link>
            )) : <p className="py-8 text-sm text-crystal-muted">目前沒有商品資料。</p>}
          </div>
        </section>
      </div>
    </section>
  );
}
