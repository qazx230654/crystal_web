import { NextResponse } from "next/server";
import type { Category, ProductStatus } from "@/src/domain/product";

export type AdminProductPayload = {
  benefits?: string[];
  category?: Category[];
  description?: string;
  image?: string;
  images?: string[];
  minerals?: string[];
  name?: string;
  originalPrice?: number | null;
  price?: number;
  slug?: string;
  status?: ProductStatus;
  stockLabel?: string;
  stockQuantity?: number | null;
};

export function validateProductPayload(payload: AdminProductPayload) {
  if (!payload.name?.trim()) {
    return NextResponse.json({ error: { message: "請輸入商品名稱" } }, { status: 400 });
  }
  if (!payload.image?.trim()) {
    return NextResponse.json({ error: { message: "請上傳商品主圖" } }, { status: 400 });
  }
  if (!payload.category?.length) {
    return NextResponse.json({ error: { message: "請至少勾選一個分類" } }, { status: 400 });
  }
  if (!payload.minerals?.length) {
    return NextResponse.json({ error: { message: "請至少勾選一種礦石" } }, { status: 400 });
  }
  if (!payload.description?.trim()) {
    return NextResponse.json({ error: { message: "請輸入商品描述" } }, { status: 400 });
  }
  if (!payload.stockLabel?.trim()) {
    return NextResponse.json({ error: { message: "請輸入出貨或庫存文字" } }, { status: 400 });
  }
  if (!payload.price || Number(payload.price) <= 0) {
    return NextResponse.json({ error: { message: "請輸入正確的折扣價格" } }, { status: 400 });
  }
  if (payload.originalPrice && Number(payload.originalPrice) < Number(payload.price)) {
    return NextResponse.json({ error: { message: "原價不可低於折扣價格" } }, { status: 400 });
  }
  if (payload.stockQuantity !== undefined && payload.stockQuantity !== null) {
    if (!Number.isInteger(payload.stockQuantity) || payload.stockQuantity < 0) {
      return NextResponse.json({ error: { message: "庫存數量需為 0 或以上的整數" } }, { status: 400 });
    }
  }

  return null;
}
