"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { defaultStockLabelForStatus, type ProductStatus } from "@/src/domain/product";
import { ProductImageSidebar } from "./product-editor-image-sidebar";
import {
  defaultFormState,
  isOptionsPayload,
  isSingleProductPayload,
  parseProductList,
  validateProductForm,
  type ProductPayload,
  type SingleProductPayload
} from "./product-editor-model";
import {
  BasicProductSection,
  ProductEditorHeader,
  ProductTagsSection,
  type ProductFormState,
  type ProductOptions
} from "./product-editor-sections";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateProductForm({
      formState,
      hasMainImageFile: Boolean(mainImageFile)
    });
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
      const minerals = Array.from(new Set([...formState.minerals, ...parseProductList(formState.customMinerals)]));
      const benefits = Array.from(new Set([...formState.benefits, ...parseProductList(formState.customBenefits)]));
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
      <ProductEditorHeader title={title} />

      {error ? <p className="mt-6 border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {deletedAt ? <p className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">此商品已封存，前台不會顯示。你仍可修改資料，之後也能解除封存。</p> : null}

      <form className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <BasicProductSection formState={formState} options={options} productId={productId} setFormState={setFormState} />
          <ProductTagsSection formState={formState} options={options} setFormState={setFormState} />
        </div>
        <ProductImageSidebar
          archiving={archiving}
          deletedAt={deletedAt}
          formState={formState}
          mainImagePreview={mainImagePreview}
          options={options}
          productId={productId}
          saving={saving}
          submitLabel={submitLabel}
          onArchiveAction={handleArchiveAction}
          onExtraImagesChange={setExtraImageFiles}
          onMainImageChange={setMainImageFile}
        />
      </form>
    </section>
  );
}
