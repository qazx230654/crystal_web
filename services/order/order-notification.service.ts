import {
  notifyCustomerOrderCreated,
  notifyCustomerOrderShipped,
  notifyCustomerPaymentConfirmed,
  notifyStoreOwnerNewOrder,
  runNotification
} from "@/services/notification-service";

import type { BuiltOrderItem, OrderItemInsert, OrderRecord, OrderTotals } from "./types";

export function normalizeOrderItems(items: unknown): OrderItemInsert[] {
  return Array.isArray(items) ? (items as OrderItemInsert[]) : [];
}

export async function notifyNewOrder(input: {
  items: BuiltOrderItem[];
  order: OrderRecord;
  totals: OrderTotals;
}) {
  await runNotification(() => notifyStoreOwnerNewOrder(input));
  await runNotification(() => notifyCustomerOrderCreated(input));
}

export async function notifyPaymentConfirmed(input: {
  items: OrderItemInsert[];
  order: OrderRecord;
}) {
  await runNotification(() => notifyCustomerPaymentConfirmed(input));
}

export async function notifyOrderShipped(input: {
  items: OrderItemInsert[];
  order: OrderRecord;
}) {
  await runNotification(() => notifyCustomerOrderShipped(input));
}
