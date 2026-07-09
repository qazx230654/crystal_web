"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import {
  braceletSizeOptions,
  claspOptions,
  defaultBraceletSize,
  fitOptions,
  getClaspPriceDelta,
  isProductSellable,
  type Product
} from "@/src/domain/product";

export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState(defaultBraceletSize);
  const [clasp, setClasp] = useState(claspOptions[0].value);
  const [fit, setFit] = useState(fitOptions[0].value);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const price = product.price + getClaspPriceDelta(clasp);
  const soldOut = !isProductSellable(product);

  return (
    <div>
      <p className="text-sm text-crystal-muted">{product.category.map((item) => item).join("、")} · {product.minerals.join("、")}</p>
      <h1 className="mt-4 font-serif text-5xl font-semibold">{product.name}</h1>
      <p className="mt-4 text-2xl font-semibold text-crystal-rose">NT$ {price.toLocaleString()}</p>
      <div className="mt-8 space-y-7">
        <fieldset>
          <legend className="mb-3 font-semibold">手圍尺寸</legend>
          <div className="flex flex-wrap gap-2">
            {braceletSizeOptions.map((item) => (
              <button className={`rounded-full border px-4 py-2 text-sm ${size === item ? "border-crystal-ink bg-crystal-ink text-white" : "border-crystal-line bg-white/72"}`} key={item} onClick={() => setSize(item)} type="button">
                {item}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 font-semibold">扣件類型</legend>
          <div className="flex flex-wrap gap-2">
            {claspOptions.map((option) => (
              <button className={`rounded-md border px-4 py-3 text-sm ${clasp === option.value ? "border-crystal-ink bg-crystal-ink text-white" : "border-crystal-line bg-white/72"}`} key={option.value} onClick={() => setClasp(option.value)} type="button">
                {option.label} {option.priceDelta ? `+NT$${option.priceDelta}` : ""}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-crystal-muted">龍蝦扣及磁扣會使用沒有彈性的魚線製作，若想穿戴方便且更耐用，建議選擇彈力繩款。</p>
        </fieldset>
        <fieldset>
          <legend className="mb-3 font-semibold">鬆緊度</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {fitOptions.map((option) => (
              <button className={`rounded-md border p-4 text-left ${fit === option.value ? "border-crystal-ink bg-white" : "border-crystal-line bg-white/60"}`} key={option.value} onClick={() => setFit(option.value)} type="button">
                <span className="block font-semibold">{option.label}</span>
                <span className="mt-1 block text-sm text-crystal-muted">{option.note}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-crystal-line bg-white/72">
            <button className="grid h-11 w-11 place-items-center" onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button">
              <Minus size={15} />
            </button>
            <span className="w-10 text-center">{quantity}</span>
            <button className="grid h-11 w-11 place-items-center" onClick={() => setQuantity((value) => value + 1)} type="button">
              <Plus size={15} />
            </button>
          </div>
          <button
            className="min-w-64 flex-1 rounded-full bg-crystal-ink px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={soldOut}
            onClick={() => {
              if (soldOut) return;
              for (let i = 0; i < quantity; i += 1) addItem(product, { size, clasp, fit });
            }}
            type="button"
          >
            {soldOut ? "目前售完" : "加入購物袋"}
          </button>
        </div>
        <p className="rounded-md border border-crystal-line bg-white/72 p-4 text-sm text-crystal-muted">出貨時間：{product.stockLabel}</p>
      </div>
    </div>
  );
}
