import { NextResponse } from "next/server";
import { adminSessionCookieName, getExpectedAdminToken, isAdminTokenValid } from "@/services/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const provided = typeof payload.token === "string" ? payload.token.trim() : "";
  const configuredToken = getExpectedAdminToken();

  if (!isAdminTokenValid(provided)) {
    return NextResponse.json({ error: { message: "登入失敗，請確認管理密碼。" } }, { status: 401 });
  }

  if (!configuredToken) {
    return NextResponse.json({ error: { message: "後台尚未設定管理密碼。" } }, { status: 500 });
  }

  const response = NextResponse.json({ data: { authenticated: true } });
  response.cookies.set({
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    name: adminSessionCookieName,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: configuredToken
  });

  return response;
}
