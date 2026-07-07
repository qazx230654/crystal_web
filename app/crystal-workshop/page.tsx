import Image from "next/image";
import { contactLinks } from "@/config/contact";

const syllabus = [
  ["2HR", "理論與知識／創業基礎", "基礎美學、金屬材質、常用配件與小資創業 SOP。"],
  ["3HR", "療癒手作時間（3件作品）", "手鍊、項鍊與吊飾實作，融合配色秘訣與打結手法。"],
  ["0.5HR", "喚醒與連結／淨化保養", "介紹淨化保養、如何喚醒手鍊與建立能量維護習慣。"]
];

export default function WorkshopPage() {
  return (
    <section className="container-shell py-14">
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-crystal-rose">Workshop & Course</p>
      <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-tight md:text-7xl">在頻率中，遇見更好的自己</h1>
      <p className="mt-6 max-w-2xl leading-8 text-crystal-muted">無論是想開啟一段療癒的時光，或是想將愛好轉化為事業，我們都為您準備了最細緻的引導。</p>
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="relative min-h-[420px] overflow-hidden rounded-md border border-crystal-line shadow-soft">
          <Image alt="小班制教學體驗" fill className="object-cover" src="https://goodaytarot.com/images/workshop-small-class.jpg" sizes="(min-width:1024px) 50vw, 100vw" />
        </div>
        <div className="rounded-md border border-crystal-line bg-white/72 p-8 shadow-soft">
          <h2 className="text-3xl font-semibold">水晶創業全能班</h2>
          <p className="mt-4 leading-8 text-crystal-muted">不只是手作，更是一套完整的創業思維。從水晶理論、基礎美學，到少見技術細節與小資創業 SOP 都完整分享。</p>
          <div className="mt-8 grid gap-4">
            {syllabus.map(([time, title, body]) => (
              <div className="rounded-md bg-crystal-pearl p-5" key={time}>
                <p className="font-serif text-3xl text-crystal-rose">{time}</p>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-crystal-muted">{body}</p>
              </div>
            ))}
          </div>
          <a className="mt-8 inline-flex rounded-full bg-crystal-ink px-6 py-3 text-sm font-semibold text-white" href={contactLinks.line.href} rel="noreferrer" target="_blank">
            聯繫 LINE 諮詢課程
          </a>
        </div>
      </div>
    </section>
  );
}
