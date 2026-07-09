export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunding" | "refunded";

export type PaymentStatusSource = {
  payment_status?: string | null;
  status?: string | null;
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "未付款",
  paid: "已付款",
  failed: "付款失敗",
  refunding: "退款中",
  refunded: "已退款"
};

export const paymentStatusColors: Record<PaymentStatus, string> = {
  unpaid: "bg-crystal-cream text-crystal-muted",
  paid: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  refunding: "bg-amber-50 text-amber-700",
  refunded: "bg-slate-100 text-slate-700"
};

export function getPaymentStatus(order: PaymentStatusSource): PaymentStatus {
  if (order.payment_status && isPaymentStatus(order.payment_status)) return order.payment_status;
  return ["paid", "making", "shipped", "completed"].includes(order.status ?? "") ? "paid" : "unpaid";
}

export function getPaymentStatusLabel(status?: string | null) {
  if (!status) return "-";
  return isPaymentStatus(status) ? paymentStatusLabels[status] : status;
}

export function getPaymentStatusColor(status?: string | null) {
  return status && isPaymentStatus(status) ? paymentStatusColors[status] : paymentStatusColors.unpaid;
}

export function isPaymentStatus(status: string): status is PaymentStatus {
  return status in paymentStatusLabels;
}
