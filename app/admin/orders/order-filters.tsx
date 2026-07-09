"use client";

import { adminOrderFilterTabs } from "@/src/domain/order";

export function OrderFilters({
  searchTerm,
  statusCounts,
  statusFilter,
  onSearchChange,
  onStatusChange
}: {
  searchTerm: string;
  statusCounts: Record<string, number>;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  return (
    <div className="mt-8 rounded-md border border-crystal-line bg-white/72 p-5 shadow-soft">
      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <label className="grid gap-2">
          <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">搜尋訂單</span>
          <input
            className="rounded-md border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="訂單編號、姓名、手機、Email"
            value={searchTerm}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-bold tracking-[0.16em] text-crystal-muted">狀態篩選</span>
          <select className="rounded-md border border-crystal-line bg-white px-4 py-3 text-sm outline-crystal-rose" onChange={(event) => onStatusChange(event.target.value)} value={statusFilter}>
            {adminOrderFilterTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}（{statusCounts[tab.id] ?? 0}）
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {adminOrderFilterTabs.map((tab) => (
          <button
            className={`border-b px-3 py-2 text-xs font-semibold transition ${statusFilter === tab.id ? "border-crystal-gold bg-crystal-champagne/35 text-crystal-muted" : "border-transparent bg-white text-crystal-muted hover:border-crystal-gold/60 hover:text-crystal-ink"}`}
            key={tab.id}
            onClick={() => onStatusChange(tab.id)}
            type="button"
          >
            {tab.label} {statusCounts[tab.id] ?? 0}
          </button>
        ))}
      </div>
    </div>
  );
}
