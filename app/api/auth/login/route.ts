import { NextResponse } from "next/server";
import { authAccessCookieName, authRefreshCookieName, signInMember, SupabaseAuthConfigError } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const email = String(payload.email ?? "").trim().toLowerCase();
    const password = String(payload.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: { message: "請輸入 Email 與密碼" } }, { status: 400 });
    }

    const session = await signInMember(email, password);
    const response = NextResponse.json({ data: { user: session.user } });

    setAuthCookies(response, session);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "登入失敗";
    const status = error instanceof SupabaseAuthConfigError ? 500 : 401;

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
