"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminApi } from "@/hooks/useAdminApi";
import { workshopExperiences } from "@/app/crystal-workshop/workshop-model";
import {
  adminBookingFilterTabs,
  bookingEventTypeLabels,
  getAvailableAdminBookingActions,
  getBookingStatus,
  getBookingStatusLabel,
  matchesAdminBookingFilter
} from "@/src/domain/booking";
import { getPaymentStatus, getPaymentStatusLabel } from "@/src/domain/payment";

type Booking = {
  id: string;
  booking_number: string;
  experience_id: string;
  plan_id: string;
  session_id: string;
  headcount: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  line_id: string | null;
  note: string | null;
  payment_method: string;
  total: number;
  user_id: string | null;
  created_at: string;
  booking_status: string;
  payment_status: string;
};

type BookingEvent = {
  id: string;
  type: string;
  message: string | null;
  created_at: string;
};

type PlanInfo = {
  name: string;
};

type SessionInfo = {
  session_date: string;
  start_time: string;
  end_time: string | null;
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const adminApi = useAdminApi({ initialLoading: true, nextPath: "/admin/bookings" });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, BookingEvent[]>>({});
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null);
  const [planInfo, setPlanInfo] = useState<Record<string, PlanInfo>>({});
  const [sessionInfo, setSessionInfo] = useState<Record<string, SessionInfo>>({});
  const [fetchedExperienceSessions, setFetchedExperienceSessions] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const visibleBookings = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = matchesAdminBookingFilter(booking, statusFilter);
      const matchesKeyword =
        !keyword ||
        [booking.booking_number, booking.customer_name, booking.customer_phone].some((value) =>
          String(value ?? "").toLowerCase().includes(keyword)
        );

      return matchesStatus && matchesKeyword;
    });
  }, [bookings, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    return bookings.reduce<Record<string, number>>(
      (counts, booking) => {
        adminBookingFilterTabs.forEach((tab) => {
          if (matchesAdminBookingFilter(booking, tab.id)) {
            counts[tab.id] = (counts[tab.id] ?? 0) + 1;
          }
        });
        return counts;
      },
      { all: 0 }
    );
  }, [bookings]);

  async function loadBookings() {
    const payload = await adminApi.request<{ data: Booking[] }>("/api/bookings", undefined, {
      errorMessage: "無法讀取預約資料"
    });

    if (!payload) return;
    setBookings(payload.data);
  }

  async function runBookingAction(booking: Booking, action: string) {
    let message = "";
    if (action === "cancel_booking") {
      const reason = window.prompt("請輸入取消原因");
      if (!reason?.trim()) return;
      message = reason.trim();
    }
    if (action === "refund_booking") {
      const reason = window.prompt("請輸入退款原因或備註");
      if (reason === null) return;
      message = reason.trim();
    }

    const payload = await adminApi.request<{ data: Booking }>(
      `/api/bookings/${booking.id}`,
      {
        body: JSON.stringify({ action, message }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      },
      { errorMessage: "預約操作失敗", loading: false }
    );

    if (!payload) return;

    setEvents((current) => {
      const next = { ...current };
      delete next[booking.id];
      return next;
    });
    loadBookings();
  }

  async function toggleDetails(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);

    const booking = bookings.find((item) => item.id === id);

    if (!events[id]) {
      setDetailsLoading(id);
      const payload = await adminApi.request<{ data: { events: BookingEvent[] } }>(`/api/bookings/${id}`, undefined, {
        errorMessage: "無法讀取預約明細",
        loading: false
      });
      setDetailsLoading(null);

      if (payload) setEvents((current) => ({ ...current, [id]: payload.data.events }));
    }

    if (booking && !planInfo[booking.plan_id]) {
      const planPayload = await adminApi.request<{ data: PlanInfo }>(`/api/admin/experience-plans/${booking.plan_id}`, undefined, {
        errorMessage: "無法讀取方案資料",
        loading: false
      });
      if (planPayload) setPlanInfo((current) => ({ ...current, [booking.plan_id]: planPayload.data }));
    }

    if (booking && !sessionInfo[booking.session_id] && !fetchedExperienceSessions[booking.experience_id]) {
      const sessionPayload = await adminApi.request<{ data: Array<SessionInfo & { id: string }> }>(
        `/api/admin/experience-sessions?experienceId=${booking.experience_id}`,
        undefined,
        { errorMessage: "無法讀取場次資料", loading: false }
      );
      if (sessionPayload) {
        setFetchedExperienceSessions((current) => ({ ...current, [booking.experience_id]: true }));
        setSessionInfo((current) => {
          const next = { ...current };
          sessionPayload.data.forEach((session) => {
            next[session.id] = session;
          });
          return next;
        });
      }
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="container-shell py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Admin</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold">預約管理</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/dashboard">後台總覽</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/experiences">體驗管理</Link>
          </Button>
          <Button onClick={logout} size="sm" type="button" variant="outline">
            登出
          </Button>
        </div>
      </div>

      {adminApi.error ? <p className="mt-6 border border-red-100 bg-red-50 p-4 text-sm text-red-700">{adminApi.error}</p> : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          className="w-full max-w-xs border border-crystal-line bg-white p-3 text-sm"
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="搜尋預約編號、姓名、電話"
          value={searchTerm}
        />
        <div className="flex flex-wrap gap-2">
          {adminBookingFilterTabs.map((tab) => (
            <button
              className={`border px-3 py-1.5 text-xs font-semibold transition ${statusFilter === tab.id ? "border-crystal-ink bg-crystal-ink text-white" : "border-crystal-line bg-white text-crystal-muted"}`}
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              type="button"
            >
              {tab.label} {statusCounts[tab.id] ? `(${statusCounts[tab.id]})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-crystal-line bg-white/72 shadow-soft">
        {adminApi.loading ? <p className="p-5 text-crystal-muted">讀取中...</p> : null}
        {!adminApi.loading && !visibleBookings.length ? <p className="p-5 text-crystal-muted">沒有符合條件的預約。</p> : null}
        {visibleBookings.map((booking) => {
          const experience = workshopExperiences.find((item) => item.id === booking.experience_id);
          const actions = getAvailableAdminBookingActions(booking);
          const expanded = expandedId === booking.id;

          return (
            <div className="border-b border-crystal-line" key={booking.id}>
              <div className="grid gap-3 px-5 py-4 text-sm lg:grid-cols-[1fr_0.9fr_0.7fr_0.8fr_1.2fr_44px] lg:items-center">
                <div>
                  <p className="font-semibold">{booking.booking_number}</p>
                  <p className="text-xs text-crystal-muted">{experience?.title ?? booking.experience_id}</p>
                </div>
                <div>
                  <p>{booking.customer_name}</p>
                  <p className="text-xs text-crystal-muted">{booking.customer_phone}</p>
                </div>
                <div>
                  <p className="font-semibold">NT$ {booking.total.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-crystal-muted">{booking.headcount} 人</p>
                </div>
                <div className="grid gap-1 text-xs">
                  <span>{getBookingStatusLabel(getBookingStatus(booking))}</span>
                  <span>{getPaymentStatusLabel(getPaymentStatus(booking))}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {actions.map((action) => (
                    <button
                      className={`inline-flex h-8 min-w-[92px] items-center justify-center border px-3 text-center text-[11px] font-semibold tracking-[0.04em] transition ${
                        action.tone === "danger"
                          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          : action.tone === "primary"
                            ? "border-crystal-gold/45 bg-crystal-champagne/35 text-crystal-ink hover:bg-crystal-champagne/55"
                            : "border-crystal-line bg-white text-crystal-muted hover:border-crystal-gold hover:text-crystal-ink"
                      }`}
                      key={action.id}
                      onClick={() => runBookingAction(booking, action.id)}
                      type="button"
                    >
                      {action.label}
                    </button>
                  ))}
                  {!actions.length ? <span className="text-xs text-crystal-muted">無可用操作</span> : null}
                </div>
                <div className="flex items-center justify-end">
                  <button
                    aria-label={expanded ? "收合明細" : "展開明細"}
                    className="grid size-9 place-items-center rounded-full text-crystal-muted transition hover:bg-crystal-champagne/25"
                    onClick={() => toggleDetails(booking.id)}
                    type="button"
                  >
                    <ChevronDown className={`transition ${expanded ? "rotate-180" : ""}`} size={14} />
                  </button>
                </div>
              </div>
              {expanded ? (
                <div className="grid gap-6 border-t border-crystal-line bg-crystal-pearl/30 px-5 py-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-crystal-muted">預約明細</p>
                    <dl className="grid gap-2">
                      <div className="flex justify-between gap-4">
                        <dt className="text-crystal-muted">方案</dt>
                        <dd>{planInfo[booking.plan_id]?.name ?? "讀取中..."}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-crystal-muted">日期時間</dt>
                        <dd>
                          {sessionInfo[booking.session_id]
                            ? `${sessionInfo[booking.session_id].session_date} ${sessionInfo[booking.session_id].start_time.slice(0, 5)}${
                                sessionInfo[booking.session_id].end_time ? `-${sessionInfo[booking.session_id].end_time!.slice(0, 5)}` : ""
                              }`
                            : "讀取中..."}
                        </dd>
                      </div>
                      {booking.customer_email ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-crystal-muted">Email</dt>
                          <dd>{booking.customer_email}</dd>
                        </div>
                      ) : null}
                      {booking.line_id ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-crystal-muted">LINE</dt>
                          <dd>{booking.line_id}</dd>
                        </div>
                      ) : null}
                      {booking.note ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-crystal-muted">備註</dt>
                          <dd className="text-right">{booking.note}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-crystal-muted">狀態時間軸</p>
                    {detailsLoading === booking.id ? <p className="text-crystal-muted">讀取中...</p> : null}
                    {events[booking.id]?.length
                      ? events[booking.id].map((event) => (
                          <div className="flex justify-between gap-4 border-b border-crystal-line/60 py-2 last:border-b-0" key={event.id}>
                            <span>{bookingEventTypeLabels[event.type] ?? event.type}：{event.message}</span>
                            <span className="text-xs text-crystal-muted">{new Date(event.created_at).toLocaleString("zh-TW")}</span>
                          </div>
                        ))
                      : null}
                    {events[booking.id] && !events[booking.id].length ? <p className="text-crystal-muted">尚無紀錄</p> : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
