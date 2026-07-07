import { NextResponse } from "next/server";
import { requireAdmin } from "@/services/admin-auth";
import { type ProductStatus } from "@/data/product-types";
import { updateSupabaseProductStatus } from "@/services/supabase-product-service";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as { status?: ProductStatus };

    if (!payload.status) {
      return NextResponse.json({ error: { message: "缺少商品狀態" } }, { status: 400 });
    }

    const product = await updateSupabaseProductStatus(params.id, payload.status);
    return NextResponse.json({ data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新商品狀態失敗";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
