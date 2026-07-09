export type OrderStatus = "pending" | "paid" | "making" | "shipped" | "completed" | "cancelled";

export type OrderStatusSource = {
  order_status?: string | null;
  status?: string | null;
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "待付款",
  paid: "待出貨",
  making: "備貨中",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消"
};

export const orderStatusColors: Record<OrderStatus, string> = {
  pending: "bg-crystal-cream text-crystal-muted",
  paid: "bg-crystal-champagne/35 text-crystal-ink",
  making: "bg-amber-50 text-amber-700",
  shipped: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700"
};

export const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["making", "cancelled"],
  making: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: []
};

export function getOrderStatus(order: OrderStatusSource): OrderStatus {
  const status = order.order_status || order.status || "pending";
  return isOrderStatus(status) ? status : "pending";
}

export function getOrderStatusLabel(status?: string | null) {
  if (!status) return "-";
  return isOrderStatus(status) ? orderStatusLabels[status] : status;
}

export function getOrderStatusColor(status?: string | null) {
  return status && isOrderStatus(status) ? orderStatusColors[status] : orderStatusColors.pending;
}

export function canTransitionOrderStatus(from: string, to: string) {
  if (!isOrderStatus(from) || !isOrderStatus(to)) return false;
  return from === to || orderStatusTransitions[from].includes(to);
}

export function isOrderStatus(status: string): status is OrderStatus {
  return status in orderStatusLabels;
}
