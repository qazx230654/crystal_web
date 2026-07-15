import Link from "next/link";
import { shopBrand } from "@/config/shop";

export function CheckoutLoadingState({ message }: { message: string }) {
  return (
    <section className="container-shell grid min-h-[60vh] place-items-center py-16 text-center text-sm text-crystal-muted">
      {message}
    </section>
  );
}

export function EmptyCartState() {
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

export function CheckoutModeGate({ onGuestCheckout }: { onGuestCheckout: () => void }) {
  return (
    <section className="container-shell grid min-h-[72vh] place-items-center py-12">
      <div className="w-full max-w-xl text-center">
        <Link className="font-serif text-3xl font-semibold tracking-[0.18em]" href="/">
          {shopBrand.name}
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.34em] text-crystal-muted">{shopBrand.tagline}</p>
        <div className="mt-10 border border-crystal-line bg-white p-10 text-left">
          <h1 className="text-3xl font-semibold">如何結帳</h1>
          <p className="mt-2 text-sm text-crystal-muted">選擇登入會員，或以訪客身分結帳。</p>
          <div className="mt-8 grid gap-5">
            <Link className="block bg-crystal-ink px-6 py-4 text-center text-sm font-semibold tracking-[0.18em] text-white" href="/login?next=/checkout">
              會員登入
            </Link>
            <p className="text-center text-sm text-crystal-muted">會員不定時有專屬優惠</p>
            <button className="border border-crystal-ink bg-white px-6 py-4 text-sm font-semibold tracking-[0.12em] text-crystal-ink" onClick={onGuestCheckout} type="button">
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
