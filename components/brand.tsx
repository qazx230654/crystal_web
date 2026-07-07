import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Crystal 首頁">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-crystal-line bg-white/75 font-serif text-2xl text-crystal-rose shadow-glow">
        C
      </span>
      <span className="leading-none">
        <span className="block font-serif text-xl font-semibold tracking-normal text-crystal-ink">Crystal</span>
        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.24em] text-crystal-muted">
          Crystal Energy
        </span>
      </span>
    </Link>
  );
}
