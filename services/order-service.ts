import { findProduct } from "@/services/product-service";
import { supabaseRest } from "@/services/supabase-rest";

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
  customer_name?: string;
  customer_email?: string | null;
  customer_phone?: string;
  id: string;
  order_number: string;
  status: string;
  total: number;
  user_id?: string | null;
};

export const orderStatusLabels: Record<string, string> = {
  pending: "待確認",
  paid: "已付款",
  making: "製作中",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消"
};

export const orderStatusTransitions: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["making", "cancelled"],
  making: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: []
};

type OrderItemInsert = {
  options?: Record<string, string>;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  quantity: number;
  unit_price: number;
};

export async function createOrder(input: CreateOrderInput) {
  validateOrderInput(input);

  const orderNumber = createOrderNumber();
  const items = await buildOrderItems(input.items);
  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const shippingFee = resolveShippingFee(input.shipping.method, input.items.length);
  const total = subtotal + shippingFee;
  const orderBody = {
    customer_email: input.customer.email || null,
    customer_name: input.customer.name,
    customer_phone: input.customer.phone,
    line_id: input.customer.lineId || null,
    note: input.note || null,
    order_number: orderNumber,
    payment_method: input.paymentMethod,
    shipping_address: input.shipping.address || null,
    shipping_fee: shippingFee,
    shipping_method: input.shipping.method,
    status: "pending",
    subtotal,
    total,
    ...(input.userId ? { user_id: input.userId } : {})
  };

  const [order] = await supabaseRest<OrderRecord[]>("orders", {
    body: orderBody,
    method: "POST"
  });

  await supabaseRest<OrderItemInsert[]>("order_items", {
    body: items.map((item) => ({ ...item, order_id: order.id })),
    method: "POST"
  });

  await supabaseRest("order_events", {
    body: {
      order_id: order.id,
      type: "created",
      message: "訂單已建立",
      metadata: { orderNumber }
    },
    method: "POST"
  });

  return {
    order,
    items,
    totals: {
      shippingFee,
      subtotal,
      total
    }
  };
}

export async function getOrderById(id: string) {
  const orderQuery = `?id=eq.${encodeURIComponent(id)}&select=*`;
  const itemQuery = `?order_id=eq.${encodeURIComponent(id)}&select=*`;
  const eventQuery = `?order_id=eq.${encodeURIComponent(id)}&select=*&order=created_at.asc`;

  const [orders, items, events] = await Promise.all([
    supabaseRest("orders", { query: orderQuery }),
    supabaseRest("order_items", { query: itemQuery }),
    supabaseRest("order_events", { query: eventQuery })
  ]);

  return {
    events,
    items,
    order: Array.isArray(orders) ? orders[0] : null
  };
}

export async function listOrders() {
  return supabaseRest<OrderRecord[]>("orders", {
    query: "?select=*&order=created_at.desc&limit=100"
  });
}

export async function listOrdersByUser(userId: string) {
  return supabaseRest<OrderRecord[]>("orders", {
    query: `?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc&limit=100`
  });
}

export async function lookupOrder(identifier: string, verifier: string) {
  const value = identifier.trim();
  const encoded = encodeURIComponent(value);
  const query = value.includes("-")
    ? `?id=eq.${encoded}&select=*`
    : `?order_number=eq.${encoded}&select=*`;
  const orders = await supabaseRest<OrderRecord[]>("orders", { query });
  const order = orders[0];

  if (!order) return null;

  const normalizedVerifier = verifier.trim().toLowerCase();
  const emailMatches = order.customer_email?.toLowerCase() === normalizedVerifier;
  const phoneMatches = order.customer_phone?.slice(-3) === normalizedVerifier;

  if (!emailMatches && !phoneMatches) return null;

  return getOrderById(order.id);
}

export async function updateOrderStatus(id: string, status: string, message?: string) {
  const result = await getOrderById(id);
  const currentOrder = result.order as OrderRecord | null;

  if (!currentOrder) {
    throw new Error("Order not found");
  }

  const currentStatus = currentOrder.status;
  const allowedStatuses = orderStatusTransitions[currentStatus] ?? [];

  if (status !== currentStatus && !allowedStatuses.includes(status)) {
    throw new Error(`無法將訂單狀態從「${getOrderStatusLabel(currentStatus)}」改為「${getOrderStatusLabel(status)}」`);
  }

  if (status === "cancelled" && !message?.trim()) {
    throw new Error("取消訂單需要填寫原因");
  }

  const [order] = await supabaseRest<OrderRecord[]>("orders", {
    body: {
      status,
      updated_at: new Date().toISOString()
    },
    method: "PATCH",
    query: `?id=eq.${encodeURIComponent(id)}`
  });

  await supabaseRest("order_events", {
    body: {
      order_id: id,
      type: "status_changed",
      message: message || `訂單狀態更新為 ${getOrderStatusLabel(status)}`,
      metadata: { from: currentStatus, status }
    },
    method: "POST"
  });

  return order;
}

function getOrderStatusLabel(status: string) {
  return orderStatusLabels[status] ?? status;
}

async function buildOrderItems(lines: OrderLineInput[]) {
  return Promise.all(
    lines.map(async (line) => {
      const quantity = Math.max(1, Math.floor(Number(line.quantity)));
      const product = await findProduct(line.productSlug);

      if (product.id !== line.productId && product.slug !== line.productSlug) {
        throw new Error(`Product not found: ${line.productSlug}`);
      }

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

function createOrderNumber() {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GD${yyyymmdd}${suffix}`;
}

function resolveShippingFee(method: string, itemCount: number) {
  if (itemCount >= 2) return 0;
  if (method === "711") return 60;
  if (method === "black-cat") return 130;
  return 0;
}

function validateOrderInput(input: CreateOrderInput) {
  if (!input.customer?.name?.trim()) throw new Error("customer.name is required");
  if (!input.customer?.phone?.trim()) throw new Error("customer.phone is required");
  if (!input.items?.length) throw new Error("items is required");
  if (!input.paymentMethod) throw new Error("paymentMethod is required");
  if (!input.shipping?.method) throw new Error("shipping.method is required");
}
