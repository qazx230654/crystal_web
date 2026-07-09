import { findProductStrict } from "@/services/product-service";
import { calculateShippingFeeForMethod } from "@/src/domain/checkout";
import { getUnavailableProductMessage } from "@/src/domain/product";

import type { BuiltOrderItem, CreateOrderInput, OrderLineInput } from "./types";

export function resolveOrderShippingFee(method: string, itemCount: number) {
  return calculateShippingFeeForMethod(method, itemCount);
}

export async function buildOrderItems(lines: OrderLineInput[]): Promise<BuiltOrderItem[]> {
  return Promise.all(
    lines.map(async (line) => {
      const quantity = Math.max(1, Math.floor(Number(line.quantity)));
      const product = await findProductStrict(line.productSlug, { includeInactive: true });

      if (!product || (product.id !== line.productId && product.slug !== line.productSlug)) {
        throw new Error(`Product not found: ${line.productSlug}`);
      }

      const unavailableMessage = getUnavailableProductMessage(product);
      if (unavailableMessage) throw new Error(unavailableMessage);

      return {
        options: line.options,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        quantity,
        unit_price: product.price
      };
    })
  );
}

export function createOrderNumber() {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GD${yyyymmdd}${suffix}`;
}

export function validateOrderInput(input: CreateOrderInput) {
  if (!input.customer?.name?.trim()) throw new Error("customer.name is required");
  if (!input.customer?.phone?.trim()) throw new Error("customer.phone is required");
  if (!input.items?.length) throw new Error("items is required");
  if (!input.paymentMethod) throw new Error("paymentMethod is required");
  if (!input.shipping?.method) throw new Error("shipping.method is required");
}
