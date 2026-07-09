export type ShippingStatus = "pending" | "created" | "shipped" | "in_transit" | "delivered" | "picked_up" | "returned";

export type ShippingStatusSource = {
  shipping_status?: string | null;
  status?: string | null;
};

export const shippingStatusLabels: Record<ShippingStatus, string> = {
  pending: "未建立",
  created: "已建立",
  shipped: "已出貨",
  in_transit: "配送中",
  delivered: "已送達",
  picked_up: "已取貨",
  returned: "退回"
};

export const shippingStatusColors: Record<ShippingStatus, string> = {
  pending: "bg-crystal-cream text-crystal-muted",
  created: "bg-crystal-champagne/35 text-crystal-ink",
  shipped: "bg-blue-50 text-blue-700",
  in_transit: "bg-sky-50 text-sky-700",
  delivered: "bg-emerald-50 text-emerald-700",
  picked_up: "bg-emerald-50 text-emerald-700",
  returned: "bg-red-50 text-red-700"
};

export function getShippingStatus(order: ShippingStatusSource): ShippingStatus {
  if (order.shipping_status && isShippingStatus(order.shipping_status)) return order.shipping_status;
  if (order.status === "shipped") return "shipped";
  if (order.status === "completed") return "delivered";
  return "pending";
}

export function getShippingStatusLabel(status?: string | null) {
  if (!status) return "-";
  return isShippingStatus(status) ? shippingStatusLabels[status] : status;
}

export function getShippingStatusColor(status?: string | null) {
  return status && isShippingStatus(status) ? shippingStatusColors[status] : shippingStatusColors.pending;
}

export function resolveLogisticsProvider(method?: string | null) {
  if (method === "711") return "7-11";
  if (method === "family") return "全家";
  if (method === "blackcat" || method === "home") return "黑貓";
  return method || "未指定";
}

export function isShippingStatus(status: string): status is ShippingStatus {
  return status in shippingStatusLabels;
}
