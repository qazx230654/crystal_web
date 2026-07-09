export type OrderLineInput = {
  productId: string;
  productSlug: string;
  quantity: number;
  options?: Record<string, string>;
};

export type CreateOrderInput = {
  customer: {
    email?: string;
    lineId?: string;
    name: string;
    phone: string;
  };
  items: OrderLineInput[];
  note?: string;
  paymentMethod: string;
  shipping: {
    address?: string;
    method: string;
  };
  userId?: string;
};

export type OrderRecord = {
  created_at?: string;
  customer_name?: string;
  customer_email?: string | null;
  customer_phone?: string;
  id: string;
  logistics_print_url?: string | null;
  logistics_provider?: string | null;
  order_status?: string | null;
  order_number: string;
  payment_status?: string | null;
  payment_method?: string | null;
  shipping_address?: string | null;
  shipping_fee?: number;
  shipping_method?: string | null;
  shipping_status?: string | null;
  shipped_at?: string | null;
  status: string;
  subtotal?: number;
  tracking_number?: string | null;
  total: number;
  user_id?: string | null;
};

export type OrderItemInsert = {
  options?: Record<string, string>;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  quantity: number;
  unit_price: number;
};

export type BuiltOrderItem = Omit<OrderItemInsert, "order_id">;

export type OrderTotals = {
  shippingFee: number;
  subtotal: number;
  total: number;
};
