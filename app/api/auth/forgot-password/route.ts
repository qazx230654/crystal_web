import { NextResponse } from "next/server";
import { sendPasswordResetEmail, SupabaseAuthConfigError } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const email = String(payload.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: { message: "請輸入 Email" } }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    await sendPasswordResetEmail(email, `${origin}/reset-password`);

    return NextResponse.json({ data: { sent: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "重設密碼信發送失敗";
    const status = error instanceof SupabaseAuthConfigError ? 500 : 400;

    return NextResponse.json({ error: { message } }, { status });
  }
}
