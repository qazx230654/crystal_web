"use client";

import { useRouter } from "next/navigation";

export function ProductSortSelect({
  category,
  options,
  value
}: {
  category?: string;
  options: readonly string[];
  value: string;
}) {
  const router = useRouter();

  return (
    <select
      aria-label="商品排序"
      className="min-w-36 border border-crystal-gold/35 bg-white px-3 py-2 text-xs text-crystal-muted shadow-[0_10px_24px_rgba(90,65,55,0.05)] outline-crystal-gold"
      onChange={(event) => {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        params.set("sort", event.target.value);
        router.push(`/products?${params.toString()}`);
      }}
      value={value}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
