"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminApi } from "@/hooks/useAdminApi";
import { workshopExperiences } from "@/app/crystal-workshop/workshop-model";
import { getBookingStatus, getBookingStatusLabel } from "@/src/domain/booking";

type ExperienceSession = {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string | null;
  capacity: number;
  booked_count: number;
};

type Booking = {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_phone: string;
  headcount: number;
  booking_status: string;
};

const attendeeStatuses = new Set(["confirmed", "attended", "no_show"]);

export default function SessionAttendeesPage() {
  const params = useParams<{ experienceId: string; sessionId: string }>();
  const { experienceId, sessionId } = params;
  const experience = workshopExperiences.find((item) => item.id === experienceId);

  const adminApi = useAdminApi({ initialLoading: true, nextPath: `/admin/experiences/${experienceId}` });
  const [session, setSession] = useState<ExperienceSession | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  async function loadData() {
    const [sessionsPayload, bookingsPayload] = await Promise.all([
      adminApi.request<{ data: ExperienceSession[] }>(`/api/admin/experience-sessions?experienceId=${experienceId}`, undefined, {
        errorMessage: "無法讀取場次資料"
      }),
      adminApi.request<{ data: Booking[] }>(`/api/bookings?sessionId=${sessionId}`, undefined, {
        errorMessage: "無法讀取預約名單",
        loading: false
      })
    ]);

    if (sessionsPayload) setSession(sessionsPayload.data.find((item) => item.id === sessionId) ?? null);
    if (bookingsPayload) setBookings(bookingsPayload.data.filter((booking) => attendeeStatuses.has(getBookingStatus(booking))));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceId, sessionId]);

  async function markStatus(booking: Booking, action: "mark_attended" | "mark_no_show") {
    const payload = await adminApi.request<{ data: Booking }>(
      `/api/bookings/${booking.id}`,
      {
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      },
      { errorMessage: "更新狀態失敗", loading: false }
    );

    if (!payload) return;
    setBookings((current) => current.map((item) => (item.id === booking.id ? payload.data : item)));
  }

  const totalHeadcount = bookings.reduce((sum, booking) => sum + booking.headcount, 0);

  return (
    <section className="container-shell py-10">
      <Link className="text-xs text-crystal-muted" href={`/admin/experiences/${experienceId}`}>
        ← 返回場次列表
      </Link>
      <h1 className="mt-3 font-serif text-3xl font-semibold">{experience?.title ?? experienceId} 到場名單</h1>
      {session ? (
        <p className="mt-2 text-sm text-crystal-muted">
          {session.session_date} {session.start_time.slice(0, 5)}
          {session.end_time ? `-${session.end_time.slice(0, 5)}` : ""} ・ 已確認 {bookings.length} 組 / 共 {totalHeadcount} 人 / 上限 {session.capacity}
        </p>
      ) : null}

      {adminApi.error ? <p className="mt-6 border border-red-100 bg-red-50 p-4 text-sm text-red-700">{adminApi.error}</p> : null}

      <div className="mt-8 overflow-hidden rounded-md border border-crystal-line bg-white/72 shadow-soft">
        <div className="hidden grid-cols-[1fr_1fr_0.6fr_0.8fr_1fr] gap-3 border-b border-crystal-line px-5 py-3 text-xs font-bold tracking-[0.16em] text-crystal-muted lg:grid">
          <span>姓名</span>
          <span>電話</span>
          <span>人數</span>
          <span>狀態</span>
          <span>操作</span>
        </div>
        {adminApi.loading ? <p className="p-5 text-crystal-muted">讀取中...</p> : null}
        {!adminApi.loading && !bookings.length ? <p className="p-5 text-crystal-muted">目前沒有已確認的預約。</p> : null}
        {bookings.map((booking) => (
          <div className="grid gap-3 border-b border-crystal-line px-5 py-4 text-sm last:border-b-0 lg:grid-cols-[1fr_1fr_0.6fr_0.8fr_1fr] lg:items-center" key={booking.id}>
            <span className="font-medium">{booking.customer_name}</span>
            <span>{booking.customer_phone}</span>
            <span>{booking.headcount} 人</span>
            <span>{getBookingStatusLabel(getBookingStatus(booking))}</span>
            <div className="flex flex-wrap gap-2">
              <button
                className="border border-crystal-line bg-white px-3 py-1.5 text-xs font-semibold text-crystal-ink disabled:opacity-40"
                disabled={getBookingStatus(booking) !== "confirmed"}
                onClick={() => markStatus(booking, "mark_attended")}
                type="button"
              >
                簽到
              </button>
              <button
                className="border border-crystal-line bg-white px-3 py-1.5 text-xs font-semibold text-crystal-muted disabled:opacity-40"
                disabled={getBookingStatus(booking) !== "confirmed"}
                onClick={() => markStatus(booking, "mark_no_show")}
                type="button"
              >
                未到
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
