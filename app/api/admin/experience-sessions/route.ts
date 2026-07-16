import { NextResponse } from "next/server";
import { requireAdmin, requireAdminWrite } from "@/services/admin-auth";
import { validateSessionPayload, type AdminSessionPayload } from "@/services/experience/experience-validation";
import { listSessions, createSessionsBulk } from "@/services/experience/session.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const experienceId = new URL(request.url).searchParams.get("experienceId");
  if (!experienceId) {
    return NextResponse.json({ error: { message: "缺少 experienceId" } }, { status: 400 });
  }

  const sessions = await listSessions(experienceId);
  return NextResponse.json({ data: sessions });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminWrite(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as { sessions?: AdminSessionPayload[] };
    const sessions = payload.sessions ?? [];

    if (!sessions.length) {
      return NextResponse.json({ error: { message: "請至少新增一個場次" } }, { status: 400 });
    }

    for (const session of sessions) {
      const validationError = validateSessionPayload(session);
      if (validationError) return validationError;
    }

    const created = await createSessionsBulk(
      sessions.map((session) => ({
        capacity: Number(session.capacity),
        end_time: session.endTime || null,
        experience_id: session.experienceId!,
        session_date: session.sessionDate!,
        start_time: session.startTime!
      }))
    );

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "新增場次失敗";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
