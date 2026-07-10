"use client";

import { ChevronDown } from "lucide-react";
import {
  getAvailableAdminOrderActions,
  getOrderStatus,
  getOrderStatusLabel,
  getPaymentStatus,
  getPaymentStatusLabel,
  getShippingStatus,
  getShippingStatusLabel
} from "@/src/domain/order";
import { OrderDetailsPanel } from "./order-details-panel";

export function OrderRow({
  detail,
  detailsLoading,
  expanded,
  onAction,
  onToggle,
  order
}: {
  detail: any;
  detailsLoading: boolean;
  expanded: boolean;
  onAction: (order: any, action: string) => void;
  onToggle: (id: string) => void;
  order: any;
}) {
  const orderStatus = getOrderStatus(order);
  const paymentStatus = getPaymentStatus(order);
  const shippingStatus = getShippingStatus(order);
  const actions = getAvailableAdminOrderActions(order);

  return (
    <div className="border-b border-crystal-line">
      <div className="grid gap-3 px-5 py-4 text-sm lg:grid-cols-[1.05fr_0.72fr_0.9fr_0.95fr_1.12fr_44px] lg:items-stretch">
        <div>
          <p className="font-semibold">{order.order_number}</p>
          <p className="text-xs text-crystal-muted">{new Date(order.created_at).toLocaleString("zh-TW")}</p>
        </div>
        <div>
          <p>{order.customer_name}</p>
          <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${order.user_id ? "bg-emerald-50 text-emerald-700" : "bg-crystal-cream text-crystal-muted"}`}>
            {order.user_id ? "會員" : "非會員"}
          </span>
        </div>
        <div>
          <p className="font-semibold">NT$ {order.total.toLocaleString()}</p>
          <p className="mt-1 text-xs text-crystal-muted">{order.payment_method ?? "-"}</p>
          <p className="mt-1 text-xs text-crystal-muted">{order.shipping_method ?? "-"}</p>
        </div>
        <div className="grid gap-1.5 text-xs">
          <span>訂單：{getOrderStatusLabel(orderStatus)}</span>
          <span>金流：{getPaymentStatusLabel(paymentStatus)}</span>
          <span>物流：{getShippingStatusLabel(shippingStatus)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <button
              className={`inline-flex h-8 min-w-[92px] items-center justify-center border px-3 text-center text-[11px] font-semibold tracking-[0.04em] transition ${
                action.tone === "danger"
                  ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  : action.tone === "primary"
                    ? "border-crystal-gold/45 bg-crystal-champagne/35 text-crystal-ink hover:bg-crystal-champagne/55"
                    : "border-crystal-line bg-white text-crystal-muted hover:border-crystal-gold hover:text-crystal-ink"
              }`}
              key={action.id}
              onClick={() => onAction(order, action.id)}
              type="button"
            >
              {action.label}
            </button>
          ))}
          {!actions.length ? <span className="text-xs text-crystal-muted">無可用操作</span> : null}
        </div>
        <div className="flex h-full items-center justify-end self-stretch">
          <button
            aria-label={expanded ? "收合訂單明細" : "展開訂單明細"}
            className={`grid size-9 place-items-center rounded-full text-xs font-semibold transition ${
              expanded
                ? "bg-crystal-champagne/35 text-crystal-ink shadow-[0_8px_18px_rgba(185,151,91,0.14)]"
                : "bg-transparent text-crystal-muted hover:bg-crystal-champagne/25 hover:text-crystal-ink"
            }`}
            onClick={() => onToggle(order.id)}
            type="button"
          >
            <ChevronDown className={`transition ${expanded ? "rotate-180" : ""}`} size={14} />
          </button>
        </div>
      </div>
      {expanded ? <OrderDetailsPanel detail={detail} loading={detailsLoading} /> : null}
    </div>
  );
}
