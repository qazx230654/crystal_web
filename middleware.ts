import { NextRequest, NextResponse } from "next/server";

const authAccessCookieName = "gooday_auth_access_token";

export async function middleware(request: NextRequest) {
  const isAdmin = await isAdminRequest(request);

  if (isAdmin) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

async function isAdminRequest(request: NextRequest) {
  const accessToken = request.cookies.get(authAccessCookieName)?.value;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAuthKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!accessToken || !supabaseUrl || !supabaseAuthKey || !supabaseServiceRoleKey) return false;

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    cache: "no-store",
    headers: {
      apikey: supabaseAuthKey,
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!userResponse.ok) return false;

  const user = await userResponse.json().catch(() => null);
  const userId = typeof user?.id === "string" ? user.id : "";
  if (!userId) return false;

  const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role,status`, {
    cache: "no-store",
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`
    }
  });

  if (!profileResponse.ok) return false;

  const profiles = await profileResponse.json().catch(() => []);
  const profile = Array.isArray(profiles) ? profiles[0] : null;

  return profile?.role === "admin" && (profile.status ?? "active") === "active";
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"]
};
