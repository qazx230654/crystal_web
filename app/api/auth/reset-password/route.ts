import { NextResponse } from "next/server";
import { updatePassword, SupabaseAuthConfigError } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const accessToken = String(payload.accessToken ?? "");
    const password = String(payload.password ?? "");

    if (!accessToken) {
      return NextResponse.json({ error: { message: "重設連結已失效，請重新申請。" } }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: { message: "密碼至少需要 8 個字元" } }, { status: 400 });
    }

    await updatePassword(accessToken, password);

    return NextResponse.json({ data: { updated: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "密碼更新失敗";
    const status = error instanceof SupabaseAuthConfigError ? 500 : 400;

    return NextResponse.json({ error: { message } }, { status });
  }
}
