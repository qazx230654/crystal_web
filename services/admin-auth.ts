import { getCurrentMemberAdminStatus } from "@/services/auth-service";

export async function requireAdmin(request: Request) {
  const { isAdmin } = await getCurrentMemberAdminStatus(request).catch(() => ({ isAdmin: false, isDemo: false }));

  if (!isAdmin) {
    return unauthorizedResponse();
  }

  return null;
}

export async function requireAdminWrite(request: Request) {
  const { isAdmin, isDemo } = await getCurrentMemberAdminStatus(request).catch(() => ({ isAdmin: false, isDemo: false }));

  if (!isAdmin) {
    return unauthorizedResponse();
  }

  if (isDemo) {
    return new Response(JSON.stringify({ error: { message: "Demo 模式下無法變更資料" } }), {
      headers: { "Content-Type": "application/json" },
      status: 403
    });
  }

  return null;
}

function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: { message: "Unauthorized" } }), {
    headers: { "Content-Type": "application/json" },
    status: 401
  });
}
