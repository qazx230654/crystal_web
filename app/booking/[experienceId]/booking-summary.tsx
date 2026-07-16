import { formatPrice } from "@/app/checkout/checkout-format";

export function BookingSummary({
  date,
  experienceTitle,
  headcount,
  planName,
  pricePerPerson,
  startTime,
  total
}: {
  date: string;
  experienceTitle: string;
  headcount: number;
  planName: string;
  pricePerPerson: number;
  startTime: string;
  total: number;
}) {
  return (
    <aside className="h-fit rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft lg:sticky lg:top-24">
      <h2 className="text-xl font-semibold">預約摘要</h2>
      <dl className="mt-5 grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-crystal-muted">體驗</dt>
          <dd className="text-right font-medium">{experienceTitle}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-crystal-muted">方案</dt>
          <dd className="text-right font-medium">{planName || "-"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-crystal-muted">日期時間</dt>
          <dd className="text-right font-medium">{date ? `${date} ${startTime}` : "-"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-crystal-muted">人數</dt>
          <dd className="text-right font-medium">{headcount} 人</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-crystal-muted">每人價格</dt>
          <dd className="text-right font-medium">{formatPrice(pricePerPerson)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-crystal-line pt-3 text-lg font-semibold">
          <dt>總計</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
    </aside>
  );
}
