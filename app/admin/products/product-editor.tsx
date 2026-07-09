"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, ImagePlus, RefreshCw, Save } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminApi } from "@/hooks/useAdminApi";
import { defaultStockLabelForStatus, productStatusLabels, type ProductStatus } from "@/src/domain/product";

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
  deletedAt?: string | null;
  status?: ProductStatus;
};

type ProductOptions = {
  benefits: string[];
  categories: Record<string, string>;
  minerals: string[];
  statuses: Record<ProductStatus, string>;
};

type ProductPayload = {
  data: AdminProduct[];
  meta: {
    options: ProductOptions;
  };
};

type SingleProductPayload = {
  data: AdminProduct;
};

type ErrorPayload = {
  error?: {
    message?: string;
  };
};

type ProductFormState = {
  benefits: string[];
  category: string[];
  customBenefits: string;
  customMinerals: string;
  description: string;
  image: string;
  images: string[];
  minerals: string[];
  name: string;
  originalPrice: string;
  price: string;
  slug: string;
  status: ProductStatus;
  stockLabel: string;
};

const defaultFormState: ProductFormState = {
  benefits: [],
  category: [],
  customBenefits: "",
  customMinerals: "",
  description: "",
  image: "",
  images: [],
  minerals: [],
  name: "",
  originalPrice: "",
  price: "",
  slug: "",
  status: "active",
  stockLabel: defaultStockLabelForStatus("active")
};

