import { NextResponse } from "next/server";
import { getCurrentMember, saveMemberProfile, SupabaseAuthConfigError } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const member = await getCurrentMember(request);

    if (!member?.user) {
      return NextResponse.json({ error: { message: "請先登入會員" } }, { status: 401 });
    }

    const payload = await request.json();
    const profile = await saveMemberProfile({
      email: member.user.email || String(payload.email ?? ""),
      id: member.user.id,
      line_id: String(payload.lineId ?? "").trim() || null,
      name: String(payload.name ?? "").trim() || null,
      phone: String(payload.phone ?? "").trim() || null
    });

    return NextResponse.json({ data: profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "會員資料更新失敗";
    const status = error instanceof SupabaseAuthConfigError ? 500 : 400;

    return NextResponse.json({ error: { message } }, { status });
  }
}
