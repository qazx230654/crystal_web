"use client";

import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { productStatusLabels, type ProductStatus } from "@/src/domain/product";

export type ProductOptions = {
  benefits: string[];
  categories: Record<string, string>;
  minerals: string[];
  statuses: Record<ProductStatus, string>;
};

export type ProductFormState = {
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

const fieldClass = "border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose";

export function ProductEditorHeader({ title }: { title: string }) {
  return (
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
  );
}

export function BasicProductSection({
  formState,
  options,
  productId,
  setFormState
}: {
  formState: ProductFormState;
  options: ProductOptions | null;
  productId?: string;
  setFormState: Dispatch<SetStateAction<ProductFormState>>;
}) {
  return (
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
  );
}

export function ProductTagsSection({
  formState,
  options,
  setFormState
}: {
  formState: ProductFormState;
  options: ProductOptions | null;
  setFormState: Dispatch<SetStateAction<ProductFormState>>;
}) {
  return (
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

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}
