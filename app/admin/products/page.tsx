"use client";

import Link from "next/link";
import { Edit3, Plus, RefreshCw, Search, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAdminApi } from "@/hooks/useAdminApi";
import {
  getProductDisplayStatus,
  getProductStatusCounts,
  getProductStatusColor,
  getProductStatusFilterOptions,
  getProductStatusLabel,
  type ProductStatus
} from "@/src/domain/product";

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string[];
  minerals: string[];
  benefits: string[];
  image: string;
  description: string;
  stockLabel: string;
  deletedAt?: string | null;
  status?: ProductStatus;
};

type ProductOptions = {
  categories: Record<string, string>;
  statuses: Record<ProductStatus, string>;
};

type ProductPayload = {
  data: AdminProduct[];
  meta: {
    options: ProductOptions;
  };
};

type ErrorPayload = {
  error?: {
    message?: string;
  };
};

function formatPrice(value: number) {
  return `NT$ ${value.toLocaleString()}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function isProductPayload(payload: ProductPayload | ErrorPayload | null): payload is ProductPayload {
  return Boolean(payload && "data" in payload && "meta" in payload);
}

export default function AdminProductsPage() {
  const router = useRouter();
  const adminApi = useAdminApi({ initialLoading: true, nextPath: "/admin/products" });
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [options, setOptions] = useState<ProductOptions | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadProducts() {
    const payload = await adminApi.request<ProductPayload>("/api/admin/products", undefined, {
      errorMessage: "無法讀取商品資料"
    });

    if (!isProductPayload(payload)) {
      if (payload) adminApi.setError("無法讀取商品資料");
      return;
    }

    setProducts(payload.data);
    setOptions(payload.meta.options);
  }

  async function updateStatus(productId: string, status: ProductStatus) {
    const payload = await adminApi.request<unknown>(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    }, {
      errorMessage: "更新商品狀態失敗",
      loading: false
    });

    if (!payload) return;

    setProducts((current) => current.map((item) => (item.id === productId ? { ...item, status } : item)));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.trim().toLowerCase();
    const status = getProductDisplayStatus(product);
    const matchesCategory = categoryFilter === "all" || product.category.includes(categoryFilter);
    const matchesStatus = statusFilter === "all" || statusFilter === status;
    const matchesKeyword =
      !keyword ||
      [product.name, product.slug, product.description, product.stockLabel, ...product.minerals, ...product.benefits].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      );

    return matchesCategory && matchesStatus && matchesKeyword;
  });

  const categoryCounts = products.reduce<Record<string, number>>(
    (counts, product) => {
      counts.all += 1;
      product.category.forEach((category) => {
        counts[category] = (counts[category] ?? 0) + 1;
      });
      return counts;
    },
    { all: 0 }
  );
  const statusCounts = getProductStatusCounts(products);
  const statusOptions = getProductStatusFilterOptions(statusCounts);

  return (
    <section className="container-shell py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Admin</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold">商品管理</h1>
          <p className="mt-3 text-sm text-crystal-muted">管理商品列表、庫存狀態，新增與編輯商品內容。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/admin/products/new">
              <Plus size={16} />
              新增商品
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/dashboard">後台總覽</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/orders">訂單管理</Link>
          </Button>
          <Button onClick={logout} size="sm" type="button" variant="outline">
            登出
          </Button>
        </div>
      </div>

      {adminApi.error ? <p className="mt-6 border border-red-100 bg-red-50 p-4 text-sm text-red-700">{adminApi.error}</p> : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        <StatCard label="商品總數" title="Products" value={statusCounts.total} />
        <StatCard label="已上架商品" title="Active" value={statusCounts.active} />
        <StatCard label="隱藏中的商品" title="Hidden" value={statusCounts.hidden} />
        <StatCard label="已封存商品" title="Archived" value={statusCounts.archived} />
      </div>

      <div className="mt-6 border border-crystal-line bg-white/78 p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">搜尋商品</span>
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-crystal-muted" size={16} />
              <input className="w-full border border-crystal-line bg-white px-10 py-3 text-sm outline-crystal-rose" onChange={(event) => setSearchTerm(event.target.value)} placeholder="商品名稱、礦石、功效、slug" value={searchTerm} />
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">分類篩選</span>
            <select className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" onChange={(event) => setCategoryFilter(event.target.value)} value={categoryFilter}>
              {Object.entries(options?.categories ?? { all: "全部商品" }).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}（{categoryCounts[key] ?? 0}）
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">狀態篩選</span>
            <select className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex items-center justify-center gap-2 border border-crystal-gold/45 bg-white px-5 py-3 text-xs font-semibold tracking-[0.08em] text-crystal-ink transition hover:bg-crystal-champagne/30 disabled:opacity-60" disabled={adminApi.loading} onClick={loadProducts} type="button">
            <RefreshCw className={adminApi.loading ? "animate-spin" : ""} size={16} />
            重新讀取
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden border border-crystal-line bg-white/78 shadow-soft">
        <div className="hidden grid-cols-[96px_1.2fr_0.8fr_0.7fr_0.8fr_0.9fr] gap-4 border-b border-crystal-line px-5 py-3 text-xs font-bold tracking-[0.16em] text-crystal-muted lg:grid">
          <span>圖片</span>
          <span>商品</span>
          <span>分類 / 礦石</span>
          <span>價格</span>
          <span>目前狀態</span>
          <span>操作</span>
        </div>

        {adminApi.loading ? <p className="p-5 text-crystal-muted">讀取商品中...</p> : null}
        {!adminApi.loading && !filteredProducts.length ? <p className="p-5 text-crystal-muted">沒有符合條件的商品。</p> : null}

        {filteredProducts.map((product) => (
          <div className="grid gap-4 border-b border-crystal-line p-5 text-sm lg:grid-cols-[96px_1.2fr_0.8fr_0.7fr_0.8fr_0.9fr] lg:items-center" key={product.id}>
            <img alt={product.name} className="h-24 w-24 border border-crystal-line object-cover" src={product.image} />
            <div>
              <p className="font-semibold text-crystal-ink">{product.name}</p>
              <p className="mt-1 text-xs text-crystal-muted">{product.slug}</p>
              <p className="mt-2 line-clamp-2 text-xs leading-6 text-crystal-muted">{product.description}</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-1">
                {product.category.map((category) => (
                  <span className="bg-white px-2 py-1 text-xs text-crystal-muted ring-1 ring-crystal-line" key={category}>
                    {options?.categories[category] ?? category}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {product.minerals.slice(0, 5).map((item) => (
                  <span className="bg-crystal-pearl px-2 py-1 text-[11px] text-crystal-muted" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold">{formatPrice(product.price)}</p>
              {product.originalPrice ? <p className="text-xs text-crystal-muted line-through">{formatPrice(product.originalPrice)}</p> : null}
            </div>
            <div className="grid gap-2">
              <span className={`inline-flex w-fit px-3 py-1 text-xs font-semibold ${getProductStatusColor(getProductDisplayStatus(product))}`}>
                {product.deletedAt ? getProductStatusLabel("archived") : options?.statuses[product.status ?? "active"] ?? getProductStatusLabel(product.status)}
              </span>
              {product.deletedAt ? <span className="text-xs text-amber-700">封存於 {formatDateTime(product.deletedAt)}</span> : null}
              <span className="text-xs text-crystal-muted">{product.stockLabel}</span>
            </div>
            <div className="grid gap-2">
              <select className="border border-crystal-line bg-white px-3 py-2 text-xs outline-crystal-rose" onChange={(event) => updateStatus(product.id, event.target.value as ProductStatus)} value={product.status ?? "active"}>
                {Object.entries(options?.statuses ?? {}).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <Link className="inline-flex items-center justify-center gap-2 border border-crystal-line bg-white px-3 py-2 text-xs font-semibold text-crystal-muted transition hover:text-crystal-ink" href={`/products/${product.slug}`} target="_blank">
                  <ShoppingBag size={14} />
                  前台
                </Link>
                <Link className="inline-flex items-center justify-center gap-2 border border-crystal-line bg-white px-3 py-2 text-xs font-semibold text-crystal-muted transition hover:text-crystal-ink" href={`/admin/products/${product.id}`}>
                  <Edit3 size={14} />
                  編輯
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, title, value }: { label: string; title: string; value: number }) {
  return (
    <div className="border border-crystal-line bg-white/78 p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-crystal-muted">{title}</p>
      <p className="mt-4 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-crystal-muted">{label}</p>
    </div>
  );
}
