import { NextResponse } from "next/server";
import { requireAdminWrite } from "@/services/admin-auth";
import { getSessionById, updateSession } from "@/services/experience/session.service";

export const dynamic = "force-dynamic";

const allowedStatuses = new Set(["open", "closed", "cancelled"]);

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdminWrite(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as {
      capacity?: number;
      sessionDate?: string;
      startTime?: string;
      endTime?: string | null;
      status?: string;
    };

    const existing = await getSessionById(params.id);
    if (!existing) {
      return NextResponse.json({ error: { message: "找不到場次" } }, { status: 404 });
    }

    if (payload.status && !allowedStatuses.has(payload.status)) {
      return NextResponse.json({ error: { message: "場次狀態不正確" } }, { status: 400 });
    }
    if (payload.status === "cancelled" && existing.booked_count > 0) {
      return NextResponse.json({ error: { message: "此場次已有預約，請先取消或退款相關預約後再取消場次" } }, { status: 400 });
    }
    if (payload.capacity !== undefined && payload.capacity < existing.booked_count) {
      return NextResponse.json({ error: { message: `名額上限不可低於已預約人數（${existing.booked_count}）` } }, { status: 400 });
    }

    const session = await updateSession(params.id, {
      capacity: payload.capacity,
      end_time: payload.endTime,
      session_date: payload.sessionDate,
      start_time: payload.startTime,
      status: payload.status
    });

    return NextResponse.json({ data: session });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新場次失敗";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
