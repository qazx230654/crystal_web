import Link from "next/link";
import { contactLinks } from "@/config/contact";
import { workshopExperiences } from "@/app/crystal-workshop/workshop-model";
import { getBookingById, getBookingStatus, getPaymentStatus, bookingStatusLabels, paymentStatusLabels } from "@/services/booking-service";

export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({ params }: { params: { id: string } }) {
  const result = await getBookingById(params.id);
  const booking = result.booking;

  if (!booking) {
    return (
      <section className="container-shell py-20">
        <h1 className="font-serif text-5xl font-semibold">找不到預約</h1>
        <Link className="mt-8 inline-flex rounded-full bg-crystal-ink px-6 py-3 text-sm font-semibold text-white" href="/crystal-workshop">
          返回體驗介紹
        </Link>
      </section>
    );
  }

  const experience = workshopExperiences.find((item) => item.id === booking.experience_id);

  return (
    <section className="container-shell py-14">
      <div className="rounded-md border border-crystal-line bg-white/72 p-8 text-center shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Booking Created</p>
        <h1 className="mt-3 font-serif text-5xl font-semibold">預約已建立</h1>
        <p className="mt-5 text-crystal-muted">請截圖保存預約編號，並加入官方 LINE 傳送預約編號與姓名，方便我們確認付款。</p>
        <p className="mt-6 text-sm text-crystal-muted">預約編號</p>
        <p className="mt-1 font-serif text-4xl font-semibold text-crystal-rose">{booking.booking_number}</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">預約明細</h2>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-crystal-muted">體驗</dt><dd>{experience?.title ?? booking.experience_id}</dd></div>
            <div className="flex justify-between"><dt className="text-crystal-muted">人數</dt><dd>{booking.headcount} 人</dd></div>
            <div className="flex justify-between"><dt className="text-crystal-muted">聯絡人</dt><dd>{booking.customer_name}</dd></div>
            <div className="flex justify-between"><dt className="text-crystal-muted">電話</dt><dd>{booking.customer_phone}</dd></div>
          </dl>
        </section>
        <aside className="rounded-md border border-crystal-line bg-white/72 p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">付款資訊</h2>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-crystal-muted">預約狀態</dt><dd>{bookingStatusLabels[getBookingStatus(booking)] ?? getBookingStatus(booking)}</dd></div>
            <div className="flex justify-between"><dt className="text-crystal-muted">付款狀態</dt><dd>{paymentStatusLabels[getPaymentStatus(booking)] ?? getPaymentStatus(booking)}</dd></div>
            <div className="flex justify-between"><dt className="text-crystal-muted">付款方式</dt><dd>{booking.payment_method}</dd></div>
            <div className="flex justify-between text-lg font-semibold"><dt>總計</dt><dd>NT$ {booking.total.toLocaleString()}</dd></div>
          </dl>
          <a className="mt-6 block rounded-full bg-crystal-ink px-5 py-3 text-center text-sm font-semibold text-white" href={contactLinks.line.href} rel="noreferrer" target="_blank">
            加入官方 LINE
          </a>
        </aside>
      </div>
    </section>
  );
}
