import { NextResponse } from "next/server";
import { requireAdmin } from "@/services/admin-auth";
import { type Category, type ProductStatus } from "@/data/product-types";
import { listProducts } from "@/services/product-service";
import {
  archiveSupabaseProduct,
  restoreSupabaseProduct,
  updateSupabaseProduct,
  updateSupabaseProductStatus
} from "@/services/supabase-product-service";
import { validateProductPayload } from "@/services/product-validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const products = await listProducts({ includeInactive: true, sort: "最新商品" });
  const product = products.find((item) => item.id === params.id);

  if (!product) {
    return NextResponse.json({ error: { message: "找不到商品" } }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as {
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
      action?: "archive" | "restore";
    };

    if (payload.action === "archive") {
      const product = await archiveSupabaseProduct(params.id);
      return NextResponse.json({ data: product });
    }

    if (payload.action === "restore") {
      const product = await restoreSupabaseProduct(params.id);
      return NextResponse.json({ data: product });
    }

    if (Object.keys(payload).length === 1 && payload.status) {
      const product = await updateSupabaseProductStatus(params.id, payload.status);
      return NextResponse.json({ data: product });
    }

    const validationError = validateProductPayload(payload);
    if (validationError) return validationError;
    if (!payload.status) {
      return NextResponse.json({ error: { message: "缺少商品狀態" } }, { status: 400 });
    }

    const product = await updateSupabaseProduct(params.id, {
      benefits: payload.benefits ?? [],
      category: payload.category ?? [],
      description: payload.description ?? "",
      image: payload.image ?? "",
      images: payload.images?.filter(Boolean) ?? [],
      minerals: payload.minerals ?? [],
      name: payload.name ?? "",
      originalPrice: payload.originalPrice ? Number(payload.originalPrice) : undefined,
      price: Number(payload.price),
      slug: payload.slug,
      status: payload.status,
      stockLabel: payload.stockLabel ?? ""
    });
    return NextResponse.json({ data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新商品狀態失敗";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
