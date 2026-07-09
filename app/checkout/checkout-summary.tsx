import Image from "next/image";
import type { CartLine } from "@/components/cart-context";
import { formatPrice } from "./checkout-format";

export function CheckoutSummary({
  grandTotal,
  lines,
  shippingFee,
  total
}: {
  grandTotal: number;
  lines: CartLine[];
  shippingFee: number;
  total: number;
}) {
  return (
    <aside className="h-fit border border-crystal-line bg-white p-6">
      <h2 className="text-lg font-semibold">訂單摘要</h2>
      <div className="mt-5 space-y-4">
        {lines.map((line) => (
          <div className="flex gap-3" key={`${line.product.id}-${JSON.stringify(line.options)}`}>
            <div className="relative h-16 w-16 overflow-hidden bg-crystal-pearl">
              <Image alt={line.product.name} fill className="object-cover" src={line.product.image} sizes="64px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{line.product.name}</p>
              <p className="mt-1 text-xs text-crystal-muted">x {line.quantity}</p>
              {line.options ? <p className="mt-1 truncate text-xs text-crystal-muted">{Object.values(line.options).join(" / ")}</p> : null}
            </div>
            <p className="text-sm font-semibold">{formatPrice(line.product.price * line.quantity)}</p>
          </div>
        ))}
      </div>
      <dl className="mt-6 space-y-3 border-t border-crystal-line pt-4 text-sm">
        <div className="flex justify-between text-crystal-muted">
          <dt>小計</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
        <div className="flex justify-between text-crystal-muted">
          <dt>運費</dt>
          <dd>{shippingFee === 0 ? "免運" : formatPrice(shippingFee)}</dd>
        </div>
        <div className="flex justify-between border-t border-crystal-line pt-4 text-base font-semibold">
          <dt>總計</dt>
          <dd>{formatPrice(grandTotal)}</dd>
        </div>
      </dl>
    </aside>
  );
}
