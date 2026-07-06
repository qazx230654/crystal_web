import { NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/services/order-service";
import { SupabaseConfigError } from "@/services/supabase-rest";
import { requireAdmin } from "@/services/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await getOrderById(params.id);

    if (!result.order) {
      return NextResponse.json({ error: { message: "Order not found" } }, { status: 404 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load order";
    const status = error instanceof SupabaseConfigError ? 500 : 400;

    return NextResponse.json({
      error: {
        message
      }
    }, { status });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const payload = await request.json();
    const status = String(payload.status ?? "");

    if (!status) {
      return NextResponse.json({ error: { message: "status is required" } }, { status: 400 });
    }

    const order = await updateOrderStatus(params.id, status, payload.message);

    return NextResponse.json({ data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update order";
    const status = error instanceof SupabaseConfigError ? 500 : 400;

    return NextResponse.json({
      error: {
        message
      }
    }, { status });
  }
}
