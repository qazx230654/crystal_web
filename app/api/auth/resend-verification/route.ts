import { NextResponse } from "next/server";
import { getCurrentMember, resendSignupVerification, SupabaseAuthConfigError } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const member = await getCurrentMember(request);
    const email = member?.user.email;

    if (!email) {
      return NextResponse.json({ error: { message: "請先登入會員" } }, { status: 401 });
    }

    const origin = new URL(request.url).origin;
    await resendSignupVerification(email, origin);

    return NextResponse.json({ data: { sent: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "驗證信發送失敗";
    const status = error instanceof SupabaseAuthConfigError ? 500 : 400;

    return NextResponse.json({ error: { message } }, { status });
  }
}
