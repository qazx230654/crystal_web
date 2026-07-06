"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/cart-context";

export function CartDrawer() {
  const { closeCart, isOpen, lines, total, updateQuantity } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-crystal-ink/30">
      <aside className="ml-auto flex h-full w-[min(92vw,420px)] flex-col bg-crystal-cream shadow-soft">
        <div className="flex items-center justify-between border-b border-crystal-line p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-crystal-rose">Shopping Bag</p>
            <h3 className="mt-1 text-2xl font-semibold">購物袋</h3>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white" onClick={closeCart} type="button">
            <X size={18} />
          </button>
        </div>
        {lines.length ? (
          <>
            <div className="flex-1 space-y-4 overflow-auto p-6">
              {lines.map((line) => (
                <div className="flex gap-4 rounded-md border border-crystal-line bg-white/72 p-3" key={line.product.id}>
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-crystal-pearl">
                    <Image alt={line.product.name} fill className="object-cover" src={line.product.image} sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{line.product.name}</p>
                    <p className="mt-1 text-sm text-crystal-muted">NT$ {line.product.price.toLocaleString()}</p>
                    <div className="mt-3 inline-flex items-center rounded-full border border-crystal-line bg-crystal-cream">
                      <button className="grid h-8 w-8 place-items-center" onClick={() => updateQuantity(line.product.id, line.quantity - 1)} type="button">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm">{line.quantity}</span>
                      <button className="grid h-8 w-8 place-items-center" onClick={() => updateQuantity(line.product.id, line.quantity + 1)} type="button">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-crystal-line p-6">
              <div className="mb-4 flex items-center justify-between text-lg font-semibold">
                <span>小計</span>
                <span>NT$ {total.toLocaleString()}</span>
              </div>
              <Link className="block w-full rounded-full bg-crystal-ink px-5 py-3 text-center text-sm font-semibold text-white" href="/checkout" onClick={closeCart}>
                前往結帳
              </Link>
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-6 text-center">
            <div>
              <p className="text-crystal-muted">你的購物袋是空的</p>
              <Link
                className="mt-6 inline-flex rounded-full bg-crystal-ink px-6 py-3 text-sm font-semibold text-white"
                href="/products"
                onClick={closeCart}
              >
                開始選購
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
