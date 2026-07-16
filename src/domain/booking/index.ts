export * from "@/src/domain/booking/admin-actions";
export * from "@/src/domain/booking/filters";
export * from "@/src/domain/booking/status";

export const bookingEventTypeLabels: Record<string, string> = {
  created: "建立預約",
  status_changed: "狀態更新"
};