const fieldClass = "border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose";

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function parseList(value: string) {
  return value
    .split(/\n|,|，|、/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isOptionsPayload(payload: ProductPayload | ErrorPayload | null): payload is ProductPayload {
  return Boolean(payload && "data" in payload && "meta" in payload);
}

function isSingleProductPayload(payload: SingleProductPayload | ErrorPayload | null): payload is SingleProductPayload {
  return Boolean(payload && "data" in payload);
}

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const nextPath = productId ? `/admin/products/${productId}` : "/admin/products/new";
  const adminApi = useAdminApi({ initialLoading: true, nextPath });
  const { error, loading, request, setError, setLoading } = adminApi;
  const [formState, setFormState] = useState<ProductFormState>(defaultFormState);
  const [options, setOptions] = useState<ProductOptions | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [extraImageFiles, setExtraImageFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deletedAt, setDeletedAt] = useState<string | null>(null);

  const title = productId ? "編輯商品" : "新增商品";
  const submitLabel = productId ? "儲存變更" : "新增商品";
  const mainImagePreview = useMemo(() => {
    if (mainImageFile) return URL.createObjectURL(mainImageFile);
    return formState.image;
  }, [formState.image, mainImageFile]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const optionsPayload = await request<ProductPayload>("/api/admin/products", undefined, {
        errorMessage: "無法讀取商品選項"
      });

      if (!isOptionsPayload(optionsPayload)) {
        if (optionsPayload) setError("無法讀取商品選項");
        setLoading(false);
        return;
      }

      setOptions(optionsPayload.meta.options);

      if (!productId) {
        setLoading(false);
        return;
      }

      const productPayload = await request<SingleProductPayload>(`/api/admin/products/${productId}`, undefined, {
        errorMessage: "無法讀取商品資料"
      });
      setLoading(false);

      if (!isSingleProductPayload(productPayload)) {
        if (productPayload) setError("無法讀取商品資料");
        return;
      }

      const product = productPayload.data;
      setDeletedAt(product.deletedAt ?? null);
      setFormState({
        benefits: product.benefits ?? [],
        category: product.category ?? [],
        customBenefits: "",
        customMinerals: "",
        description: product.description ?? "",
        image: product.image ?? "",
        images: product.images ?? [],
        minerals: product.minerals ?? [],
        name: product.name ?? "",
        originalPrice: product.originalPrice ? String(product.originalPrice) : "",
        price: String(product.price ?? ""),
        slug: product.slug ?? "",
        status: (product.status as ProductStatus | undefined) ?? "active",
        stockLabel: product.stockLabel ?? defaultStockLabelForStatus((product.status as ProductStatus | undefined) ?? "active")
      });
    }

    void load();
  }, [productId, request, setError, setLoading]);

  useEffect(() => {
    return () => {
      if (mainImageFile && mainImagePreview.startsWith("blob:")) URL.revokeObjectURL(mainImagePreview);
    };
  }, [mainImageFile, mainImagePreview]);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const payload = await request<{ data?: { url?: string } }>("/api/admin/product-images", {
      body: formData,
      method: "POST"
    }, {
      errorMessage: "圖片上傳失敗",
      loading: false
    });

    if (!payload?.data?.url) {
      throw new Error("圖片上傳失敗");
    }

    return payload.data.url;
  }

  function validateForm() {
    if (!formState.name.trim()) return "請輸入商品名稱";
    if (!formState.price || Number(formState.price) <= 0) return "請輸入正確的折扣價格";
    if (formState.originalPrice && Number(formState.originalPrice) < Number(formState.price)) return "原價不可低於折扣價格";
    if (!formState.category.length) return "請至少勾選一個分類";
    if (!formState.minerals.length && !parseList(formState.customMinerals).length) return "請至少勾選或輸入一種礦石";
    if (!formState.description.trim()) return "請輸入商品描述";
    if (!formState.stockLabel.trim()) return "請輸入出貨或庫存文字";
    if (!formState.image && !mainImageFile) return "請上傳商品主圖";
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const imageUrl = mainImageFile ? await uploadImage(mainImageFile) : formState.image;
      const uploadedExtraImages = await Promise.all(extraImageFiles.map(uploadImage));
      const images = Array.from(new Set([imageUrl, ...formState.images.filter(Boolean), ...uploadedExtraImages]));
      const minerals = Array.from(new Set([...formState.minerals, ...parseList(formState.customMinerals)]));
      const benefits = Array.from(new Set([...formState.benefits, ...parseList(formState.customBenefits)]));
      const payload = await request<unknown>(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        body: JSON.stringify({
          benefits,
          category: formState.category,
          description: formState.description,
          image: imageUrl,
          images,
          minerals,
          name: formState.name,
          originalPrice: formState.originalPrice ? Number(formState.originalPrice) : undefined,
          price: Number(formState.price),
          ...(productId ? { slug: formState.slug || undefined } : {}),
          status: formState.status,
          stockLabel: formState.stockLabel
        }),
        headers: { "Content-Type": "application/json" },
        method: productId ? "PATCH" : "POST"
      }, {
        errorMessage: "商品儲存失敗",
        loading: false
      });

      if (!payload) return;

      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "商品儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveAction(action: "archive" | "restore") {
    if (!productId) return;
    const isArchive = action === "archive";
    const confirmed = window.confirm(isArchive ? "確定要封存這個商品嗎？封存後前台將不再顯示。" : "確定要解除封存這個商品嗎？解除後會依照目前商品狀態顯示。");

    if (!confirmed) return;

    setArchiving(true);
    setError(null);

    try {
      const payload = await request<{ data?: { deleted_at?: string | null } }>(`/api/admin/products/${productId}`, {
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      }, {
        errorMessage: isArchive ? "商品封存失敗" : "解除封存失敗",
        loading: false
      });

      if (!payload) return;

      setDeletedAt(payload?.data?.deleted_at ?? null);
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : isArchive ? "商品封存失敗" : "解除封存失敗");
    } finally {
      setArchiving(false);
    }
  }

  if (loading) {
    return <p className="container-shell py-12 text-crystal-muted">讀取商品表單中...</p>;
  }

  return (
    <section className="container-shell py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Product Admin</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold">{title}</h1>
          <p className="mt-3 text-sm text-crystal-muted">填寫商品資訊、上傳圖片、儲存商品，上架呈現。</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/products">返回商品管理</Link>
        </Button>
      </div>

      {error ? <p className="mt-6 border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {deletedAt ? <p className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">此商品已封存，前台不會顯示。你仍可修改資料，之後也能解除封存。</p> : null}

      <form className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <section className="border border-crystal-line bg-white/80 p-6 shadow-soft">
            <h2 className="text-xl font-semibold">基本資料</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">商品名稱 *</span>
                <input className={fieldClass} onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} value={formState.name} />
              </label>
              {productId ? (
                <label className="grid gap-2">
                  <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">系統 Slug</span>
                  <input className={`${fieldClass} bg-crystal-pearl text-crystal-muted`} readOnly value={formState.slug} />
                </label>
              ) : (
                <div className="grid gap-2 border border-crystal-line bg-crystal-pearl/70 px-4 py-3 text-sm text-crystal-muted">
                  <span className="text-xs font-bold tracking-[0.16em]">系統 Slug</span>
                  <span>新增商品時會依商品名稱自動產生，不需手動填寫。</span>
                </div>
              )}
              <label className="grid gap-2">
                <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">折扣價格 *</span>
                <input className={fieldClass} min="0" onChange={(event) => setFormState((current) => ({ ...current, price: event.target.value }))} type="number" value={formState.price} />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">原價</span>
                <input className={fieldClass} min="0" onChange={(event) => setFormState((current) => ({ ...current, originalPrice: event.target.value }))} type="number" value={formState.originalPrice} />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">商品狀態 *</span>
                <select className={fieldClass} onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as ProductStatus }))} value={formState.status}>
                  {Object.entries(options?.statuses ?? productStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">出貨/庫存文字 *</span>
                <input className={fieldClass} onChange={(event) => setFormState((current) => ({ ...current, stockLabel: event.target.value }))} value={formState.stockLabel} />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">商品描述 *</span>
                <textarea className={`${fieldClass} min-h-32`} onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} value={formState.description} />
              </label>
            </div>
          </section>

          <section className="border border-crystal-line bg-white/80 p-6 shadow-soft">
            <h2 className="text-xl font-semibold">分類與標籤</h2>
            <div className="mt-5 grid gap-6 lg:grid-cols-3">
              <Checklist
                items={Object.entries(options?.categories ?? {}).filter(([key]) => key !== "all")}
                label="商品分類 *"
                selected={formState.category}
                onToggle={(value) => setFormState((current) => ({ ...current, category: toggleValue(current.category, value) }))}
              />
              <Checklist
                items={(options?.minerals ?? []).map((item) => [item, item])}
                label="礦石選擇 *"
                selected={formState.minerals}
                onToggle={(value) => setFormState((current) => ({ ...current, minerals: toggleValue(current.minerals, value) }))}
              />
              <Checklist
                items={(options?.benefits ?? []).map((item) => [item, item])}
                label="功效標籤"
                selected={formState.benefits}
                onToggle={(value) => setFormState((current) => ({ ...current, benefits: toggleValue(current.benefits, value) }))}
              />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">補充礦石</span>
                <textarea className={`${fieldClass} min-h-24`} onChange={(event) => setFormState((current) => ({ ...current, customMinerals: event.target.value }))} placeholder="可用逗號、頓號或換行分隔" value={formState.customMinerals} />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">補充功效</span>
                <textarea className={`${fieldClass} min-h-24`} onChange={(event) => setFormState((current) => ({ ...current, customBenefits: event.target.value }))} placeholder="可用逗號、頓號或換行分隔" value={formState.customBenefits} />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-crystal-line bg-white/80 p-6 shadow-soft">
            <h2 className="text-xl font-semibold">商品圖片</h2>
            <label className="mt-5 grid cursor-pointer place-items-center border border-dashed border-crystal-muted bg-white p-5 text-center text-sm text-crystal-muted">
              {mainImagePreview ? (
                <span className="relative mb-4 block aspect-square w-full overflow-hidden bg-crystal-pearl">
                  <img alt="商品主圖預覽" className="h-full w-full object-cover" src={mainImagePreview} />
                </span>
              ) : (
                <ImagePlus className="mb-3" size={28} />
              )}
              <span className="font-semibold text-crystal-ink">上傳商品主圖 *</span>
              <span className="mt-1 text-xs">JPG、PNG、WEBP、GIF，單張 6MB 內</span>
              <input accept="image/*" className="sr-only" onChange={(event) => setMainImageFile(event.target.files?.[0] ?? null)} type="file" />
            </label>

            <label className="mt-5 grid gap-2">
              <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">補充商品圖</span>
              <input accept="image/*" className={`${fieldClass} box-border w-full file:mr-4 file:border-0 file:bg-crystal-pearl file:px-3 file:py-2 file:text-xs file:font-semibold file:text-crystal-muted`} multiple onChange={(event) => setExtraImageFiles(Array.from(event.target.files ?? []))} type="file" />
            </label>

            {formState.images.length ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {formState.images.slice(0, 6).map((image) => (
                  <span className="relative aspect-square overflow-hidden bg-crystal-pearl" key={image}>
                    <img alt="既有商品圖" className="h-full w-full object-cover" src={image} />
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <button className="flex w-full items-center justify-center gap-2 border border-crystal-gold/45 bg-white px-6 py-4 text-xs font-semibold tracking-[0.08em] text-crystal-ink transition hover:bg-crystal-champagne/30 disabled:opacity-60" disabled={saving || !options} type="submit">
            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? "儲存中..." : submitLabel}
          </button>

          {productId ? (
            <div className="border border-crystal-line bg-white/80 p-4 text-sm text-crystal-muted shadow-soft">
              <button
                className="flex w-full items-center justify-center gap-2 border border-crystal-gold/35 bg-white px-5 py-3 text-xs font-semibold tracking-[0.08em] text-crystal-muted transition hover:bg-crystal-champagne/25 hover:text-crystal-ink disabled:opacity-60"
                disabled={saving || archiving}
                onClick={() => handleArchiveAction(deletedAt ? "restore" : "archive")}
                type="button"
              >
                {archiving ? <RefreshCw className="animate-spin" size={16} /> : deletedAt ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                {archiving ? "處理中..." : deletedAt ? "解除封存" : "封存商品"}
              </button>
              <p className="mt-3 text-xs leading-5">封存只會寫入 deleted_at，商品資料與圖片都會保留，不會直接刪除。</p>
            </div>
          ) : null}
        </aside>
      </form>
    </section>
  );
}

function Checklist({
  items,
  label,
  onToggle,
  selected
}: {
  items: Array<[string, string]>;
  label: string;
  onToggle: (value: string) => void;
  selected: string[];
}) {
  return (
    <fieldset className="border border-crystal-line bg-white/80 p-4">
      <legend className="px-2 text-xs font-bold tracking-[0.16em] text-crystal-muted">{label}</legend>
      <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto">
        {items.map(([value, text]) => (
          <label className="flex items-center gap-3 text-sm" key={value}>
            <input checked={selected.includes(value)} onChange={() => onToggle(value)} type="checkbox" />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
