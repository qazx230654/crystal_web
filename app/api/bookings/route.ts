import { NextResponse } from "next/server";
import { createBooking, listBookings, listBookingsBySession } from "@/services/booking-service";
import { SupabaseConfigError } from "@/services/supabase-rest";
import { requireAdmin } from "@/services/admin-auth";
import { getCurrentMember, SupabaseAuthConfigError } from "@/services/auth-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const unauthorized = await requireAdmin(request);
    if (unauthorized) return unauthorized;

    const sessionId = new URL(request.url).searchParams.get("sessionId");
    const bookings = sessionId ? await listBookingsBySession(sessionId) : await listBookings();
    return NextResponse.json({ data: bookings, meta: { count: bookings.length } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load bookings";
    const status = error instanceof SupabaseConfigError ? 500 : 400;

    return NextResponse.json({ error: { message } }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const member = await getCurrentMember(request).catch(() => null);
    const result = await createBooking({
      ...payload,
      userId: member?.user.id
    });

    return NextResponse.json({ data: result.booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create booking";
    const status = error instanceof SupabaseConfigError || error instanceof SupabaseAuthConfigError ? 500 : 400;

    return NextResponse.json({ error: { message } }, { status });
  }
}
