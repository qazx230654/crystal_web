import { NextResponse } from "next/server";
import { defaultStockLabelForStatus, type Category, type ProductStatus } from "@/src/domain/product";
import { getProductSource } from "@/data/product-source";
import { requireAdmin, requireAdminWrite } from "@/services/admin-auth";
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
  const unauthorized = await requireAdminWrite(request);
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
      stockQuantity?: number | null;
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
      stockLabel: payload.stockLabel?.trim() || defaultStockLabelForStatus(payload.status ?? "active"),
      stockQuantity: payload.stockQuantity ?? null
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "新增商品失敗";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
