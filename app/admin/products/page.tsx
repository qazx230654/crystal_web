"use client";

import Link from "next/link";
import { RefreshCw, Search, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  images?: string[];
  description: string;
  stockLabel: string;
  sales: number;
  createdAt: string;
  status?: string;
};

type ProductOptions = {
  benefits: string[];
  categories: Record<string, string>;
  minerals: string[];
  statuses: Record<string, string>;
};

type ProductPayload = {
  data: AdminProduct[];
  meta: {
    count: number;
    options: ProductOptions;
    source: string;
    syncedAt: string;
  };
};

type ErrorPayload = {
  error?: {
    message?: string;
  };
};

type ProductFormState = {
  benefits: string[];
  category: string[];
  description: string;
  image: string;
  images: string;
  minerals: string[];
  name: string;
  originalPrice: string;
  price: string;
  slug: string;
  status: string;
  stockLabel: string;
};

const defaultFormState: ProductFormState = {
  benefits: [],
  category: [],
  description: "",
  image: "",
  images: "",
  minerals: [],
  name: "",
  originalPrice: "",
  price: "",
  slug: "",
  status: "active",
  stockLabel: "現貨 2-5 個工作天寄出"
};

function formatPrice(value: number) {
  return `NT$ ${value.toLocaleString()}`;
}

function getSourceLabel(source?: string) {
  if (source === "google-drive") return "Google Drive";
  if (source === "supabase") return "Supabase";
  return "Mock + Admin";
}

function getStatusTone(status?: string) {
  if (status === "draft") return "bg-slate-100 text-slate-700";
  if (status === "hidden") return "bg-zinc-100 text-zinc-700";
  if (status === "soldout") return "bg-red-50 text-red-700";
  return "bg-emerald-50 text-emerald-700";
}

