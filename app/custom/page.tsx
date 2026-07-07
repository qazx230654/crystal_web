import Link from "next/link";
import { ArrowDown, ArrowRight, Gem, MessageCircle, Sparkles } from "lucide-react";
import { contactLinks } from "@/config/contact";
import { customPlans } from "@/data/site";

const primaryPlan = customPlans.find((plan) => plan.code === "A") ?? customPlans[0];

const serviceItems = [
  "可描述想靠近的能量、色系與配戴風格",
  "也能分享近期狀態，讓搭配方向更貼近您",
  "適合愛情、人際、財運、安定與自我照顧等需求",
  "初版設計可享一次免費微調"
];

const processSteps = [
  {
    number: "I",
    title: "整理心願輪廓",
    body: "透過表單寫下您的願望、困擾與偏好，讓設計師先理解這條手鍊要陪伴的方向。"
  },
  {
    number: "II",
    title: "選礦與能量配頻",
    body: "依照您的狀態與需求，挑選能互相呼應的礦石，建立更完整的能量組合。"
  },
  {
    number: "III",
    title: "初稿排列確認",
    body: "完成初步設計後提供照片確認，讓直覺、美感與需求在同一個畫面裡對齊。"
  },
  {
    number: "IV",
    title: "淨化後寄出祝福",
    body: "編織完成後進行淨化與包裝，讓手鍊帶著清透的狀態抵達您手中。"
  }
];

export default function CustomPage() {
  return (
    <section className="bg-[#fbf8f5] text-crystal-ink">
      <section className="relative grid min-h-[calc(100vh-112px)] place-items-center overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[min(78vw,760px)] -translate-x-1/2 rounded-full bg-[#eadfd8]/45 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.6em] text-[#a28773]">Crystal</p>
          <h1 className="mt-10 font-serif text-5xl font-light leading-[1.45] tracking-[0.16em] text-crystal-ink md:text-7xl">
            為此刻的您
            <span className="mt-3 block text-[#9d7d63]">編一段水晶頻率</span>
          </h1>
          <p className="mx-auto mt-12 max-w-xl text-sm leading-9 tracking-[0.16em] text-crystal-muted md:text-base">
            透過需求書寫、色系偏好與礦石搭配，讓一條手鍊回應您正在經歷的狀態。
          </p>
        </div>
        <Link className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[#c9b8ad]" href="#plans" aria-label="前往客製化方案">
          <ArrowDown size={19} />
        </Link>
      </section>

      <section className="container-shell py-20 md:py-28" id="plans">
        <div className="text-center">
          <div className="inline-flex items-center gap-4 text-[#d8beb3]">
            <Sparkles size={15} />
            <h2 className="font-serif text-3xl font-light tracking-[0.24em] text-crystal-ink md:text-4xl">一對一純客製手鍊</h2>
            <Sparkles size={15} />
          </div>
          <p className="mt-7 text-xs uppercase tracking-[0.46em] text-crystal-muted">Professional Consultation</p>
          <p className="mt-5 text-sm leading-8 text-crystal-muted">先從最核心的客製流程開始，讓需求、尺寸與風格都能被清楚記錄。</p>
        </div>

        <article className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-[32px] border border-white/80 bg-[#f4ecd8] p-6 shadow-[0_24px_80px_rgba(72,54,43,0.10)] md:p-10">
          <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[#f7efdc] px-6 py-12 text-center md:px-12">
            <span className="absolute right-8 top-8 font-serif text-[9rem] leading-none text-white/35 md:text-[12rem]">*</span>
            <div className="relative">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#e7d8c7] bg-white/88 text-[#9d7d63] shadow-sm">
                <Gem size={24} />
              </div>
              <h3 className="mt-9 font-serif text-3xl font-light tracking-[0.16em] md:text-4xl">{primaryPlan.title}</h3>
              <p className="mt-5 text-sm tracking-[0.18em] text-[#a28773]">費用</p>
              <p className="mt-3 text-crystal-muted">{primaryPlan.price}</p>
              <div className="mx-auto mt-10 h-px w-16 bg-[#d9c9bd]" />

              <div className="mx-auto mt-10 max-w-xl rounded-[22px] border border-white/70 bg-white/40 p-6 text-left md:p-8">
                <p className="text-center text-xs uppercase tracking-[0.34em] text-[#a28773]">可討論內容</p>
                <div className="mt-7 grid gap-5 text-base leading-8 text-crystal-muted">
                  {serviceItems.map((item) => (
                    <p className="border-l-4 border-[#eadbd2] pl-5" key={item}>
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mx-auto mt-10 h-px max-w-xl bg-[#d9c9bd]" />
              <Link className="mx-auto mt-8 inline-flex w-full max-w-xl items-center justify-center gap-3 bg-[#9d7d63] px-6 py-4 text-sm font-semibold tracking-[0.24em] text-white shadow-[0_12px_24px_rgba(112,82,62,0.18)] transition hover:bg-crystal-ink" href={primaryPlan.href}>
                開始書寫客製需求 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </article>
      </section>

      <section className="bg-white/72 py-24 md:py-32">
        <div className="container-shell">
          <div className="text-center">
            <Sparkles className="mx-auto text-[#dec8bf]" size={18} />
            <h2 className="mt-8 font-serif text-3xl font-light tracking-[0.22em] md:text-4xl">從願望到成品的步調</h2>
            <div className="mx-auto mt-6 h-px w-12 bg-[#d7c0b6]" />
          </div>

          <div className="relative mx-auto mt-20 grid max-w-5xl gap-y-16 md:grid-cols-2 md:gap-x-28 md:gap-y-24">
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-crystal-line md:block" />
            {processSteps.map((step, index) => (
              <div className={`${index % 2 === 0 ? "md:text-left" : "md:mt-24 md:text-left"} relative min-h-40`} key={step.number}>
                <span
                  className={`mb-8 grid h-12 w-12 place-items-center rounded-full border border-[#d8bfb4] bg-white font-serif text-sm text-[#9d7d63] shadow-sm md:absolute md:top-0 ${
                    index % 2 === 0 ? "md:right-[-4.5rem]" : "md:left-[-4.5rem]"
                  }`}
                >
                  {step.number}
                </span>
                <div className={index % 2 === 0 ? "md:pr-10" : "md:pl-10"}>
                  <h3 className="font-serif text-2xl font-light tracking-[0.12em]">{step.title}</h3>
                  <p className="mt-6 text-sm leading-8 text-crystal-muted">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid min-h-[520px] place-items-center border-t border-crystal-line bg-[#f6f1ee] px-6 py-24 text-center">
        <div>
          <Sparkles className="mx-auto text-[#dec8bf]" size={30} />
          <p className="mt-12 font-serif text-3xl font-light leading-relaxed tracking-[0.18em] text-[#9d7d63] md:text-4xl">
            讓日常，慢慢靠近更穩定的頻率
          </p>
          <a className="mx-auto mt-12 inline-flex items-center gap-3 rounded-full bg-[#9d7d63] px-10 py-5 text-sm font-semibold tracking-[0.18em] text-white shadow-[0_18px_46px_rgba(112,82,62,0.18)] transition hover:bg-crystal-ink" href={contactLinks.line.href} rel="noreferrer" target="_blank">
            聯繫 Crystal <MessageCircle size={17} />
          </a>
          <p className="mt-24 text-xs uppercase tracking-[0.54em] text-[#c4aea2]">Crystal</p>
        </div>
      </section>
    </section>
  );
}
