import Link from "next/link";
import { getOrderById } from "@/services/order-service";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({ params }: { params: { id: string } }) {
  const result = await getOrderById(params.id);
  const order = result.order as any;
  const items = result.items as any[];

  if (!order) {
    return (
      <section className="container-shell py-20">
        <h1 className="font-serif text-5xl font-semibold">找不到訂單</h1>
        <Link className="mt-8 inline-flex rounded-full bg-crystal-ink px-6 py-3 text-sm font-semibold text-white" href="/order-lookup">
          前往訂單查詢
        </Link>
      </section>
    );
  }

  return (
    <section className="container-shell py-14">
      <div className="rounded-md border border-crystal-line bg-white/72 p-8 text-center shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Order Created</p>
        <h1 className="mt-3 font-serif text-5xl font-semibold">訂單已建立</h1>
        <p className="mt-5 text-crystal-muted">請截圖保存訂單編號，並加入官方 LINE 傳送訂單編號與姓名。</p>
        <p className="mt-6 text-sm text-crystal-muted">訂單編號</p>
        <p className="mt-1 font-serif text-4xl font-semibold text-crystal-rose">{order.order_number}</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">商品明細</h2>
          <div className="mt-5 divide-y divide-crystal-line">
            {items.map((item) => (
              <div className="flex justify-between py-4" key={item.id}>
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="mt-1 text-sm text-crystal-muted">數量 {item.quantity}</p>
                </div>
                <p className="font-semibold">NT$ {(item.unit_price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">付款資訊</h2>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-crystal-muted">狀態</dt><dd>{order.status}</dd></div>
            <div className="flex justify-between"><dt className="text-crystal-muted">付款方式</dt><dd>{order.payment_method}</dd></div>
            <div className="flex justify-between"><dt className="text-crystal-muted">運費</dt><dd>NT$ {order.shipping_fee.toLocaleString()}</dd></div>
            <div className="flex justify-between text-lg font-semibold"><dt>總計</dt><dd>NT$ {order.total.toLocaleString()}</dd></div>
          </dl>
          <a className="mt-6 block rounded-full bg-crystal-ink px-5 py-3 text-center text-sm font-semibold text-white" href="https://line.me/R/ti/p/@011tymeh" rel="noreferrer" target="_blank">
            加入官方 LINE
          </a>
        </aside>
      </div>
    </section>
  );
}
