import { orderRepository } from "@/repositories/order-repository";

import { notifyNewOrder } from "./order-notification.service";
import {
  buildOrderItems,
  createOrderNumber,
  resolveOrderShippingFee,
  validateOrderInput
} from "./shipping.service";
import { releaseStock, reserveStock } from "./stock.service";
import type { CreateOrderInput } from "./types";

export async function createOrder(input: CreateOrderInput) {
  validateOrderInput(input);

  const orderNumber = createOrderNumber();
  const items = await buildOrderItems(input.items);
  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const shippingFee = resolveOrderShippingFee(input.shipping.method, input.items.length);
  const total = subtotal + shippingFee;
  const orderBody = {
    customer_email: input.customer.email || null,
    customer_name: input.customer.name,
    customer_phone: input.customer.phone,
    line_id: input.customer.lineId || null,
    note: input.note || null,
    order_number: orderNumber,
    order_status: "pending",
    payment_method: input.paymentMethod,
    payment_status: "unpaid",
    shipping_address: input.shipping.address || null,
    shipping_fee: shippingFee,
    shipping_method: input.shipping.method,
    shipping_status: "pending",
    status: "pending",
    subtotal,
    total,
    ...(input.userId ? { user_id: input.userId } : {})
  };

  await reserveStock(items.map((item) => ({ product_id: item.product_id, product_name: item.product_name, quantity: item.quantity })));

  let order: Awaited<ReturnType<typeof orderRepository.createOrder>>;
  try {
    order = await orderRepository.createOrder(orderBody);
    await orderRepository.createOrderItems(items.map((item) => ({ ...item, order_id: order.id })));
  } catch (error) {
    await releaseStock(items.map((item) => ({ product_id: item.product_id, product_name: item.product_name, quantity: item.quantity })));
    throw error;
  }

  await orderRepository.createOrderEvent({
    order_id: order.id,
    type: "created",
    message: "訂單已建立",
    metadata: { orderNumber }
  });

  await notifyNewOrder({
    items,
    order,
    totals: {
      shippingFee,
      subtotal,
      total
    }
  });

  return {
    order,
    items,
    totals: {
      shippingFee,
      subtotal,
      total
    }
  };
}
