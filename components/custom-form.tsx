"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { mockProducts } from "@/data/mock-products";

const tarotTopics = [
  "戀愛指南",
  "感情復合",
  "緣來暗戀",
  "旺桃花運",
  "財富密碼",
  "進化人生",
  "流年運勢",
  "守護神",
  "職涯探索",
  "心靈療癒"
];

export function CustomForm({ planCode }: { planCode: string }) {
  const [selected, setSelected] = useState("剛好");
  const [submitted, setSubmitted] = useState(false);
  const { addItem } = useCart();
  const product = mockProducts.find((item) => item.slug === "custom-deposit-product") ?? mockProducts[0];

  return (
    <form
      className="mt-8 grid gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        addItem(product, { plan: planCode });
      }}
    >
      {planCode === "B" ? (
        <fieldset>
          <legend className="mb-4 text-xl font-semibold">1. 想占卜哪個主題？</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tarotTopics.map((topic) => (
              <button className="rounded-md border border-crystal-line bg-white/74 p-4 text-left hover:border-crystal-rose" key={topic} type="button">
                <span className="block font-semibold">{topic}</span>
                <span className="mt-1 block text-sm text-crystal-muted">點選查看內容 ↓</span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <label className="grid gap-3">
          <span className="text-xl font-semibold">1. 您想要什麼功效？</span>
          <textarea className="min-h-32 rounded-md border border-crystal-line bg-white/80 p-4 outline-crystal-rose" placeholder="寫下您想要的功效或願望，也可以描述目前的困境或期待的改變" />
        </label>
      )}
      <label className="grid gap-3">
        <span className="text-xl font-semibold">2. 手圍尺寸是多少？</span>
        <input className="rounded-md border border-crystal-line bg-white/80 p-4 outline-crystal-rose" placeholder="例如：15.5" type="number" />
      </label>
      <fieldset>
        <legend className="mb-4 text-xl font-semibold">3. 手圍的鬆緊偏好？</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {["剛好", "微鬆"].map((item) => (
            <button className={`rounded-md border p-4 text-left ${selected === item ? "border-crystal-ink bg-white" : "border-crystal-line bg-white/70"}`} key={item} onClick={() => setSelected(item)} type="button">
              <span className="font-semibold">{item}</span>
              <span className="mt-1 block text-sm text-crystal-muted">{item === "剛好" ? "會有水晶壓痕但不掐肉，手鍊緊貼手腕" : "可輕微滑動，戴起來較為舒適寬鬆"}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-3">
          <span className="font-semibold">有想要的水晶顏色嗎？</span>
          <textarea className="min-h-28 rounded-md border border-crystal-line bg-white/80 p-4 outline-crystal-rose" placeholder="例如：偏粉色系、紫色、透明" />
        </label>
        <label className="grid gap-3">
          <span className="font-semibold">Instagram 帳號 / LINE ID</span>
          <input className="rounded-md border border-crystal-line bg-white/80 p-4 outline-crystal-rose" placeholder="@your_ig_handle 或 LINE ID" />
        </label>
      </div>
      {submitted ? <p className="rounded-md bg-crystal-pearl p-4 text-sm text-crystal-muted">已加入購物袋，這是 mock API 流程，不會送出真實訂單。</p> : null}
      <div className="flex flex-wrap gap-3">
        <button className="rounded-full bg-crystal-ink px-6 py-3 font-semibold text-white" type="submit">
          確認，加入購物車
        </button>
      </div>
    </form>
  );
}
