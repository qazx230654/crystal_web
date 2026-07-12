import { productRepository } from "@/repositories/product-repository";

export type StockAdjustmentItem = {
  product_id: string;
  product_name: string;
  quantity: number;
};

const MAX_CAS_ATTEMPTS = 3;

export async function reserveStock(items: StockAdjustmentItem[]) {
  const grouped = groupByProduct(items);
  const reserved: StockAdjustmentItem[] = [];

  try {
    for (const item of grouped) {
      await decrementWithRetry(item);
      reserved.push(item);
    }
  } catch (error) {
    await releaseStock(reserved);
    throw error;
  }
}

export async function releaseStock(items: StockAdjustmentItem[]) {
  const grouped = groupByProduct(items);

  await Promise.all(
    grouped.map((item) =>
      incrementWithRetry(item).catch((error) => {
        console.error(`[stock] Failed to release stock for product ${item.product_id}`, error);
      })
    )
  );
}

async function decrementWithRetry(item: StockAdjustmentItem, attempt = 0): Promise<void> {
  const current = await productRepository.getStockQuantity(item.product_id).catch(handleMissingStockColumn);
  if (!current || current.stock_quantity === null) return;

  if (current.stock_quantity < item.quantity) {
    throw new Error(`商品「${item.product_name}」庫存不足，剩餘 ${current.stock_quantity} 件`);
  }

  const updated = await productRepository
    .setStockQuantity(item.product_id, current.stock_quantity, current.stock_quantity - item.quantity)
    .catch(handleMissingStockColumn);

  if (!updated || updated.length) return;

  if (attempt >= MAX_CAS_ATTEMPTS) {
    throw new Error(`商品「${item.product_name}」庫存更新失敗，請稍後再試`);
  }

  return decrementWithRetry(item, attempt + 1);
}

async function incrementWithRetry(item: StockAdjustmentItem, attempt = 0): Promise<void> {
  const current = await productRepository.getStockQuantity(item.product_id).catch(handleMissingStockColumn);
  if (!current || current.stock_quantity === null) return;

  const updated = await productRepository
    .setStockQuantity(item.product_id, current.stock_quantity, current.stock_quantity + item.quantity)
    .catch(handleMissingStockColumn);

  if (!updated || updated.length) return;

  if (attempt >= MAX_CAS_ATTEMPTS) {
    throw new Error(`商品「${item.product_name}」庫存歸還失敗`);
  }

  return incrementWithRetry(item, attempt + 1);
}

// stock_quantity 欄位要等使用者手動執行 docs/supabase-products-stock.sql 才會存在；
// 在那之前把所有商品當成「未追蹤庫存」，避免結帳流程整個中斷。
function handleMissingStockColumn(error: unknown) {
  if (error instanceof Error && error.message.includes("stock_quantity")) return null;
  throw error;
}

function groupByProduct(items: StockAdjustmentItem[]): StockAdjustmentItem[] {
  const byProduct = items.reduce<Record<string, StockAdjustmentItem>>((acc, item) => {
    if (!item.product_id) return acc;

    acc[item.product_id] = {
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: (acc[item.product_id]?.quantity ?? 0) + Math.max(1, Number(item.quantity ?? 1))
    };

    return acc;
  }, {});

  return Object.values(byProduct);
}
