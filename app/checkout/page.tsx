"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { useCart } from "@/components/cart-context";
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
import { validateCheckoutCart } from "./checkout-cart-validation";
import {
  BuyerInfoSection,
  CheckoutError,
  NoteField,
  PaymentSection,
  ShippingSection,
  SubmitOrderButton
} from "./checkout-form-sections";
import { CheckoutLoadingState, CheckoutModeGate, EmptyCartState } from "./checkout-gate";
import { CheckoutSummary } from "./checkout-summary";

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
    return <CheckoutLoadingState message="正在確認購物袋內容..." />;
  }

  if (!items.length) {
    return <EmptyCartState />;
  }

  if (authLoading) {
    return <CheckoutLoadingState message="正在確認會員狀態..." />;
  }

  if (!shouldShowCheckoutForm) {
    return <CheckoutModeGate onGuestCheckout={() => setCheckoutMode("guest")} />;
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
          <BuyerInfoSection email={email} name={profile?.name ?? ""} phone={profile?.phone ?? ""} />
          <ShippingSection
            cvsMapHref={cvsMapHref}
            shippingMethod={shippingMethod}
            storeLabel={storeLabel}
            onShippingMethodChange={setShippingMethod}
          />
          <PaymentSection
            grandTotal={grandTotal}
            paymentMethod={paymentMethod}
            transferFileName={transferFileName}
            onPaymentMethodChange={setPaymentMethod}
            onTransferFileNameChange={setTransferFileName}
          />
          <NoteField />
          <CheckoutError error={error} />
          <SubmitOrderButton paymentMethod={paymentMethod} submitting={submitting} />
        </div>

        <CheckoutSummary grandTotal={grandTotal} lines={lines} shippingFee={shippingFee} total={total} />
      </form>
    </section>
  );
}
