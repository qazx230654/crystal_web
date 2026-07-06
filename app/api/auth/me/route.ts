import { NextResponse } from "next/server";
import { getCurrentMember, SupabaseAuthConfigError } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const member = await getCurrentMember(request);

    return NextResponse.json({ data: member });
  } catch (error) {
    const message = error instanceof Error ? error.message : "無法讀取會員資料";
    const status = error instanceof SupabaseAuthConfigError ? 500 : 401;

    return NextResponse.json({ error: { message } }, { status });
  }
}
