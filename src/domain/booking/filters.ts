import { getBookingStatus } from "@/src/domain/booking/status";

export type AdminBookingFilterTab = {
  id: "all" | "pending" | "confirmed" | "attended" | "no_show" | "cancelled";
  label: string;
};

export type AdminBookingFilterSource = {
  booking_status?: string | null;
};

export const adminBookingFilterTabs: AdminBookingFilterTab[] = [
  { id: "all", label: "全部預約" },
  { id: "pending", label: "待確認" },
  { id: "confirmed", label: "已確認" },
  { id: "attended", label: "已到場" },
  { id: "no_show", label: "未到場" },
  { id: "cancelled", label: "取消 / 退款" }
];

export function matchesAdminBookingFilter(booking: AdminBookingFilterSource, tab: string) {
  const bookingStatus = getBookingStatus(booking);

  if (tab === "all") return true;
  return bookingStatus === tab;
}
