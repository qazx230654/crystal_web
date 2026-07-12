"use client";

import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { productStatusLabels, type ProductStatus } from "@/src/domain/product";
import { buildStockLabel, type StockType } from "./product-editor-model";

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
  stockDays: string;
  stockLabel: string;
  stockQuantity: string;
  stockType: StockType;
  trackStock: boolean;
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
          <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">出貨方式 *</span>
          <select
            className={fieldClass}
            onChange={(event) => {
              const stockType = event.target.value as StockType;
              setFormState((current) => ({ ...current, stockLabel: buildStockLabel(stockType, current.stockDays), stockType }));
            }}
            value={formState.stockType}
          >
            <option value="instock">現貨</option>
            <option value="limited">限量</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">預計出貨天數 *</span>
          <input
            className={fieldClass}
            min="1"
            onChange={(event) => {
              const stockDays = event.target.value;
              setFormState((current) => ({ ...current, stockDays, stockLabel: buildStockLabel(current.stockType, stockDays) }));
            }}
            type="number"
            value={formState.stockDays}
          />
          <span className="text-xs text-crystal-muted">前台顯示文字：{formState.stockLabel}</span>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">庫存管理</span>
          <span className="flex items-center gap-2 border border-crystal-line bg-white px-4 py-3 text-sm">
            <input
              checked={formState.trackStock}
              onChange={(event) => setFormState((current) => ({ ...current, trackStock: event.target.checked }))}
              type="checkbox"
            />
            追蹤庫存數量
          </span>
        </label>
        {formState.trackStock ? (
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">庫存數量 *</span>
            <input
              className={fieldClass}
              min="0"
              onChange={(event) => setFormState((current) => ({ ...current, stockQuantity: event.target.value }))}
              type="number"
              value={formState.stockQuantity}
            />
            <span className="text-xs text-crystal-muted">數量歸零後，前台會自動顯示售完，不需手動切換商品狀態。</span>
          </label>
        ) : null}
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
