import { NextRequest, NextResponse } from "next/server";
import { adminSessionCookieName, getExpectedAdminToken } from "@/services/admin-auth";

export function middleware(request: NextRequest) {
  const token = getExpectedAdminToken();

  const session = request.cookies.get(adminSessionCookieName)?.value;
  if (token && session === token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/((?!login).*)"]
};
