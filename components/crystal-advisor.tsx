"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";

const quickReplies = ["我想招財", "想穩定情緒", "想看客製方案"];

export function CrystalAdvisor() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(["你好！我是椛小助，想找哪一種能量呢？"]);

  return (
    <>
      {open ? (
        <section className="fixed bottom-24 right-5 z-40 w-[min(92vw,360px)] overflow-hidden rounded-md border border-crystal-line bg-white shadow-soft">
          <div className="flex items-center justify-between bg-crystal-ink px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">水晶顧問</p>
              <p className="text-xs text-white/70">24 小時椛小助人工智能服務</p>
            </div>
            <button onClick={() => setOpen(false)} type="button">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3 p-4">
            {messages.map((message, index) => (
              <p className="rounded-md bg-crystal-pearl px-3 py-2 text-sm leading-6 text-crystal-ink" key={`${message}-${index}`}>
                {message}
              </p>
            ))}
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  className="rounded-full border border-crystal-line px-3 py-1.5 text-xs text-crystal-muted hover:bg-crystal-pearl"
                  key={reply}
                  onClick={() => setMessages((current) => [...current, reply, "我會推薦你先看對應分類，也可以填寫客製表單讓店長協助搭配。"])}
                  type="button"
                >
                  {reply}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-crystal-line px-3 py-2">
              <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="輸入你的需求" />
              <Send size={16} />
            </div>
          </div>
        </section>
      ) : null}
      <button
        className="fixed bottom-6 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-crystal-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"
        onClick={() => setOpen(true)}
        type="button"
      >
        <MessageCircle size={18} />
        開啟水晶顧問
      </button>
    </>
  );
}
