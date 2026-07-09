import { NextResponse } from "next/server";
import { type Category, type ProductStatus } from "@/data/product-types";
import { getProductSource } from "@/data/product-source";
import { requireAdmin } from "@/services/admin-auth";
import { listProducts } from "@/services/product-service";
import { getProductFormOptions } from "@/services/admin-product-store";
import { createSupabaseProduct } from "@/services/supabase-product-service";
import { validateProductPayload } from "@/services/product-validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const products = await listProducts({ includeInactive: true, sort: "最新商品" });
  const options = getProductFormOptions(products);

  return NextResponse.json({
    data: products,
    meta: {
      count: products.length,
      options,
      source: getProductSource(),
      syncedAt: new Date().toISOString()
    }
  });
}

export async function POST(request: Request) {
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
    };

    const validationError = validateProductPayload(payload);
    if (validationError) return validationError;

    const product = await createSupabaseProduct({
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
      status: payload.status ?? "active",
      stockLabel: payload.stockLabel?.trim() || "現貨 2-5 個工作天寄出"
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "新增商品失敗";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
