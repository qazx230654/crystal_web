import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { next } = await request.json().catch(() => ({ next: "/admin/dashboard" }));

  return NextResponse.json(
    {
      error: {
        message: "後台已改用會員登入，請使用 Supabase Auth 管理員帳號登入。"
      },
      meta: {
        next: typeof next === "string" ? next : "/admin/dashboard"
      }
    },
    { status: 410 }
  );
}
