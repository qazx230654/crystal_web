import { productRepository } from "@/repositories/product-repository";

import type { OrderItemInsert } from "./types";

export async function increaseProductSales(items: OrderItemInsert[]) {
  const salesByProduct = items.reduce<Record<string, { productId: string; productSlug: string; quantity: number }>>(
    (acc, item) => {
      const key = item.product_id || item.product_slug;
      if (!key) return acc;

      acc[key] = {
        productId: item.product_id,
        productSlug: item.product_slug,
        quantity: (acc[key]?.quantity ?? 0) + Math.max(1, Number(item.quantity ?? 1))
      };

      return acc;
    },
    {}
  );

  await Promise.all(Object.values(salesByProduct).map((item) => increaseSingleProductSales(item)));
}

async function increaseSingleProductSales(item: { productId: string; productSlug: string; quantity: number }) {
  let product = await productRepository.findProductSalesById(item.productId);

  if (!product && item.productSlug) {
    product = await productRepository.findProductSalesBySlug(item.productSlug);
  }

  if (!product) return;

  await productRepository.updateProductSales(product.id, Number(product.sales ?? 0) + item.quantity);
}
