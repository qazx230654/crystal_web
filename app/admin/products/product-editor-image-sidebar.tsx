"use client";

import { Archive, ArchiveRestore, ImagePlus, RefreshCw, Save } from "lucide-react";
import type { ProductFormState, ProductOptions } from "./product-editor-sections";

const fieldClass = "border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose";

export function ProductImageSidebar({
  archiving,
  deletedAt,
  formState,
  mainImagePreview,
  options,
  productId,
  saving,
  submitLabel,
  onArchiveAction,
  onExtraImagesChange,
  onMainImageChange
}: {
  archiving: boolean;
  deletedAt: string | null;
  formState: ProductFormState;
  mainImagePreview: string;
  options: ProductOptions | null;
  productId?: string;
  saving: boolean;
  submitLabel: string;
  onArchiveAction: (action: "archive" | "restore") => void;
  onExtraImagesChange: (files: File[]) => void;
  onMainImageChange: (file: File | null) => void;
}) {
  return (
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
          <input accept="image/*" className="sr-only" onChange={(event) => onMainImageChange(event.target.files?.[0] ?? null)} type="file" />
        </label>

        <label className="mt-5 grid gap-2">
          <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">補充商品圖</span>
          <input accept="image/*" className={`${fieldClass} box-border w-full file:mr-4 file:border-0 file:bg-crystal-pearl file:px-3 file:py-2 file:text-xs file:font-semibold file:text-crystal-muted`} multiple onChange={(event) => onExtraImagesChange(Array.from(event.target.files ?? []))} type="file" />
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
            onClick={() => onArchiveAction(deletedAt ? "restore" : "archive")}
            type="button"
          >
            {archiving ? <RefreshCw className="animate-spin" size={16} /> : deletedAt ? <ArchiveRestore size={16} /> : <Archive size={16} />}
            {archiving ? "處理中..." : deletedAt ? "解除封存" : "封存商品"}
          </button>
          <p className="mt-3 text-xs leading-5">封存只會寫入 deleted_at，商品資料與圖片都會保留，不會直接刪除。</p>
        </div>
      ) : null}
    </aside>
  );
}
