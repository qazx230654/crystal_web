import type { OrderRecord } from "@/services/order-service";

type OrderItem = {
  product_name?: string;
  product_slug?: string;
  quantity?: number;
  unit_price?: number;
};

type OrderTotals = {
  shippingFee: number;
  subtotal: number;
  total: number;
};

type SendEmailInput = {
  html: string;
  subject: string;
  text: string;
  to: string | string[];
};

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.NOTIFICATION_FROM_EMAIL ?? "Crystal <onboarding@resend.dev>";
const storeOwnerEmail = process.env.STORE_OWNER_EMAIL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function notifyStoreOwnerNewOrder(input: {
  items: OrderItem[];
  order: OrderRecord;
  totals: OrderTotals;
}) {
  if (!storeOwnerEmail) {
    console.warn("[notifications] STORE_OWNER_EMAIL is not configured; skipping owner new-order email.");
    return;
  }

  const { items, order, totals } = input;
  const subject = `新訂單 ${order.order_number}｜${formatCurrency(totals.total)}`;
  const lines = [
    `新訂單：${order.order_number}`,
    `客戶：${order.customer_name ?? "-"} / ${order.customer_phone ?? "-"}`,
    `Email：${order.customer_email ?? "-"}`,
    `配送：${order.shipping_method ?? "-"} ${order.shipping_address ?? ""}`.trim(),
    `付款：${order.payment_method ?? "-"}`,
    `總計：${formatCurrency(totals.total)}`,
    "",
    ...items.map((item) => `${item.product_name ?? item.product_slug ?? "商品"} x ${item.quantity ?? 1}｜${formatCurrency((item.unit_price ?? 0) * (item.quantity ?? 1))}`),
    "",
    `${siteUrl}/admin/orders`
  ];

  await sendEmail({
    html: renderEmailHtml({
      intro: "收到一筆新訂單，請到後台確認付款與出貨安排。",
      lines,
      title: `新訂單 ${order.order_number}`
    }),
    subject,
    text: lines.join("\n"),
    to: storeOwnerEmail
  });
}

export async function notifyCustomerPaymentConfirmed(input: {
  items: OrderItem[];
  order: OrderRecord;
}) {
  const { items, order } = input;
  if (!order.customer_email) return;

  const subject = `已收到您的付款｜訂單 ${order.order_number}`;
  const lines = [
    `${order.customer_name ?? "您好"}，我們已確認您的付款。`,
    `訂單編號：${order.order_number}`,
    `目前狀態：已付款`,
    "",
    ...items.map((item) => `${item.product_name ?? item.product_slug ?? "商品"} x ${item.quantity ?? 1}`),
    "",
    `訂單查詢：${siteUrl}/orders/${order.id}/success`
  ];

  await sendEmail({
    html: renderEmailHtml({
      intro: "付款已確認，我們會開始為您安排商品整理與出貨。",
      lines,
      title: `付款已確認`
    }),
    subject,
    text: lines.join("\n"),
    to: order.customer_email
  });
}

export async function notifyCustomerOrderShipped(input: {
  items: OrderItem[];
  order: OrderRecord;
}) {
  const { items, order } = input;
  if (!order.customer_email) return;

  const subject = `您的訂單已出貨｜${order.order_number}`;
  const lines = [
    `${order.customer_name ?? "您好"}，您的訂單已出貨。`,
    `訂單編號：${order.order_number}`,
    `配送方式：${order.shipping_method ?? "-"}`,
    `收件資訊：${order.shipping_address ?? "-"}`,
    "",
    ...items.map((item) => `${item.product_name ?? item.product_slug ?? "商品"} x ${item.quantity ?? 1}`),
    "",
    `訂單查詢：${siteUrl}/orders/${order.id}/success`
  ];

  await sendEmail({
    html: renderEmailHtml({
      intro: "商品已出貨，請留意物流配送通知。",
      lines,
      title: "訂單已出貨"
    }),
    subject,
    text: lines.join("\n"),
    to: order.customer_email
  });
}

export async function runNotification(task: () => Promise<void>) {
  try {
    await task();
  } catch (error) {
    console.error("[notifications] Failed to send notification.", error);
  }
}

async function sendEmail(input: SendEmailInput) {
  if (!resendApiKey) {
    console.warn("[notifications] RESEND_API_KEY is not configured; skipping email.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: fromEmail,
      html: input.html,
      subject: input.subject,
      text: input.text,
      to: input.to
    }),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${await response.text()}`);
  }
}

function renderEmailHtml({ intro, lines, title }: { intro: string; lines: string[]; title: string }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #302b28; line-height: 1.8;">
      <h1 style="font-size: 22px; font-weight: 600;">${escapeHtml(title)}</h1>
      <p>${escapeHtml(intro)}</p>
      <div style="margin-top: 20px; padding: 16px; border: 1px solid #eadbd4; background: #fffaf6;">
        ${lines.map((line) => `<p style="margin: 0 0 8px;">${escapeHtml(line) || "&nbsp;"}</p>`).join("")}
      </div>
    </div>
  `;
}

function formatCurrency(value: number) {
  return `NT$ ${Number(value || 0).toLocaleString("zh-TW")}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
