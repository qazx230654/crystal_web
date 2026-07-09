"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Home, LockKeyhole, MapPin, Store, Upload } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { useCart } from "@/components/cart-context";
import type { CartLine } from "@/components/cart-context";
import { bankTransferConfig, domesticShippingOptions, paymentOptions } from "@/config/checkout";
import {
  calculateCheckoutTotal,
  calculateShippingFee,
  checkoutPayloadBuilder,
  checkoutValidator,
  buildStoreLabel,
  getCheckoutShippingFromSearchParams,
  getStoreInfoFromSearchParams,
  type DeliveryMethod,
  type PaymentMethod
} from "@/src/domain/checkout";
import { getUnavailableProductMessage } from "@/src/domain/product";

const checkoutFieldClass = "border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose";

function formatPrice(value: number) {
  return `NT$ ${value.toLocaleString()}`;
}

export default function CheckoutPage() {
  const { clearCart, isHydrating, items, lines, refreshCartProducts, total, unavailableItems } = useCart();
  const { loading: authLoading, member } = useAuth();
  const router = useRouter();
  const [checkoutMode, setCheckoutMode] = useState<"guest" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutPriceSnapshot, setCheckoutPriceSnapshot] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<DeliveryMethod>("black-cat");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit-card");
  const [storeLabel, setStoreLabel] = useState("");
  const [transferFileName, setTransferFileName] = useState("");

  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);
  const shippingFee = calculateShippingFee(shippingMethod, itemCount);
  const grandTotal = calculateCheckoutTotal(total, shippingMethod, itemCount);
  const profile = member?.profile;
  const email = profile?.email ?? member?.user.email ?? "";
  const shouldShowCheckoutForm = Boolean(member || checkoutMode === "guest");
  const cvsMapHref = member ? "/api/logistics/711-map" : "/api/logistics/711-map?guest=1";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isGuest = params.get("guest") === "1";
    const returnedShippingMethod = getCheckoutShippingFromSearchParams(params);
    const storeLabel = buildStoreLabel(getStoreInfoFromSearchParams(params));

    if (isGuest) setCheckoutMode("guest");
    if (returnedShippingMethod) setShippingMethod(returnedShippingMethod);
    if (storeLabel) setStoreLabel(storeLabel);
  }, []);

  useEffect(() => {
    if (isHydrating || !lines.length) return;

    setCheckoutPriceSnapshot((current) => {
      const next = { ...current };
      lines.forEach((line) => {
        if (next[line.key] === undefined) {
          next[line.key] = line.product.price;
        }
      });
      return next;
    });
  }, [isHydrating, lines]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const latestLines = await refreshCartProducts();
    const checkoutCartError = validateCheckoutCart({
      expectedItemCount: items.length,
      latestLines,
      priceSnapshot: checkoutPriceSnapshot,
      unavailableCount: unavailableItems.length
    });

    if (checkoutCartError) {
      setCheckoutPriceSnapshot(
        latestLines.reduce<Record<string, number>>((acc, line) => {
          acc[line.key] = line.product.price;
          return acc;
        }, {})
      );
      setError(checkoutCartError);
      setSubmitting(false);
      return;
    }

    const latestItemCount = latestLines.reduce((sum, line) => sum + line.quantity, 0);
    const orderPayload = checkoutPayloadBuilder.build({
      formData,
      lines: latestLines,
      paymentMethod,
      shippingMethod,
      storeLabel,
      transferFileName
    });
    const validationError = checkoutValidator.validate({
      itemCount: latestItemCount,
      paymentMethod,
      payload: orderPayload,
      shippingMethod
    });

    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return;
    }

    const response = await fetch("/api/orders", {
      body: JSON.stringify(orderPayload),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "訂單建立失敗");
      return;
    }

    clearCart();
    router.push(`/orders/${payload.data.id}/success`);
  }

  if (isHydrating) {
    return (
      <section className="container-shell grid min-h-[60vh] place-items-center py-16 text-center text-sm text-crystal-muted">
        正在確認購物袋內容...
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="container-shell grid min-h-[60vh] place-items-center py-16 text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Checkout</p>
          <h1 className="mt-3 font-serif text-5xl font-semibold">購物袋是空的</h1>
          <Link className="mt-8 inline-flex bg-crystal-ink px-6 py-3 text-sm font-semibold text-white" href="/products">
            返回選購
          </Link>
        </div>
      </section>
    );
  }

  if (authLoading) {
    return (
      <section className="container-shell grid min-h-[60vh] place-items-center py-16 text-center text-sm text-crystal-muted">
        正在確認會員狀態...
      </section>
    );
  }

  if (!shouldShowCheckoutForm) {
    return (
      <section className="container-shell grid min-h-[72vh] place-items-center py-12">
        <div className="w-full max-w-xl text-center">
          <Link className="font-serif text-3xl font-semibold tracking-[0.18em]" href="/">
            Crystal
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.34em] text-crystal-muted">Crystal Energy</p>
          <div className="mt-10 border border-crystal-line bg-white p-10 text-left">
            <h1 className="text-3xl font-semibold">如何結帳</h1>
            <p className="mt-2 text-sm text-crystal-muted">選擇登入會員，或以訪客身分結帳。</p>
            <div className="mt-8 grid gap-5">
              <Link className="block bg-crystal-ink px-6 py-4 text-center text-sm font-semibold tracking-[0.18em] text-white" href="/login?next=/checkout">
                會員登入
              </Link>
              <p className="text-center text-sm text-crystal-muted">會員不定時有專屬優惠</p>
              <button className="border border-crystal-ink bg-white px-6 py-4 text-sm font-semibold tracking-[0.12em] text-crystal-ink" onClick={() => setCheckoutMode("guest")} type="button">
                以訪客身分結帳
              </button>
              <p className="pt-5 text-center text-sm text-crystal-muted">
                還沒有帳號？ <Link className="border-b border-crystal-rose text-crystal-rose" href="/register">立即註冊</Link>
              </p>
            </div>
          </div>
          <Link className="mt-8 inline-flex text-sm text-crystal-muted" href="/">
            ← 返回首頁
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell py-10">
      <div className="mb-8 flex items-center gap-3 text-xs text-crystal-muted">
        <Link href="/">← 返回</Link>
        <span>/</span>
        <span className="text-crystal-ink">結帳</span>
      </div>

      <form className="grid gap-8 lg:grid-cols-[1fr_360px]" key={member?.user.id ?? checkoutMode ?? "guest"} onSubmit={handleSubmit}>
        <div className="space-y-8">
          <section>
            <SectionTitle title="購買人資訊" />
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs font-semibold">姓名 *</span>
                <input autoComplete="name" className={checkoutFieldClass} defaultValue={profile?.name ?? ""} name="name" placeholder="請輸入真實姓名" required />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold">Email *</span>
                <input autoComplete="email" className={checkoutFieldClass} defaultValue={email} name="email" placeholder="訂單確認信將寄至此信箱" required type="email" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold">手機號碼 *</span>
                <input autoComplete="tel" className={checkoutFieldClass} defaultValue={profile?.phone ?? ""} inputMode="tel" name="phone" placeholder="09xxxxxxxx" required />
              </label>
            </div>
          </section>

          <section>
            <SectionTitle title="配送方式" />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <OptionCard
                active={shippingMethod === "black-cat"}
                description={`${domesticShippingOptions.blackCat.note} (${formatPrice(domesticShippingOptions.blackCat.fee)})`}
                icon={<Home size={24} />}
                title={domesticShippingOptions.blackCat.label}
                onClick={() => setShippingMethod("black-cat")}
              />
              <OptionCard
                active={shippingMethod === "711"}
                description={`${domesticShippingOptions.sevenEleven.note} (${formatPrice(domesticShippingOptions.sevenEleven.fee)})`}
                icon={<Store size={24} />}
                title={domesticShippingOptions.sevenEleven.label}
                onClick={() => setShippingMethod("711")}
              />
            </div>

            {shippingMethod === "black-cat" ? (
              <div className="mt-5 grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input className={checkoutFieldClass} name="postalCode" placeholder="郵遞區號（如 100）" />
                  <input className={checkoutFieldClass} name="city" placeholder="縣市（如 台北市）" required />
                </div>
                <input className={checkoutFieldClass} name="street" placeholder="鄉鎮市區（如 信義區）" required />
                <input className={checkoutFieldClass} name="detailAddress" placeholder="路名、巷號、門牌（如 信義路五段7號）" required />
              </div>
            ) : (
              <div className="mt-5">
                <Link className="flex w-full items-center justify-center gap-2 border border-dashed border-crystal-muted bg-white px-5 py-4 text-sm font-semibold text-crystal-muted" href={cvsMapHref}>
                  <MapPin size={18} />
                  {storeLabel || "點此選擇 7-11 門市"}
                </Link>
                {storeLabel ? <p className="mt-3 text-xs leading-6 text-crystal-muted">{storeLabel}</p> : null}
              </div>
            )}
          </section>

          <section>
            <SectionTitle title="付款方式" />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <OptionCard
                active={paymentMethod === "credit-card"}
                description={paymentOptions.creditCard.note}
                icon={<CreditCard size={24} />}
                title={paymentOptions.creditCard.label}
                onClick={() => setPaymentMethod("credit-card")}
              />
              <OptionCard
                active={paymentMethod === "bank-transfer"}
                description={paymentOptions.bankTransfer.note}
                icon={<CreditCard size={24} />}
                title={paymentOptions.bankTransfer.label}
                onClick={() => setPaymentMethod("bank-transfer")}
              />
            </div>

            {paymentMethod === "bank-transfer" ? (
              <div className="mt-5 border border-blue-200 bg-blue-50 p-5 text-sm text-blue-700">
                <div className="border border-blue-200 bg-white p-4">
                  <p className="font-semibold">轉帳資訊</p>
                  <dl className="mt-4 grid gap-2">
                    <div className="flex justify-between gap-4">
                      <dt>銀行</dt>
                      <dd className="text-right font-semibold">{bankTransferConfig.bankName}（{bankTransferConfig.bankCode}）</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>帳號</dt>
                      <dd className="text-right font-semibold">{bankTransferConfig.accountNumber}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-blue-100 pt-3 text-base">
                      <dt>轉帳金額</dt>
                      <dd className="text-right font-semibold">{formatPrice(grandTotal)}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs">請依上方金額完成轉帳，再填入轉出帳號末五碼並上傳成功截圖。</p>
                </div>
                <label className="mt-5 grid gap-2">
                  <span className="font-semibold">銀行帳號末五碼</span>
                  <input className={checkoutFieldClass} inputMode="numeric" maxLength={5} name="bankLastFive" placeholder="請輸入 5 位數字" />
                </label>
                <label className="mt-5 grid gap-2">
                  <span className="font-semibold">轉帳成功截圖</span>
                  <span className="flex cursor-pointer items-center justify-center gap-2 border border-blue-300 bg-white px-5 py-4 font-semibold">
                    <Upload size={18} />
                    {transferFileName || "上傳轉帳成功截圖"}
                    <input
                      accept="image/*"
                      className="sr-only"
                      name="transferScreenshot"
                      onChange={(event) => setTransferFileName(event.target.files?.[0]?.name ?? "")}
                      type="file"
                    />
                  </span>
                </label>
              </div>
            ) : null}
          </section>

          <label className="grid gap-2">
            <span className="text-xs font-semibold">備註</span>
            <textarea className={`${checkoutFieldClass} min-h-24`} name="note" placeholder="有任何希望我們留意的事項，可以寫在這裡" />
          </label>

          {error ? <p className="border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

          <button className="flex w-full items-center justify-center gap-2 bg-crystal-ink px-6 py-4 text-sm font-semibold tracking-[0.18em] text-white disabled:bg-zinc-400" disabled={submitting} type="submit">
            <LockKeyhole size={18} />
            {submitting ? "建立訂單中..." : paymentMethod === "credit-card" ? "前往付款" : "確認下單"}
          </button>
          <p className="flex items-center justify-center gap-2 text-center text-xs text-crystal-muted">
            <LockKeyhole size={14} />
            綠界科技 SSL 加密保護，交易安全有保障
          </p>
        </div>

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
      </form>
    </section>
  );
}