function isProductPayload(payload: ProductPayload | ErrorPayload | null): payload is ProductPayload {
  return Boolean(payload && "data" in payload && "meta" in payload);
}

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [meta, setMeta] = useState<ProductPayload["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formState, setFormState] = useState<ProductFormState>(defaultFormState);

  async function loadProducts() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/products");
    const payload = (await response.json().catch(() => null)) as ProductPayload | ErrorPayload | null;
    setLoading(false);

    if (response.status === 401) {
      router.replace("/admin/login?next=/admin/products");
      return;
    }

    if (!response.ok || !isProductPayload(payload)) {
      const errorPayload = payload as ErrorPayload | null;
      setError(errorPayload?.error?.message ?? "無法讀取商品資料");
      return;
    }

    setProducts(payload.data);
    setMeta(payload.meta);
  }

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        benefits: formState.benefits,
        category: formState.category,
        description: formState.description,
        image: formState.image,
        images: formState.images
          .split(/\n|,/)
          .map((item) => item.trim())
          .filter(Boolean),
        minerals: formState.minerals,
        name: formState.name,
        originalPrice: formState.originalPrice ? Number(formState.originalPrice) : undefined,
        price: Number(formState.price),
        slug: formState.slug || undefined,
        status: formState.status,
        stockLabel: formState.stockLabel
      })
    });

    const payload = (await response.json().catch(() => null)) as ErrorPayload | null;
    setSaving(false);

    if (response.status === 401) {
      router.replace("/admin/login?next=/admin/products");
      return;
    }

    if (!response.ok) {
      setError(payload?.error?.message ?? "新增商品失敗");
      return;
    }

    setFormState(defaultFormState);
    loadProducts();
  }

  async function updateStatus(productId: string, status: string) {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const payload = (await response.json().catch(() => null)) as ErrorPayload | null;

    if (response.status === 401) {
      router.replace("/admin/login?next=/admin/products");
      return;
    }

    if (!response.ok) {
      setError(payload?.error?.message ?? "更新商品狀態失敗");
      return;
    }

    setProducts((current) => current.map((item) => (item.id === productId ? { ...item, status } : item)));
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const options = meta?.options;
  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.trim().toLowerCase();
    const matchesCategory = categoryFilter === "all" || product.category.includes(categoryFilter);
    const matchesKeyword =
      !keyword ||
      [
        product.name,
        product.slug,
        product.description,
        product.stockLabel,
        ...product.minerals,
        ...product.benefits
      ].some((value) => String(value ?? "").toLowerCase().includes(keyword));

    return matchesCategory && matchesKeyword;
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
  const statusCounts = products.reduce(
    (counts, product) => {
      const status = product.status ?? "active";
      counts.total += 1;
      if (status === "active") counts.active += 1;
      if (status === "hidden") counts.hidden += 1;
      if (status === "soldout") counts.soldout += 1;
      return counts;
    },
    { active: 0, hidden: 0, soldout: 0, total: 0 }
  );

  return (
    <section className="container-shell py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Admin</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold">商品管理</h1>
          <p className="mt-3 text-sm text-crystal-muted">新增商品、整理礦石與分類資料，並控制商品上架狀態。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="border border-crystal-line bg-white px-4 py-2 text-sm text-crystal-muted" href="/admin/orders">
            訂單管理
          </Link>
          <button className="border border-crystal-line bg-white px-4 py-2 text-sm text-crystal-muted" onClick={logout} type="button">
            登出
          </button>
        </div>
      </div>

      {error ? <p className="mt-6 border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        <div className="border border-crystal-line bg-white/78 p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-crystal-muted">Products</p>
          <p className="mt-4 text-2xl font-semibold">{statusCounts.total}</p>
          <p className="mt-2 text-sm text-crystal-muted">商品總數</p>
        </div>
        <div className="border border-crystal-line bg-white/78 p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-crystal-muted">Active</p>
          <p className="mt-4 text-2xl font-semibold">{statusCounts.active}</p>
          <p className="mt-2 text-sm text-crystal-muted">已上架商品</p>
        </div>
        <div className="border border-crystal-line bg-white/78 p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-crystal-muted">Hidden</p>
          <p className="mt-4 text-2xl font-semibold">{statusCounts.hidden}</p>
          <p className="mt-2 text-sm text-crystal-muted">隱藏中的商品</p>
        </div>
        <div className="border border-crystal-line bg-white/78 p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-crystal-muted">Sold Out</p>
          <p className="mt-4 text-2xl font-semibold">{statusCounts.soldout}</p>
          <p className="mt-2 text-sm text-crystal-muted">售完展示商品</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-crystal-line bg-white/60 px-5 py-3 text-sm text-crystal-muted">
        <p>
          目前商品來源：<span className="font-semibold text-crystal-ink">{getSourceLabel(meta?.source)}</span>
        </p>
        <p>{meta?.syncedAt ? `更新時間 ${new Date(meta.syncedAt).toLocaleString("zh-TW")}` : "等待同步資料"}</p>
      </div>

      <form className="mt-6 border border-crystal-line bg-white/78 p-6 shadow-soft" onSubmit={createProduct}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-crystal-muted">Create Product</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold">新增商品</h2>
          </div>
          <button className="inline-flex items-center gap-2 bg-crystal-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={saving || !options} type="submit">
            {saving ? <RefreshCw className="animate-spin" size={16} /> : null}
            {saving ? "儲存中..." : "新增商品"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">商品名稱</span>
            <input className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} value={formState.name} />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">Slug（可留空自動產生）</span>
            <input className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" onChange={(event) => setFormState((current) => ({ ...current, slug: event.target.value }))} value={formState.slug} />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">商品主圖</span>
            <input className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" onChange={(event) => setFormState((current) => ({ ...current, image: event.target.value }))} placeholder="https://..." value={formState.image} />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">其他商品圖</span>
            <textarea className="min-h-24 border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" onChange={(event) => setFormState((current) => ({ ...current, images: event.target.value }))} placeholder="可用逗號或換行分隔多張圖片網址" value={formState.images} />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">折扣價格</span>
            <input className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" min="0" onChange={(event) => setFormState((current) => ({ ...current, price: event.target.value }))} type="number" value={formState.price} />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">原價（可留空）</span>
            <input className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" min="0" onChange={(event) => setFormState((current) => ({ ...current, originalPrice: event.target.value }))} type="number" value={formState.originalPrice} />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">商品狀態</span>
            <select className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value }))} value={formState.status}>
              {Object.entries(options?.statuses ?? {}).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">出貨/庫存文字</span>
            <input className="border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" onChange={(event) => setFormState((current) => ({ ...current, stockLabel: event.target.value }))} value={formState.stockLabel} />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">商品描述</span>
            <textarea className="min-h-28 border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} value={formState.description} />
          </label>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <fieldset className="border border-crystal-line bg-white/80 p-4">
            <legend className="px-2 text-xs font-bold tracking-[0.16em] text-crystal-muted">商品分類</legend>
            <div className="mt-3 grid gap-2">
              {Object.entries(options?.categories ?? {})
                .filter(([key]) => key !== "all")
                .map(([key, label]) => (
                  <label className="flex items-center gap-3 text-sm" key={key}>
                    <input checked={formState.category.includes(key)} onChange={() => setFormState((current) => ({ ...current, category: toggleValue(current.category, key) }))} type="checkbox" />
                    <span>{label}</span>
                  </label>
                ))}
            </div>
          </fieldset>

          <fieldset className="border border-crystal-line bg-white/80 p-4">
            <legend className="px-2 text-xs font-bold tracking-[0.16em] text-crystal-muted">礦石選擇</legend>
            <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto">
              {(options?.minerals ?? []).map((item) => (
                <label className="flex items-center gap-3 text-sm" key={item}>
                  <input checked={formState.minerals.includes(item)} onChange={() => setFormState((current) => ({ ...current, minerals: toggleValue(current.minerals, item) }))} type="checkbox" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="border border-crystal-line bg-white/80 p-4">
            <legend className="px-2 text-xs font-bold tracking-[0.16em] text-crystal-muted">功效標籤</legend>
            <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto">
              {(options?.benefits ?? []).map((item) => (
                <label className="flex items-center gap-3 text-sm" key={item}>
                  <input checked={formState.benefits.includes(item)} onChange={() => setFormState((current) => ({ ...current, benefits: toggleValue(current.benefits, item) }))} type="checkbox" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </form>

      <div className="mt-6 border border-crystal-line bg-white/78 p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-end">
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
          <button className="inline-flex items-center justify-center gap-2 bg-crystal-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={loading} onClick={loadProducts} type="button">
            <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
            重新讀取
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden border border-crystal-line bg-white/78 shadow-soft">
        <div className="hidden grid-cols-[96px_1.2fr_0.8fr_0.7fr_0.8fr_0.8fr] gap-4 border-b border-crystal-line px-5 py-3 text-xs font-bold tracking-[0.16em] text-crystal-muted lg:grid">
          <span>圖片</span>
          <span>商品</span>
          <span>分類 / 礦石</span>
          <span>價格</span>
          <span>目前狀態</span>
          <span>操作</span>
        </div>

        {loading ? <p className="p-5 text-crystal-muted">讀取商品中...</p> : null}
        {!loading && !filteredProducts.length ? <p className="p-5 text-crystal-muted">沒有符合條件的商品。</p> : null}

        {filteredProducts.map((product) => (
          <div className="grid gap-4 border-b border-crystal-line p-5 text-sm lg:grid-cols-[96px_1.2fr_0.8fr_0.7fr_0.8fr_0.8fr] lg:items-center" key={product.id}>
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
              <span className={`inline-flex w-fit px-3 py-1 text-xs font-semibold ${getStatusTone(product.status)}`}>
                {options?.statuses[product.status ?? "active"] ?? product.status ?? "上架中"}
              </span>
              <span className="text-xs text-crystal-muted">{product.stockLabel}</span>
            </div>
            <div className="grid gap-2">
              <select className="border border-crystal-line bg-white px-3 py-2 text-xs outline-crystal-rose" onChange={(event) => updateStatus(product.id, event.target.value)} value={product.status ?? "active"}>
                {Object.entries(options?.statuses ?? {}).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <Link className="inline-flex items-center justify-center gap-2 border border-crystal-line bg-white px-3 py-2 text-xs font-semibold text-crystal-muted transition hover:text-crystal-ink" href={`/products/${product.slug}`} target="_blank">
                <ShoppingBag size={14} />
                前台查看
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
