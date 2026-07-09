export type DeliveryMethod = "black-cat" | "711";

export type PaymentMethod = "credit-card" | "bank-transfer";

export type ShippingRule = {
  fee: number;
  freeShippingItemThreshold?: number;
  method: DeliveryMethod;
};

export type CheckoutCartLine = {
  options?: Record<string, string>;
  product: {
    id: string;
    slug: string;
  };
  quantity: number;
};

export type CheckoutCustomerPayload = {
  email: string;
  lineId: string;
  name: string;
  phone: string;
};

export type CheckoutOrderPayload = {
  customer: CheckoutCustomerPayload;
  items: Array<{
    options?: Record<string, string>;
    productId: string;
    productSlug: string;
    quantity: number;
  }>;
  note: string;
  paymentMethod: PaymentMethod;
  shipping: {
    address: string;
    method: DeliveryMethod;
  };
};

export type CheckoutStoreInfo = {
  address?: string | null;
  id?: string | null;
  name?: string | null;
  telephone?: string | null;
};
