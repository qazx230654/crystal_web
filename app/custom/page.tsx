import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { customPlans } from "@/data/site";

const ritual = ["訴說願望與初衷", "靈數與頻率規劃", "設計初稿與對視", "淨化編織與送抵"];

export default function CustomPage() {
  return (
    <section className="container-shell py-14">
      <div className="rounded-md border border-crystal-line bg-white/62 p-8 shadow-soft md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-crystal-rose">Crystal</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-tight md:text-7xl">
          遇見您的
          <span className="block text-crystal-rose">專屬能量對話</span>
        </h1>
        <p className="mt-6 max-w-2xl leading-8 text-crystal-muted">
          店家透過不同維度的媒介，為您的當下狀態找尋最合適的礦石震動。
        </p>
      </div>

      <section className="py-16">
        <SectionHeading eyebrow="Professional Consultation" title="四大客製方案" body="先看重點與費用，訂購步驟與注意事項可於卡片內展開閱讀。" />
        <div className="grid gap-5 md:grid-cols-2">
          {customPlans.map((plan) => (
            <article className="rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft" key={plan.code}>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-crystal-ink font-serif text-xl text-white">{plan.code}</span>
              <h3 className="mt-5 text-2xl font-semibold">{plan.title}</h3>
              <p className="mt-3 font-medium text-crystal-rose">{plan.price}</p>
              <p className="mt-4 min-h-20 leading-7 text-crystal-muted">{plan.body}</p>
              <Link className="mt-6 inline-flex items-center gap-2 rounded-full bg-crystal-ink px-5 py-3 text-sm font-semibold text-white" href={plan.href}>
                填寫你的客製需求 <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="py-10">
        <SectionHeading title="手鍊誕生的儀式感" />
        <div className="grid gap-4 md:grid-cols-4">
          {ritual.map((item, index) => (
            <div className="rounded-md border border-crystal-line bg-white/70 p-5" key={item}>
              <p className="font-serif text-3xl text-crystal-rose">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-5 font-semibold">{item}</h3>
              <p className="mt-3 text-sm leading-7 text-crystal-muted">讓店家了解你的需求，經由能量規劃、設計確認與淨化包裝，完成專屬水晶。</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
