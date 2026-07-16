import { NextResponse } from "next/server";
import { getBookingById, updateBookingWorkflowAction } from "@/services/booking-service";
import { SupabaseConfigError } from "@/services/supabase-rest";
import { requireAdminWrite } from "@/services/admin-auth";
import type { AdminBookingAction } from "@/src/domain/booking";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await getBookingById(params.id);

    if (!result.booking) {
      return NextResponse.json({ error: { message: "Booking not found" } }, { status: 404 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load booking";
    const status = error instanceof SupabaseConfigError ? 500 : 400;

    return NextResponse.json({ error: { message } }, { status });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const unauthorized = await requireAdminWrite(request);
    if (unauthorized) return unauthorized;

    const payload = (await request.json()) as { action?: AdminBookingAction; message?: string };
    if (!payload.action) {
      return NextResponse.json({ error: { message: "action is required" } }, { status: 400 });
    }

    const booking = await updateBookingWorkflowAction(params.id, payload.action, payload.message);

    return NextResponse.json({ data: booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update booking";
    const status = error instanceof SupabaseConfigError ? 500 : message === "Booking not found" ? 404 : 400;

    return NextResponse.json({ error: { message } }, { status });
  }
}
