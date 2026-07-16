import { NextResponse } from "next/server";
import { listOpenSessionsInRange } from "@/services/experience/session.service";

export const dynamic = "force-dynamic";

function defaultDateRange() {
  const today = new Date();
  const inSixtyDays = new Date(today);
  inSixtyDays.setDate(inSixtyDays.getDate() + 60);

  return {
    from: today.toISOString().slice(0, 10),
    to: inSixtyDays.toISOString().slice(0, 10)
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const experienceId = url.searchParams.get("experienceId");

  if (!experienceId) {
    return NextResponse.json({ error: { message: "缺少 experienceId" } }, { status: 400 });
  }

  const defaults = defaultDateRange();
  const from = url.searchParams.get("from") ?? defaults.from;
  const to = url.searchParams.get("to") ?? defaults.to;

  const sessions = await listOpenSessionsInRange(experienceId, from, to);

  return NextResponse.json({
    data: sessions.map((session) => ({
      capacity: session.capacity,
      endTime: session.end_time,
      id: session.id,
      remaining: Math.max(0, session.capacity - session.booked_count),
      sessionDate: session.session_date,
      startTime: session.start_time
    }))
  });
}
