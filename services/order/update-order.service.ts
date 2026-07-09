import { orderRepository } from "@/repositories/order-repository";

import { updateOrderWorkflow } from "./order-workflow.service";

export async function getOrderById(id: string) {
  return orderRepository.getOrderById(id);
}

export async function listOrders(limit = 100) {
  return orderRepository.listOrders(limit);
}

export async function listOrdersByUser(userId: string) {
  return orderRepository.listOrdersByUser(userId);
}

export async function lookupOrder(identifier: string, verifier: string) {
  const value = identifier.trim();
  const order = value.includes("-")
    ? await orderRepository.findOrderById(value)
    : await orderRepository.findOrderByNumber(value);

  if (!order) return null;

  const normalizedVerifier = verifier.trim().toLowerCase();
  const emailMatches = order.customer_email?.toLowerCase() === normalizedVerifier;
  const phoneMatches = order.customer_phone?.slice(-3) === normalizedVerifier;

  if (!emailMatches && !phoneMatches) return null;

  return getOrderById(order.id);
}

export async function updateOrderStatus(id: string, status: string, message?: string) {
  return updateOrderWorkflow(id, { message, status });
}
