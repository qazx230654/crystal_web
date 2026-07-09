import { supabaseRest } from "@/services/supabase-rest";

export type OrderRecordRow = {
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

export type OrderItemRecord = {
  id?: string;
  options?: Record<string, string>;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  quantity: number;
  unit_price: number;
};

export class OrderRepository {
  async createOrder(payload: Record<string, unknown>) {
    const [order] = await supabaseRest<OrderRecordRow[]>("orders", {
      body: payload,
      method: "POST"
    });

    return order;
  }

  createOrderItems(items: OrderItemRecord[]) {
    return supabaseRest<OrderItemRecord[]>("order_items", {
      body: items,
      method: "POST"
    });
  }

  createOrderEvent(payload: Record<string, unknown>) {
    return supabaseRest("order_events", {
      body: payload,
      method: "POST"
    });
  }

  async getOrderById(id: string) {
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

  listOrders(limit = 100) {
    return supabaseRest<OrderRecordRow[]>("orders", {
      query: `?select=*&order=created_at.desc&limit=${limit}`
    });
  }

  listOrdersByUser(userId: string) {
    return supabaseRest<OrderRecordRow[]>("orders", {
      query: `?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc&limit=100`
    });
  }

  async findOrderById(id: string) {
    const orders = await supabaseRest<OrderRecordRow[]>("orders", {
      query: `?id=eq.${encodeURIComponent(id)}&select=*`
    });

    return orders[0] ?? null;
  }

  async findOrderByNumber(orderNumber: string) {
    const orders = await supabaseRest<OrderRecordRow[]>("orders", {
      query: `?order_number=eq.${encodeURIComponent(orderNumber)}&select=*`
    });

    return orders[0] ?? null;
  }

  async updateOrder(id: string, patch: Record<string, unknown>) {
    const [order] = await supabaseRest<OrderRecordRow[]>("orders", {
      body: patch,
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`
    });

    return order;
  }
}

export const orderRepository = new OrderRepository();
