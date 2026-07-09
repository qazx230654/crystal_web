import { getShippingStatus } from "@/src/domain/logistics";
import { getPaymentStatus } from "@/src/domain/payment";
import { getOrderStatus } from "@/src/domain/order/status";

export type AdminOrderAction =
  | "start_preparing"
  | "create_shipment"
  | "mark_shipped"
  | "complete_order"
  | "cancel_order"
  | "refund_order";

export type AdminOrderActionTone = "danger" | "primary";

export type AdminOrderActionOption = {
  id: AdminOrderAction;
  label: string;
  tone?: AdminOrderActionTone;
};

export type AdminOrderActionSource = {
  order_status?: string | null;
  payment_status?: string | null;
  shipping_status?: string | null;
  status?: string | null;
};

export const adminOrderActionLabels: Record<AdminOrderAction, string> = {
  start_preparing: "開始備貨",
  create_shipment: "建立物流單",
  mark_shipped: "標記已出貨",
  complete_order: "標記完成",
  cancel_order: "取消訂單",
  refund_order: "退款"
};

export function getAvailableAdminOrderActions(order: AdminOrderActionSource): AdminOrderActionOption[] {
  const orderStatus = getOrderStatus(order);
  const paymentStatus = getPaymentStatus(order);
  const shippingStatus = getShippingStatus(order);
  const actions: AdminOrderActionOption[] = [];

  if (orderStatus === "pending" && paymentStatus === "unpaid") {
    actions.push({ id: "cancel_order", label: adminOrderActionLabels.cancel_order, tone: "danger" });
  }

  if (orderStatus === "paid" && paymentStatus === "paid") {
    actions.push({ id: "start_preparing", label: adminOrderActionLabels.start_preparing, tone: "primary" });
    actions.push({ id: "refund_order", label: "取消並退款", tone: "danger" });
  }

  if (orderStatus === "making" && shippingStatus === "pending") {
    actions.push({ id: "create_shipment", label: adminOrderActionLabels.create_shipment, tone: "primary" });
  }

  if (orderStatus === "making" && shippingStatus === "created") {
    actions.push({ id: "mark_shipped", label: adminOrderActionLabels.mark_shipped, tone: "primary" });
  }

  if (orderStatus === "shipped") {
    actions.push({ id: "complete_order", label: adminOrderActionLabels.complete_order });
  }

  if (orderStatus === "completed" && paymentStatus === "paid") {
    actions.push({ id: "refund_order", label: adminOrderActionLabels.refund_order, tone: "danger" });
  }

  return actions;
}
