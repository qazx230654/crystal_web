import Link from "next/link";
import { shopBrand } from "@/config/shop";

export function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={shopBrand.homeAriaLabel}>
      <span className="grid h-10 w-10 place-items-center rounded-full border border-crystal-line bg-white/75 font-serif text-xl text-crystal-rose shadow-glow">
        {shopBrand.logoMark}
      </span>
      <span className="leading-none">
        <span className="block font-serif text-lg font-medium tracking-[0.08em] text-crystal-ink">{shopBrand.name}</span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.28em] text-crystal-muted">
          {shopBrand.tagline}
        </span>
      </span>
    </Link>
  );
}
