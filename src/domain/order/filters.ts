import { getShippingStatus } from "@/src/domain/logistics";
import { getPaymentStatus } from "@/src/domain/payment";
import { getOrderStatus } from "@/src/domain/order/status";

export type AdminOrderFilterTab = {
  id: "all" | "pending" | "paid" | "making" | "shipped" | "delivery" | "completed" | "after_sales";
  label: string;
};

export type AdminOrderFilterSource = {
  order_status?: string | null;
  payment_status?: string | null;
  shipping_status?: string | null;
  status?: string | null;
};

export const adminOrderFilterTabs: AdminOrderFilterTab[] = [
  { id: "all", label: "全部訂單" },
  { id: "pending", label: "待付款" },
  { id: "paid", label: "待出貨" },
  { id: "making", label: "備貨中" },
  { id: "shipped", label: "已出貨" },
  { id: "delivery", label: "配送中" },
  { id: "completed", label: "已完成" },
  { id: "after_sales", label: "取消 / 退款 / 退貨" }
];

export function matchesAdminOrderFilter(order: AdminOrderFilterSource, tab: string) {
  const orderStatus = getOrderStatus(order);
  const paymentStatus = getPaymentStatus(order);
  const shippingStatus = getShippingStatus(order);

  if (tab === "all") return true;
  if (tab === "delivery") return ["in_transit", "delivered", "picked_up"].includes(shippingStatus) && orderStatus !== "completed";
  if (tab === "after_sales") return orderStatus === "cancelled" || ["refunding", "refunded"].includes(paymentStatus) || shippingStatus === "returned";
  return orderStatus === tab;
}
