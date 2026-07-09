"use client";

import {
  getOrderStatus,
  getOrderStatusLabel,
  getPaymentStatus,
  getPaymentStatusLabel,
  getShippingStatus,
  getShippingStatusLabel,
  orderEventTypeLabels
} from "@/src/domain/order";

function getEventMessage(event: any) {
  if (event.message) {
    return event.message.replace(/訂單狀態更新為\s+([a-z_]+)/gi, (_match: string, status: string) => `訂單狀態更新為 ${getOrderStatusLabel(status)}`);
  }

  return orderEventTypeLabels[event.type] ?? event.type ?? "訂單紀錄";
}

export function OrderDetailsPanel({
  detail,
  loading
}: {
  detail: any;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-crystal-pearl/70 px-5 py-5">
        <p className="text-sm text-crystal-muted">明細讀取中...</p>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="bg-crystal-pearl/70 px-5 py-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
        <section className="rounded-md border border-crystal-line bg-white/80 p-4">
          <h2 className="font-semibold">收件資料</h2>
          <dl className="mt-3 grid gap-2 text-sm text-crystal-muted">
            <InfoRow label="姓名" value={detail.order.customer_name} />
            <InfoRow label="手機" value={detail.order.customer_phone} />
            <InfoRow label="Email" value={detail.order.customer_email || "-"} />
            <InfoRow label="LINE" value={detail.order.line_id || "-"} />
            <InfoRow label="會員" value={detail.order.user_id ? "是" : "否"} />
            <InfoRow label="配送" value={detail.order.shipping_method} />
            <InfoRow label="地址" value={detail.order.shipping_address || "-"} />
            <InfoRow label="訂單狀態" value={getOrderStatusLabel(getOrderStatus(detail.order))} />
            <InfoRow label="金流狀態" value={getPaymentStatusLabel(getPaymentStatus(detail.order))} />
            <InfoRow label="物流狀態" value={getShippingStatusLabel(getShippingStatus(detail.order))} />
            <InfoRow label="物流商" value={detail.order.logistics_provider || "-"} />
            <InfoRow label="物流單號" value={detail.order.tracking_number || "-"} />
          </dl>
        </section>

        <section className="rounded-md border border-crystal-line bg-white/80 p-4">
          <h2 className="font-semibold">商品明細</h2>
          <div className="mt-3 divide-y divide-crystal-line">
            {detail.items.map((item: any) => (
              <div className="py-3 text-sm" key={item.id}>
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{item.product_name}</span>
                  <span>NT$ {(item.unit_price * item.quantity).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-crystal-muted">數量 {item.quantity}</p>
                {item.options ? <p className="mt-1 text-xs text-crystal-muted">{JSON.stringify(item.options)}</p> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-crystal-line bg-white/80 p-4">
          <h2 className="font-semibold">訂單紀錄</h2>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between"><dt className="text-crystal-muted">小計</dt><dd>NT$ {detail.order.subtotal.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-crystal-muted">運費</dt><dd>NT$ {detail.order.shipping_fee.toLocaleString()}</dd></div>
            <div className="flex justify-between font-semibold"><dt>總計</dt><dd>NT$ {detail.order.total.toLocaleString()}</dd></div>
          </dl>
          <div className="mt-4 space-y-2">
            {detail.events.map((event: any) => (
              <div className="rounded bg-crystal-cream p-2 text-xs text-crystal-muted" key={event.id}>
                <p className="font-semibold text-crystal-ink">{getEventMessage(event)}</p>
                <p>{new Date(event.created_at).toLocaleString("zh-TW")}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd className="text-right text-crystal-ink">{value}</dd>
    </div>
  );
}
