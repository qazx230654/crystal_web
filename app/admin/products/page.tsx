"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAdminApi } from "@/hooks/useAdminApi";
import {
  getProductDisplayStatus,
  getProductStatusCounts,
  getProductStatusFilterOptions,
  type ProductStatus
} from "@/src/domain/product";
import {
  ProductFilters,
  ProductStats,
  ProductTable,
  type AdminProduct,
  type ProductOptions
} from "./product-management-panels";

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

      <ProductStats active={statusCounts.active} archived={statusCounts.archived} hidden={statusCounts.hidden} total={statusCounts.total} />
      <ProductFilters
        categoryCounts={categoryCounts}
        categoryFilter={categoryFilter}
        loading={adminApi.loading}
        options={options}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        statusOptions={statusOptions}
        onCategoryChange={setCategoryFilter}
        onReload={loadProducts}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
      />
      <ProductTable loading={adminApi.loading} options={options} products={filteredProducts} onStatusChange={updateStatus} />
    </section>
  );
}
