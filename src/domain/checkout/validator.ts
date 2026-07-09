import type { CheckoutOrderPayload, DeliveryMethod, PaymentMethod } from "@/src/domain/checkout/types";

export class CheckoutValidator {
  validate(input: {
    itemCount: number;
    paymentMethod: PaymentMethod;
    payload: CheckoutOrderPayload;
    shippingMethod: DeliveryMethod;
  }) {
    if (!input.itemCount) return "購物袋是空的";
    if (!input.payload.customer.name.trim()) return "請輸入姓名";
    if (!input.payload.customer.phone.trim()) return "請輸入手機號碼";
    if (!input.payload.customer.email.trim()) return "請輸入 Email";
    if (!input.paymentMethod) return "請選擇付款方式";
    if (!input.shippingMethod) return "請選擇配送方式";
    if (!input.payload.items.length) return "請至少選擇一項商品";
    return null;
  }
}

export const checkoutValidator = new CheckoutValidator();
