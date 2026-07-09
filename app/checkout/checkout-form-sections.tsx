import Link from "next/link";
import { CreditCard, Home, LockKeyhole, MapPin, Store, Upload } from "lucide-react";
import { ReactNode } from "react";
import { bankTransferConfig, domesticShippingOptions, paymentOptions } from "@/config/checkout";
import type { DeliveryMethod, PaymentMethod } from "@/src/domain/checkout";
import { checkoutFieldClass, formatPrice } from "./checkout-format";

export function BuyerInfoSection({
  email,
  name,
  phone
}: {
  email: string;
  name: string;
  phone: string;
}) {
  return (
    <section>
      <SectionTitle title="購買人資訊" />
      <div className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-xs font-semibold">姓名 *</span>
          <input autoComplete="name" className={checkoutFieldClass} defaultValue={name} name="name" placeholder="請輸入真實姓名" required />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold">Email *</span>
          <input autoComplete="email" className={checkoutFieldClass} defaultValue={email} name="email" placeholder="訂單確認信將寄至此信箱" required type="email" />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold">手機號碼 *</span>
          <input autoComplete="tel" className={checkoutFieldClass} defaultValue={phone} inputMode="tel" name="phone" placeholder="09xxxxxxxx" required />
        </label>
      </div>
    </section>
  );
}

export function ShippingSection({
  cvsMapHref,
  shippingMethod,
  storeLabel,
  onShippingMethodChange
}: {
  cvsMapHref: string;
  shippingMethod: DeliveryMethod;
  storeLabel: string;
  onShippingMethodChange: (method: DeliveryMethod) => void;
}) {
  return (
    <section>
      <SectionTitle title="配送方式" />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <OptionCard
          active={shippingMethod === "black-cat"}
          description={`${domesticShippingOptions.blackCat.note} (${formatPrice(domesticShippingOptions.blackCat.fee)})`}
          icon={<Home size={24} />}
          title={domesticShippingOptions.blackCat.label}
          onClick={() => onShippingMethodChange("black-cat")}
        />
        <OptionCard
          active={shippingMethod === "711"}
          description={`${domesticShippingOptions.sevenEleven.note} (${formatPrice(domesticShippingOptions.sevenEleven.fee)})`}
          icon={<Store size={24} />}
          title={domesticShippingOptions.sevenEleven.label}
          onClick={() => onShippingMethodChange("711")}
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
  );
}

export function PaymentSection({
  grandTotal,
  paymentMethod,
  transferFileName,
  onPaymentMethodChange,
  onTransferFileNameChange
}: {
  grandTotal: number;
  paymentMethod: PaymentMethod;
  transferFileName: string;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onTransferFileNameChange: (fileName: string) => void;
}) {
  return (
    <section>
      <SectionTitle title="付款方式" />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <OptionCard
          active={paymentMethod === "credit-card"}
          description={paymentOptions.creditCard.note}
          icon={<CreditCard size={24} />}
          title={paymentOptions.creditCard.label}
          onClick={() => onPaymentMethodChange("credit-card")}
        />
        <OptionCard
          active={paymentMethod === "bank-transfer"}
          description={paymentOptions.bankTransfer.note}
          icon={<CreditCard size={24} />}
          title={paymentOptions.bankTransfer.label}
          onClick={() => onPaymentMethodChange("bank-transfer")}
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
                onChange={(event) => onTransferFileNameChange(event.target.files?.[0]?.name ?? "")}
                type="file"
              />
            </span>
          </label>
        </div>
      ) : null}
    </section>
  );
}

export function NoteField() {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold">備註</span>
      <textarea className={`${checkoutFieldClass} min-h-24`} name="note" placeholder="有任何希望我們留意的事項，可以寫在這裡" />
    </label>
  );
}

export function CheckoutError({ error }: { error: string | null }) {
  return error ? <p className="border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null;
}

export function SubmitOrderButton({ paymentMethod, submitting }: { paymentMethod: PaymentMethod; submitting: boolean }) {
  return (
    <>
      <button className="flex w-full items-center justify-center gap-2 bg-crystal-ink px-6 py-4 text-sm font-semibold tracking-[0.18em] text-white disabled:bg-zinc-400" disabled={submitting} type="submit">
        <LockKeyhole size={18} />
        {submitting ? "建立訂單中..." : paymentMethod === "credit-card" ? "前往付款" : "確認下單"}
      </button>
      <p className="flex items-center justify-center gap-2 text-center text-xs text-crystal-muted">
        <LockKeyhole size={14} />
        綠界科技 SSL 加密保護，交易安全有保障
      </p>
    </>
  );
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
  icon: ReactNode;
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
