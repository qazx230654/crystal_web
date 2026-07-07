import { NextResponse } from "next/server";
import { authAccessCookieName, authRefreshCookieName, signUpMember, SupabaseAuthConfigError } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const email = String(payload.email ?? "").trim().toLowerCase();
    const password = String(payload.password ?? "");
    const name = String(payload.name ?? "").trim();
    const phone = String(payload.phone ?? "").trim();
    const lineId = String(payload.lineId ?? "").trim();

    if (!email || !password || !name) {
      return NextResponse.json({ error: { message: "請輸入姓名、Email 與密碼" } }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: { message: "密碼至少需要 8 個字元" } }, { status: 400 });
    }

    const session = await signUpMember({ email, lineId, name, password, phone });
    const response = NextResponse.json({
      data: {
        requiresEmailConfirmation: !session.access_token,
        user: session.user
      }
    }, { status: 201 });

    setAuthCookies(response, session);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "註冊失敗";
    const status = error instanceof SupabaseAuthConfigError ? 500 : 400;

    return NextResponse.json({ error: { message } }, { status });
  }
}

function setAuthCookies(response: NextResponse, session: { access_token?: string; expires_in?: number; refresh_token?: string }) {
  const maxAge = session.expires_in ?? 60 * 60;

  if (session.access_token) {
    response.cookies.set({
      httpOnly: true,
      maxAge,
      name: authAccessCookieName,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: session.access_token
    });
  }

  if (session.refresh_token) {
    response.cookies.set({
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      name: authRefreshCookieName,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: session.refresh_token
    });
  }
}
