import { supabaseRest } from "@/services/supabase-rest";

export type BookingRow = {
  id: string;
  user_id: string | null;
  booking_number: string;
  experience_id: string;
  plan_id: string;
  session_id: string;
  booking_status: string;
  payment_status: string;
  headcount: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  line_id: string | null;
  payment_method: string;
  unit_price: number;
  total: number;
  note: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BookingInsertRecord = {
  user_id?: string | null;
  booking_number: string;
  experience_id: string;
  plan_id: string;
  session_id: string;
  booking_status?: string;
  payment_status?: string;
  headcount: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  line_id?: string | null;
  payment_method: string;
  unit_price: number;
  total: number;
  note?: string | null;
};

export class BookingRepository {
  async createBooking(payload: BookingInsertRecord) {
    const [booking] = await supabaseRest<BookingRow[]>("bookings", {
      body: payload,
      method: "POST"
    });

    return booking;
  }

  createBookingEvent(payload: Record<string, unknown>) {
    return supabaseRest("booking_events", {
      body: payload,
      method: "POST"
    });
  }

  async getBookingById(id: string) {
    const bookingQuery = `?id=eq.${encodeURIComponent(id)}&select=*`;
    const eventQuery = `?booking_id=eq.${encodeURIComponent(id)}&select=*&order=created_at.asc`;

    const [bookings, events] = await Promise.all([
      supabaseRest<BookingRow[]>("bookings", { query: bookingQuery }),
      supabaseRest("booking_events", { query: eventQuery })
    ]);

    return {
      booking: bookings[0] ?? null,
      events
    };
  }

  listBookings(limit = 100) {
    return supabaseRest<BookingRow[]>("bookings", {
      query: `?select=*&order=created_at.desc&limit=${limit}`
    });
  }

  listBookingsByUser(userId: string) {
    return supabaseRest<BookingRow[]>("bookings", {
      query: `?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc&limit=100`
    });
  }

  listBookingsBySession(sessionId: string) {
    return supabaseRest<BookingRow[]>("bookings", {
      query: `?session_id=eq.${encodeURIComponent(sessionId)}&select=*&order=created_at.asc`
    });
  }

  async findBookingById(id: string) {
    const [booking] = await supabaseRest<BookingRow[]>("bookings", {
      query: `?id=eq.${encodeURIComponent(id)}&select=*`
    });

    return booking ?? null;
  }

  async findBookingByNumber(bookingNumber: string) {
    const [booking] = await supabaseRest<BookingRow[]>("bookings", {
      query: `?booking_number=eq.${encodeURIComponent(bookingNumber)}&select=*`
    });

    return booking ?? null;
  }

  async updateBooking(id: string, patch: Record<string, unknown>) {
    const [booking] = await supabaseRest<BookingRow[]>("bookings", {
      body: patch,
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`
    });

    return booking;
  }
}

export const bookingRepository = new BookingRepository();
