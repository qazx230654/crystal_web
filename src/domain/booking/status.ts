export type BookingStatus = "pending" | "confirmed" | "attended" | "no_show" | "cancelled";

export type BookingStatusSource = {
  booking_status?: string | null;
};

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "待確認",
  confirmed: "已確認",
  attended: "已到場",
  no_show: "未到場",
  cancelled: "已取消"
};

export const bookingStatusColors: Record<BookingStatus, string> = {
  pending: "bg-crystal-cream text-crystal-muted",
  confirmed: "bg-crystal-champagne/35 text-crystal-ink",
  attended: "bg-emerald-50 text-emerald-700",
  no_show: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700"
};

export const bookingStatusTransitions: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["attended", "no_show", "cancelled"],
  attended: [],
  no_show: [],
  cancelled: []
};

export function getBookingStatus(booking: BookingStatusSource): BookingStatus {
  const status = booking.booking_status || "pending";
  return isBookingStatus(status) ? status : "pending";
}

export function getBookingStatusLabel(status?: string | null) {
  if (!status) return "-";
  return isBookingStatus(status) ? bookingStatusLabels[status] : status;
}

export function getBookingStatusColor(status?: string | null) {
  return status && isBookingStatus(status) ? bookingStatusColors[status] : bookingStatusColors.pending;
}

export function canTransitionBookingStatus(from: string, to: string) {
  if (!isBookingStatus(from) || !isBookingStatus(to)) return false;
  return from === to || bookingStatusTransitions[from].includes(to);
}

export function isBookingStatus(status: string): status is BookingStatus {
  return status in bookingStatusLabels;
}
