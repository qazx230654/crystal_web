import type { ProductStatus } from "@/data/product-types";

const statusPrefixes: Record<Exclude<ProductStatus, "active">, string> = {
  soldout: "[soldout]",
  draft: "[draft]",
  hidden: "[hidden]"
};

export function decodeStoredStockLabel(value?: string | null): { status: ProductStatus; stockLabel: string } {
  const raw = String(value ?? "").trim();

  for (const [status, prefix] of Object.entries(statusPrefixes) as Array<[Exclude<ProductStatus, "active">, string]>) {
    if (raw.startsWith(prefix)) {
      const stockLabel = raw.slice(prefix.length).trim() || defaultStockLabelForStatus(status);
      return { status, stockLabel };
    }
  }

  if (/售完|缺貨/i.test(raw)) {
    return { status: "soldout", stockLabel: raw || defaultStockLabelForStatus("soldout") };
  }

  return {
    status: "active",
    stockLabel: raw || defaultStockLabelForStatus("active")
  };
}

export function encodeStoredStockLabel(stockLabel: string, status: ProductStatus) {
  const clean = stripStatusPrefix(stockLabel).trim() || defaultStockLabelForStatus(status);

  if (status === "active") {
    return clean;
  }

  return `${statusPrefixes[status]} ${clean}`;
}

function stripStatusPrefix(value: string) {
  return value.replace(/^\[(soldout|draft|hidden)\]\s*/i, "");
}

function defaultStockLabelForStatus(status: ProductStatus) {
  if (status === "soldout") return "售完";
  if (status === "draft") return "草稿";
  if (status === "hidden") return "隱藏";
  return "現貨 2-5 個工作天寄出";
}
