import { NextResponse } from "next/server";
import { adminSessionCookieName } from "@/services/admin-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ data: { authenticated: false } });
  response.cookies.set({
    httpOnly: true,
    maxAge: 0,
    name: adminSessionCookieName,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: ""
  });

  return response;
}