function validateCheckoutCart(input: {
  expectedItemCount: number;
  latestLines: CartLine[];
  priceSnapshot: Record<string, number>;
  unavailableCount: number;
}) {
  if (!input.expectedItemCount) return "購物袋是空的";
  if (input.unavailableCount || input.latestLines.length !== input.expectedItemCount) {
    return "購物袋中有商品已不存在或已下架，請回到購物袋確認後再結帳。";
  }

  const unavailableLine = input.latestLines.find((line) => Boolean(getUnavailableProductMessage(line.product)));
  if (unavailableLine) {
    return getUnavailableProductMessage(unavailableLine.product);
  }

  const changedPriceLine = input.latestLines.find((line) => {
    const previousPrice = input.priceSnapshot[line.key];
    return previousPrice !== undefined && previousPrice !== line.product.price;
  });
  if (changedPriceLine) {
    return `商品「${changedPriceLine.product.name}」價格已更新，請確認訂單摘要後再送出。`;
  }

  return null;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-crystal-line pb-3">
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

function OptionCard({
  active,
  description,
  icon,
  onClick,
  title
}: {
  active: boolean;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      className={`flex min-h-24 items-center justify-between gap-4 border bg-white p-5 text-left transition ${
        active ? "border-crystal-ink ring-1 ring-crystal-ink" : "border-crystal-line hover:border-crystal-rose"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center gap-4">
        <span className="text-crystal-ink">{icon}</span>
        <span>
          <span className="block text-base font-semibold">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-crystal-muted">{description}</span>
        </span>
      </span>
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${active ? "border-crystal-ink" : "border-zinc-300"}`}>
        {active ? <span className="h-2.5 w-2.5 rounded-full bg-crystal-ink" /> : null}
      </span>
    </button>
  );
}
