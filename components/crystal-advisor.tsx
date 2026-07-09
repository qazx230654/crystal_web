"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useState } from "react";

type AdvisorProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  description?: string;
};

type AdvisorMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  products?: AdvisorProduct[];
};

const quickReplies = [
  { label: "我想提升自信", category: "love", note: "可以先從關係能量與自我魅力的晶石開始，讓配戴感更貼近日常。" },
  { label: "想穩定情緒", category: "healing", note: "療癒與安定向的晶石會更適合，能陪你把節奏慢慢整理回來。" },
  { label: "我想招財", category: "wealth", note: "財富與事業向的晶石適合想提高行動感、聚焦感與豐盛流動的人。" },
  { label: "想要防護", category: "protect", note: "守護型晶石適合通勤、工作壓力大，或希望建立能量邊界的時候。" }
];

async function fetchRecommendedProducts(category: string) {
  const response = await fetch(`/api/products?category=${category}&sort=${encodeURIComponent("銷售量")}`);
  const payload = await response.json();

  if (!response.ok) {
    return [];
  }

  return (payload.data ?? []).slice(0, 2) as AdvisorProduct[];
}

export function CrystalAdvisor() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "你好，我是 Crystal 顧問。告訴我你現在想靠近的狀態，我會先推薦幾款適合參考的晶石。"
    }
  ]);
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  async function handleQuickReply(reply: (typeof quickReplies)[number]) {
    setMessages((current) => [
      ...current,
      { id: `${reply.label}-user-${Date.now()}`, role: "user", text: reply.label }
    ]);
    setLoadingCategory(reply.category);

    const products = await fetchRecommendedProducts(reply.category);

    setLoadingCategory(null);
    setMessages((current) => [
      ...current,
      {
        id: `${reply.category}-assistant-${Date.now()}`,
        role: "assistant",
        text: `${reply.note}\n以下是可以先參考的商品：`,
        products
      }
    ]);
  }

  return (
    <>
      {open ? (
        <section className="fixed bottom-24 right-5 z-40 w-[min(92vw,360px)] overflow-hidden rounded-[18px] border border-crystal-gold/30 bg-white shadow-[0_24px_70px_rgba(90,65,55,0.18)]">
          <div className="flex items-center justify-between border-b border-crystal-gold/18 bg-crystal-champagne/30 px-4 py-3 text-crystal-ink">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-white text-crystal-gold shadow-[0_10px_22px_rgba(185,151,91,0.14)]">
                <Sparkles size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold">Crystal 顧問</p>
                <p className="text-xs text-crystal-muted">水晶能量顧問 · 線上中</p>
              </div>
            </div>
            <button className="text-crystal-muted transition hover:text-crystal-ink" onClick={() => setOpen(false)} type="button">
              <X size={18} />
            </button>
          </div>
          <div className="max-h-[430px] space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                className={message.role === "user" ? "ml-auto max-w-[82%] rounded-[18px] rounded-tr-sm bg-crystal-gold/70 px-3 py-2 text-xs leading-6 text-white" : "max-w-[92%] rounded-[18px] rounded-tl-sm border border-crystal-gold/18 bg-white px-3 py-3 text-xs leading-6 text-crystal-ink shadow-[0_12px_28px_rgba(185,151,91,0.08)]"}
                key={`${message.id}-${index}`}
              >
                <p className="whitespace-pre-line">{message.text}</p>
                {message.products?.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {message.products.map((product) => (
                      <Link
                        className="overflow-hidden border border-crystal-gold/20 bg-white transition hover:-translate-y-0.5 hover:border-crystal-gold/50"
                        href={`/products/${product.slug}`}
                        key={product.id}
                      >
                        <div className="relative aspect-square bg-crystal-pearl">
                          <Image alt={product.name} className="object-cover" fill sizes="140px" src={product.image} />
                        </div>
                        <div className="p-2">
                          <p className="line-clamp-2 text-[11px] font-medium leading-5 text-crystal-ink">{product.name}</p>
                          <p className="mt-1 text-[11px] text-crystal-gold">NT$ {product.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loadingCategory ? <p className="text-xs text-crystal-muted">正在整理適合的晶石...</p> : null}
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  className="rounded-full border border-crystal-gold/25 bg-white px-3 py-1.5 text-[11px] text-crystal-muted transition hover:border-crystal-gold hover:bg-crystal-champagne/30 hover:text-crystal-ink disabled:opacity-50"
                  disabled={loadingCategory !== null}
                  key={reply.label}
                  onClick={() => handleQuickReply(reply)}
                  type="button"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-crystal-gold/18 bg-white px-3 py-3">
            <input className="min-w-0 flex-1 rounded-full border border-crystal-gold/25 bg-crystal-cream/50 px-4 py-2 text-xs outline-none placeholder:text-crystal-muted" placeholder="問問 Crystal 顧問..." />
            <button className="grid size-10 place-items-center rounded-full bg-crystal-champagne/70 text-crystal-gold" type="button">
              <Send size={16} />
            </button>
          </div>
        </section>
      ) : null}
      <button
        className="fixed bottom-6 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-crystal-gold/40 bg-white/90 px-5 py-3 text-xs font-semibold tracking-[0.08em] text-crystal-ink shadow-[0_16px_40px_rgba(185,151,91,0.18)] backdrop-blur transition hover:bg-crystal-champagne/30"
        onClick={() => setOpen(true)}
        type="button"
      >
        <MessageCircle size={18} />
        開啟水晶顧問
      </button>
    </>
  );
}
