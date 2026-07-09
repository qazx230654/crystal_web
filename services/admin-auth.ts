import { isCurrentMemberAdmin } from "@/services/auth-service";

export async function requireAdmin(request: Request) {
  const isAdmin = await isCurrentMemberAdmin(request).catch(() => false);

  if (!isAdmin) {
    return new Response(JSON.stringify({ error: { message: "Unauthorized" } }), {
      headers: { "Content-Type": "application/json" },
      status: 401
    });
  }

  return null;
}
