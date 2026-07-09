import { findProduct } from "@/services/product-service";
import {
  notifyCustomerOrderShipped,
  notifyCustomerPaymentConfirmed,
  notifyStoreOwnerNewOrder,
  runNotification
} from "@/services/notification-service";
import { supabaseRest } from "@/services/supabase-rest";
import {
  canTransitionOrderStatus,
  getOrderStatus,
  getOrderStatusLabel,
  getPaymentStatus,
  getShippingStatus,
  resolveLogisticsProvider,
  type AdminOrderAction
} from "@/src/domain/order";

export {
  getOrderStatus,
  getPaymentStatus,
  getShippingStatus,
  orderStatusLabels,
  paymentStatusLabels,
  shippingStatusLabels,
  type AdminOrderAction
} from "@/src/domain/order";

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

type OrderItemInsert = {
  options?: Record<string, string>;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  quantity: number;
  unit_price: number;
};

type ProductSalesRecord = {
  id: string;
  sales?: number | null;
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
    order_status: "pending",
    payment_method: input.paymentMethod,
    payment_status: "unpaid",
    shipping_address: input.shipping.address || null,
    shipping_fee: shippingFee,
    shipping_method: input.shipping.method,
    shipping_status: "pending",
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

  await runNotification(() =>
    notifyStoreOwnerNewOrder({
      items,
      order,
      totals: {
        shippingFee,
        subtotal,
        total
      }
    })
  );

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

export async function listOrders(limit = 100) {
  return supabaseRest<OrderRecord[]>("orders", {
    query: `?select=*&order=created_at.desc&limit=${limit}`
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
  return updateOrderWorkflow(id, { message, status });
}

export async function updateOrderWorkflowAction(id: string, action: AdminOrderAction, message?: string) {
  const result = await getOrderById(id);
  const currentOrder = result.order as OrderRecord | null;

  if (!currentOrder) {
    throw new Error("Order not found");
  }

  const currentStatus = getOrderStatus(currentOrder);
  const paymentStatus = getPaymentStatus(currentOrder);
  const shippingStatus = getShippingStatus(currentOrder);
  const now = new Date().toISOString();
  const patch: Partial<OrderRecord> & Record<string, unknown> = {
    updated_at: now
  };
  let eventMessage = "";

  if (action === "start_preparing") {
    if (currentStatus !== "paid" || paymentStatus !== "paid") {
      throw new Error("只有已付款且待出貨的訂單可以開始備貨");
    }
    patch.status = "making";
    patch.order_status = "making";
    eventMessage = "店家開始備貨";
  }

  if (action === "create_shipment") {
    if (currentStatus !== "making") {
      throw new Error("只有備貨中的訂單可以建立物流單");
    }
    if (shippingStatus !== "pending") {
      throw new Error("物流單已建立，無法重複建立");
    }
    patch.shipping_status = "created";
    patch.logistics_provider = resolveLogisticsProvider(currentOrder.shipping_method);
    patch.tracking_number = `DEMO${Date.now().toString().slice(-10)}`;
    patch.logistics_print_url = null;
    eventMessage = "物流單已建立（Demo，尚未串接綠界 API）";
  }

  if (action === "mark_shipped") {
    if (currentStatus !== "making" || !["created", "shipped"].includes(shippingStatus)) {
      throw new Error("只有備貨中且已建立物流單的訂單可以標記出貨");
    }
    patch.status = "shipped";
    patch.order_status = "shipped";
    patch.shipping_status = "shipped";
    patch.shipped_at = now;
    eventMessage = "訂單已標記出貨";
  }

  if (action === "complete_order") {
    if (!["shipped", "paid", "making"].includes(currentStatus)) {
      throw new Error("目前狀態無法完成訂單");
    }
    patch.status = "completed";
    patch.order_status = "completed";
    if (shippingStatus !== "returned") {
      patch.shipping_status = currentOrder.shipping_method === "711" ? "picked_up" : "delivered";
    }
    eventMessage = "訂單已完成";
  }

  if (action === "cancel_order") {
    if (!message?.trim()) {
      throw new Error("取消訂單需要填寫原因");
    }
    if (!["pending", "paid", "making"].includes(currentStatus)) {
      throw new Error("此訂單狀態不可取消");
    }
    patch.status = "cancelled";
    patch.order_status = "cancelled";
    eventMessage = `訂單已取消：${message.trim()}`;
  }

  if (action === "refund_order") {
    if (paymentStatus !== "paid") {
      throw new Error("只有已付款訂單可以退款");
    }
    patch.payment_status = "refunding";
    patch.status = currentStatus === "completed" ? "completed" : "cancelled";
    patch.order_status = patch.status;
    eventMessage = message?.trim() ? `退款處理中：${message.trim()}` : "退款處理中";
  }

  if (!eventMessage) {
    throw new Error("不支援的訂單操作");
  }

  const [order] = await supabaseRest<OrderRecord[]>("orders", {
    body: patch,
    method: "PATCH",
    query: `?id=eq.${encodeURIComponent(id)}`
  });

  await supabaseRest("order_events", {
    body: {
      order_id: id,
      type: "status_changed",
      message: eventMessage,
      metadata: {
        action,
        from: {
          order_status: currentStatus,
          payment_status: paymentStatus,
          shipping_status: shippingStatus
        },
        to: patch
      }
    },
    method: "POST"
  });

  if (action === "mark_shipped") {
    await runNotification(() =>
      notifyCustomerOrderShipped({
        items: Array.isArray(result.items) ? (result.items as OrderItemInsert[]) : [],
        order
      })
    );
  }

  return order;
}

export async function updateOrderWorkflow(id: string, input: { message?: string; status: string }) {
  const result = await getOrderById(id);
  const currentOrder = result.order as OrderRecord | null;

  if (!currentOrder) {
    throw new Error("Order not found");
  }

  const currentStatus = getOrderStatus(currentOrder);
  if (!canTransitionOrderStatus(currentStatus, input.status)) {
    throw new Error(`無法將訂單狀態從「${getOrderStatusLabel(currentStatus)}」改為「${getOrderStatusLabel(input.status)}」`);
  }

  if (input.status === "cancelled" && !input.message?.trim()) {
    throw new Error("取消訂單需要填寫原因");
  }

  const currentPaymentStatus = getPaymentStatus(currentOrder);
  const shouldIncreaseSales = input.status === "paid" && currentPaymentStatus !== "paid";
  const patch: Partial<OrderRecord> & Record<string, unknown> = {
    order_status: input.status,
    status: input.status,
    updated_at: new Date().toISOString()
  };

  if (input.status === "paid") {
    patch.payment_status = "paid";
  }

  const [order] = await supabaseRest<OrderRecord[]>("orders", {
    body: patch,
    method: "PATCH",
    query: `?id=eq.${encodeURIComponent(id)}`
  });

  if (shouldIncreaseSales) {
    await increaseProductSales(Array.isArray(result.items) ? (result.items as OrderItemInsert[]) : []);
  }

  await supabaseRest("order_events", {
    body: {
      order_id: id,
      type: "status_changed",
      message: input.message || `訂單狀態更新為 ${getOrderStatusLabel(input.status)}`,
      metadata: { from: currentStatus, status: input.status }
    },
    method: "POST"
  });

  if (input.status === "paid") {
    await runNotification(() =>
      notifyCustomerPaymentConfirmed({
        items: Array.isArray(result.items) ? (result.items as OrderItemInsert[]) : [],
        order
      })
    );
  }
  if (input.status === "shipped") {
    await runNotification(() =>
      notifyCustomerOrderShipped({
        items: Array.isArray(result.items) ? (result.items as OrderItemInsert[]) : [],
        order
      })
    );
  }

  return order;
}

async function increaseProductSales(items: OrderItemInsert[]) {
  const salesByProduct = items.reduce<Record<string, { productId: string; productSlug: string; quantity: number }>>((acc, item) => {
    const key = item.product_id || item.product_slug;
    if (!key) return acc;

    acc[key] = {
      productId: item.product_id,
      productSlug: item.product_slug,
      quantity: (acc[key]?.quantity ?? 0) + Math.max(1, Number(item.quantity ?? 1))
    };

    return acc;
  }, {});

  await Promise.all(Object.values(salesByProduct).map((item) => increaseSingleProductSales(item)));
}

async function increaseSingleProductSales(item: { productId: string; productSlug: string; quantity: number }) {
  let products = await supabaseRest<ProductSalesRecord[]>("products", {
    query: `?id=eq.${encodeURIComponent(item.productId)}&select=id,sales&limit=1`
  });

  if (!products.length && item.productSlug) {
    products = await supabaseRest<ProductSalesRecord[]>("products", {
      query: `?slug=eq.${encodeURIComponent(item.productSlug)}&select=id,sales&limit=1`
    });
  }

  const product = products[0];
  if (!product) return;

  await supabaseRest<ProductSalesRecord[]>("products", {
    body: {
      sales: Number(product.sales ?? 0) + item.quantity
    },
    method: "PATCH",
    query: `?id=eq.${encodeURIComponent(product.id)}`
  });
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
