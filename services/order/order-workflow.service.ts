import { orderRepository } from "@/repositories/order-repository";
import {
  canTransitionOrderStatus,
  getOrderStatus,
  getOrderStatusLabel,
  getPaymentStatus,
  getShippingStatus,
  resolveLogisticsProvider,
  type AdminOrderAction
} from "@/src/domain/order";

import {
  normalizeOrderItems,
  notifyOrderShipped,
  notifyPaymentConfirmed
} from "./order-notification.service";
import { increaseProductSales } from "./order-sales.service";
import type { OrderRecord } from "./types";

export async function updateOrderWorkflowAction(id: string, action: AdminOrderAction, message?: string) {
  const result = await orderRepository.getOrderById(id);
  const currentOrder = result.order as OrderRecord | null;

  if (!currentOrder) {
    throw new Error("Order not found");
  }

  const currentStatus = getOrderStatus(currentOrder);
  const paymentStatus = getPaymentStatus(currentOrder);
  const shippingStatus = getShippingStatus(currentOrder);
  const now = new Date().toISOString();
  const patch: Partial<OrderRecord> & Record<string, unknown> = {
    updated_at: now
  };
  let eventMessage = "";

  if (action === "start_preparing") {
    if (currentStatus !== "paid" || paymentStatus !== "paid") {
      throw new Error("只有已付款且待出貨的訂單可以開始備貨");
    }
    patch.status = "making";
    patch.order_status = "making";
    eventMessage = "店家開始備貨";
  }

  if (action === "create_shipment") {
    if (currentStatus !== "making") {
      throw new Error("只有備貨中的訂單可以建立物流單");
    }
    if (shippingStatus !== "pending") {
      throw new Error("物流單已建立，無法重複建立");
    }
    patch.shipping_status = "created";
    patch.logistics_provider = resolveLogisticsProvider(currentOrder.shipping_method);
    patch.tracking_number = `DEMO${Date.now().toString().slice(-10)}`;
    patch.logistics_print_url = null;
    eventMessage = "物流單已建立（Demo，尚未串接綠界 API）";
  }

  if (action === "mark_shipped") {
    if (currentStatus !== "making" || !["created", "shipped"].includes(shippingStatus)) {
      throw new Error("只有備貨中且已建立物流單的訂單可以標記出貨");
    }
    patch.status = "shipped";
    patch.order_status = "shipped";
    patch.shipping_status = "shipped";
    patch.shipped_at = now;
    eventMessage = "訂單已標記出貨";
  }

  if (action === "complete_order") {
    if (!["shipped", "paid", "making"].includes(currentStatus)) {
      throw new Error("目前狀態無法完成訂單");
    }
    patch.status = "completed";
    patch.order_status = "completed";
    if (shippingStatus !== "returned") {
      patch.shipping_status = currentOrder.shipping_method === "711" ? "picked_up" : "delivered";
    }
    eventMessage = "訂單已完成";
  }

  if (action === "cancel_order") {
    if (!message?.trim()) {
      throw new Error("取消訂單需要填寫原因");
    }
    if (!["pending", "paid", "making"].includes(currentStatus)) {
      throw new Error("此訂單狀態不可取消");
    }
    patch.status = "cancelled";
    patch.order_status = "cancelled";
    eventMessage = `訂單已取消：${message.trim()}`;
  }

  if (action === "refund_order") {
    if (paymentStatus !== "paid") {
      throw new Error("只有已付款訂單可以退款");
    }
    patch.payment_status = "refunding";
    patch.status = currentStatus === "completed" ? "completed" : "cancelled";
    patch.order_status = patch.status;
    eventMessage = message?.trim() ? `退款處理中：${message.trim()}` : "退款處理中";
  }

  if (!eventMessage) {
    throw new Error("不支援的訂單操作");
  }

  const order = await orderRepository.updateOrder(id, patch);

  await orderRepository.createOrderEvent({
    order_id: id,
    type: "status_changed",
    message: eventMessage,
    metadata: {
      action,
      from: {
        order_status: currentStatus,
        payment_status: paymentStatus,
        shipping_status: shippingStatus
      },
      to: patch
    }
  });

  if (action === "mark_shipped") {
    await notifyOrderShipped({
      items: normalizeOrderItems(result.items),
      order
    });
  }

  return order;
}

export async function updateOrderWorkflow(id: string, input: { message?: string; status: string }) {
  const result = await orderRepository.getOrderById(id);
  const currentOrder = result.order as OrderRecord | null;

  if (!currentOrder) {
    throw new Error("Order not found");
  }

  const currentStatus = getOrderStatus(currentOrder);
  if (!canTransitionOrderStatus(currentStatus, input.status)) {
    throw new Error(`無法將訂單狀態從「${getOrderStatusLabel(currentStatus)}」改為「${getOrderStatusLabel(input.status)}」`);
  }

  if (input.status === "cancelled" && !input.message?.trim()) {
    throw new Error("取消訂單需要填寫原因");
  }

  const currentPaymentStatus = getPaymentStatus(currentOrder);
  const shouldIncreaseSales = input.status === "paid" && currentPaymentStatus !== "paid";
  const patch: Partial<OrderRecord> & Record<string, unknown> = {
    order_status: input.status,
    status: input.status,
    updated_at: new Date().toISOString()
  };

  if (input.status === "paid") {
    patch.payment_status = "paid";
  }

  const order = await orderRepository.updateOrder(id, patch);

  if (shouldIncreaseSales) {
    await increaseProductSales(normalizeOrderItems(result.items));
  }

  await orderRepository.createOrderEvent({
    order_id: id,
    type: "status_changed",
    message: input.message || `訂單狀態更新為 ${getOrderStatusLabel(input.status)}`,
    metadata: { from: currentStatus, status: input.status }
  });

  if (input.status === "paid") {
    await notifyPaymentConfirmed({
      items: normalizeOrderItems(result.items),
      order
    });
  }
  if (input.status === "shipped") {
    await notifyOrderShipped({
      items: normalizeOrderItems(result.items),
      order
    });
  }

  return order;
}
