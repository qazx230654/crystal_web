export const adminSessionCookieName = "gooday_admin_session";

export function getAdminToken() {
  return process.env.ADMIN_ORDERS_TOKEN;
}

export function getExpectedAdminToken() {
  return getAdminToken() || (process.env.NODE_ENV !== "production" ? "development-admin" : undefined);
}

export function isAdminTokenValid(provided?: string | null) {
  const token = getExpectedAdminToken();

  return Boolean(token && provided === token);
}

function getCookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? null;
}

export function requireAdmin(request: Request) {
  const provided = request.headers.get("x-admin-token") ?? getCookieValue(request, adminSessionCookieName);

  if (!isAdminTokenValid(provided)) {
    return new Response(JSON.stringify({ error: { message: "Unauthorized" } }), {
      headers: { "Content-Type": "application/json" },
      status: 401
    });
  }

  return null;
}
