import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Crystal 首頁">
      <span className="grid h-10 w-10 place-items-center rounded-full border border-crystal-line bg-white/75 font-serif text-xl text-crystal-rose shadow-glow">
        C
      </span>
      <span className="leading-none">
        <span className="block font-serif text-lg font-medium tracking-[0.08em] text-crystal-ink">Crystal</span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.28em] text-crystal-muted">
          Crystal Energy
        </span>
      </span>
    </Link>
  );
}
