import { buildPaymentNote } from "@/src/domain/checkout/payment";
import { resolveShippingAddress } from "@/src/domain/checkout/shipping";
import type { CheckoutCartLine, CheckoutOrderPayload, DeliveryMethod, PaymentMethod } from "@/src/domain/checkout/types";

export class CheckoutPayloadBuilder {
  build(input: {
    formData: FormData;
    lines: CheckoutCartLine[];
    paymentMethod: PaymentMethod;
    shippingMethod: DeliveryMethod;
    storeLabel?: string;
    transferFileName?: string;
  }): CheckoutOrderPayload {
    const transferNote = buildPaymentNote({
      formData: input.formData,
      method: input.paymentMethod,
      transferFileName: input.transferFileName
    });
    const note = [String(input.formData.get("note") ?? "").trim(), transferNote].filter(Boolean).join("\n");

    return {
      customer: {
        email: String(input.formData.get("email") ?? ""),
        lineId: "",
        name: String(input.formData.get("name") ?? ""),
        phone: String(input.formData.get("phone") ?? "")
      },
      items: input.lines.map((line) => ({
        options: line.options,
        productId: line.product.id,
        productSlug: line.product.slug,
        quantity: line.quantity
      })),
      note,
      paymentMethod: input.paymentMethod,
      shipping: {
        address: resolveShippingAddress({
          formData: input.formData,
          method: input.shippingMethod,
          storeLabel: input.storeLabel
        }),
        method: input.shippingMethod
      }
    };
  }
}

export const checkoutPayloadBuilder = new CheckoutPayloadBuilder();
