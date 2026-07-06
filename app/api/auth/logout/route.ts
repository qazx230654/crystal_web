import { NextResponse } from "next/server";
import { authAccessCookieName, authRefreshCookieName } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ data: { authenticated: false } });

  for (const name of [authAccessCookieName, authRefreshCookieName]) {
    response.cookies.set({
      httpOnly: true,
      maxAge: 0,
      name,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: ""
    });
  }

  return response;
}
