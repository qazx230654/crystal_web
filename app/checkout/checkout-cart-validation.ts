import type { CartLine } from "@/components/cart-context";
import { getUnavailableProductMessage } from "@/src/domain/product";

export function validateCheckoutCart(input: {
  expectedItemCount: number;
  latestLines: CartLine[];
  priceSnapshot: Record<string, number>;
  unavailableCount: number;
}) {
  if (!input.expectedItemCount) return "購物袋是空的";
  if (input.unavailableCount || input.latestLines.length !== input.expectedItemCount) {
    return "購物袋中有商品已不存在或已下架，請回到購物袋確認後再結帳。";
  }

  const unavailableLine = input.latestLines.find((line) => Boolean(getUnavailableProductMessage(line.product)));
  if (unavailableLine) {
    return getUnavailableProductMessage(unavailableLine.product);
  }

  const insufficientStockLine = input.latestLines.find((line) => {
    const stockQuantity = line.product.stockQuantity;
    return stockQuantity !== null && stockQuantity !== undefined && line.quantity > stockQuantity;
  });
  if (insufficientStockLine) {
    return `商品「${insufficientStockLine.product.name}」庫存不足，剩餘 ${insufficientStockLine.product.stockQuantity} 件，請回到購物袋調整數量。`;
  }

  const changedPriceLine = input.latestLines.find((line) => {
    const previousPrice = input.priceSnapshot[line.key];
    return previousPrice !== undefined && previousPrice !== line.product.price;
  });
  if (changedPriceLine) {
    return `商品「${changedPriceLine.product.name}」價格已更新，請確認訂單摘要後再送出。`;
  }

  return null;
}
