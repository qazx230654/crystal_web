import { NextResponse } from "next/server";
import { getCurrentMember, SupabaseAuthConfigError } from "@/services/auth-service";
import { listOrdersByUser } from "@/services/order-service";
import { SupabaseConfigError } from "@/services/supabase-rest";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const member = await getCurrentMember(request);

    if (!member?.user) {
      return NextResponse.json({ error: { message: "請先登入會員" } }, { status: 401 });
    }

    const orders = await listOrdersByUser(member.user.id);

    return NextResponse.json({ data: orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "無法讀取會員訂單";
    if (message.includes("user_id") || message.includes("public.profiles")) {
      return NextResponse.json({ error: { message: "會員資料庫尚未完成設定，請先執行 docs/supabase-orders.sql。" } }, { status: 500 });
    }

    const status = error instanceof SupabaseAuthConfigError || error instanceof SupabaseConfigError ? 500 : 400;

    return NextResponse.json({ error: { message } }, { status });
  }
}
