"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/components/cart-context";

const sizes = ["13 cm", "13.5 cm", "14 cm", "14.5 cm", "15 cm", "15.5 cm", "16 cm", "16.5 cm", "17 cm"];

export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState(sizes[4]);
  const [clasp, setClasp] = useState("彈力繩");
  const [fit, setFit] = useState("剛好");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const price = product.price + (clasp === "龍蝦扣" ? 200 : 0);
  const soldOut = product.status === "soldout";

  return (
    <div>
      <p className="text-sm text-crystal-muted">{product.category.map((item) => item).join("、")} · {product.minerals.join("、")}</p>
      <h1 className="mt-4 font-serif text-5xl font-semibold">{product.name}</h1>
      <p className="mt-4 text-2xl font-semibold text-crystal-rose">NT$ {price.toLocaleString()}</p>
      <div className="mt-8 space-y-7">
        <fieldset>
          <legend className="mb-3 font-semibold">手圍尺寸</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((item) => (
              <button className={`rounded-full border px-4 py-2 text-sm ${size === item ? "border-crystal-ink bg-crystal-ink text-white" : "border-crystal-line bg-white/72"}`} key={item} onClick={() => setSize(item)} type="button">
                {item}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 font-semibold">扣件類型</legend>
          <div className="flex flex-wrap gap-2">
            {["彈力繩", "龍蝦扣"].map((item) => (
              <button className={`rounded-md border px-4 py-3 text-sm ${clasp === item ? "border-crystal-ink bg-crystal-ink text-white" : "border-crystal-line bg-white/72"}`} key={item} onClick={() => setClasp(item)} type="button">
                {item} {item === "龍蝦扣" ? "+NT$200" : ""}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-crystal-muted">龍蝦扣及磁扣會使用沒有彈性的魚線製作，若想穿戴方便且更耐用，建議選擇彈力繩款。</p>
        </fieldset>
        <fieldset>
          <legend className="mb-3 font-semibold">鬆緊度</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {["剛好", "微鬆"].map((item) => (
              <button className={`rounded-md border p-4 text-left ${fit === item ? "border-crystal-ink bg-white" : "border-crystal-line bg-white/60"}`} key={item} onClick={() => setFit(item)} type="button">
                <span className="block font-semibold">{item}</span>
                <span className="mt-1 block text-sm text-crystal-muted">{item === "剛好" ? "會有水晶壓痕但不掐肉" : "可輕微滑動"}</span>
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
