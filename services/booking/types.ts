export type CreateBookingInput = {
  customer: {
    email?: string;
    lineId?: string;
    name: string;
    phone: string;
  };
  experienceId: string;
  headcount: number;
  note?: string;
  paymentMethod: string;
  planId: string;
  sessionId: string;
  userId?: string;
};

export type BookingRecord = {
  booking_number: string;
  booking_status: string;
  created_at?: string;
  customer_email: string | null;
  customer_name: string;
  customer_phone: string;
  experience_id: string;
  headcount: number;
  id: string;
  line_id: string | null;
  note: string | null;
  payment_method: string;
  payment_status: string;
  plan_id: string;
  session_id: string;
  total: number;
  unit_price: number;
  updated_at?: string;
  user_id: string | null;
};
