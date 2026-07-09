import { domesticShippingOptions } from "@/config/checkout";
import type { CheckoutStoreInfo, DeliveryMethod, ShippingRule } from "@/src/domain/checkout/types";

export const defaultShippingRules: ShippingRule[] = [
  {
    fee: domesticShippingOptions.blackCat.fee,
    freeShippingItemThreshold: 2,
    method: domesticShippingOptions.blackCat.method
  },
  {
    fee: domesticShippingOptions.sevenEleven.fee,
    freeShippingItemThreshold: 2,
    method: domesticShippingOptions.sevenEleven.method
  }
];

export class ShippingCalculator {
  constructor(private readonly rules: ShippingRule[] = defaultShippingRules) {}

  calculateFee(method: DeliveryMethod, itemCount: number) {
    const rule = this.rules.find((item) => item.method === method);
    if (!rule) return 0;
    if (rule.freeShippingItemThreshold && itemCount >= rule.freeShippingItemThreshold) return 0;
    return rule.fee;
  }

  calculateTotal(subtotal: number, method: DeliveryMethod, itemCount: number) {
    return subtotal + this.calculateFee(method, itemCount);
  }
}

export const defaultShippingCalculator = new ShippingCalculator();

export function calculateShippingFee(method: DeliveryMethod, itemCount: number) {
  return defaultShippingCalculator.calculateFee(method, itemCount);
}

export function calculateShippingFeeForMethod(method: string, itemCount: number) {
  return isDeliveryMethod(method) ? calculateShippingFee(method, itemCount) : 0;
}

export function calculateCheckoutTotal(subtotal: number, method: DeliveryMethod, itemCount: number) {
  return defaultShippingCalculator.calculateTotal(subtotal, method, itemCount);
}

export function buildDomesticAddress(formData: FormData) {
  return [
    String(formData.get("postalCode") ?? "").trim(),
    String(formData.get("city") ?? "").trim(),
    String(formData.get("street") ?? "").trim(),
    String(formData.get("detailAddress") ?? "").trim()
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildStoreLabel(store: CheckoutStoreInfo) {
  return [store.name, store.id ? `店號 ${store.id}` : "", store.address].filter(Boolean).join("｜");
}

export function getStoreInfoFromSearchParams(params: URLSearchParams): CheckoutStoreInfo {
  return {
    address: params.get("cvsAddress"),
    id: params.get("cvsStoreId"),
    name: params.get("cvsStoreName"),
    telephone: params.get("cvsTelephone")
  };
}

export function getCheckoutShippingFromSearchParams(params: URLSearchParams) {
  const shipping = params.get("shipping");
  return shipping === "711" ? "711" : null;
}

export function resolveShippingAddress(input: {
  formData: FormData;
  method: DeliveryMethod;
  storeLabel?: string;
}) {
  if (input.method === "black-cat") return buildDomesticAddress(input.formData);
  return input.storeLabel || "7-11 門市待選擇";
}

export function isDeliveryMethod(method: string): method is DeliveryMethod {
  return defaultShippingRules.some((rule) => rule.method === method);
}
