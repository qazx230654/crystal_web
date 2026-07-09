import { NextResponse } from "next/server";
import { createOrder, listOrders, lookupOrder } from "@/services/order-service";
import { SupabaseConfigError } from "@/services/supabase-rest";
import { requireAdmin } from "@/services/admin-auth";
import { getCurrentMember, SupabaseAuthConfigError } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lookup = searchParams.get("lookup");
    const verifier = searchParams.get("verifier");

    if (lookup && verifier) {
      const result = await lookupOrder(lookup, verifier);

      if (!result?.order) {
        return NextResponse.json({ error: { message: "Order not found" } }, { status: 404 });
      }

      return NextResponse.json({ data: result });
    }

    const unauthorized = await requireAdmin(request);
    if (unauthorized) return unauthorized;

    const orders = await listOrders();
    return NextResponse.json({ data: orders, meta: { count: orders.length } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load orders";
    const status = error instanceof SupabaseConfigError ? 500 : 400;

    return NextResponse.json({ error: { message } }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const member = await getCurrentMember(request).catch(() => null);
    const result = await createOrder({
      ...payload,
      userId: member?.user.id
    });

    return NextResponse.json({
      data: result.order,
      meta: {
        items: result.items,
        totals: result.totals
      }
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order";
    const status = error instanceof SupabaseConfigError || error instanceof SupabaseAuthConfigError ? 500 : 400;

    return NextResponse.json({
      error: {
        message
      }
    }, { status });
  }
}
