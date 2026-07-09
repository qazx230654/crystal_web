export * from "@/src/domain/logistics";
export * from "@/src/domain/payment";
export * from "@/src/domain/order/admin-actions";
export * from "@/src/domain/order/filters";
export * from "@/src/domain/order/status";

export const orderEventTypeLabels: Record<string, string> = {
  created: "建立訂單",
  status_changed: "狀態更新"
};
