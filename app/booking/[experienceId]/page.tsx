"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-context";
import { CalendarMonthGrid } from "@/components/calendar-month-grid";
import { workshopExperiences } from "@/app/crystal-workshop/workshop-model";
import { checkoutFieldClass, formatPrice } from "@/app/checkout/checkout-format";
import { BuyerInfoSection, CheckoutError, NoteField, PaymentSection } from "@/app/checkout/checkout-form-sections";
import type { PaymentMethod } from "@/src/domain/checkout";
import { BookingSummary } from "./booking-summary";

type ExperiencePlan = {
  id: string;
  name: string;
  description: string | null;
  pricePerPerson: number;
  minHeadcount: number;
  maxHeadcount: number | null;
};

type ExperienceSession = {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string | null;
  capacity: number;
  remaining: number;
};

export default function BookingPage() {
  const params = useParams<{ experienceId: string }>();
  const experienceId = params.experienceId;
  const experience = workshopExperiences.find((item) => item.id === experienceId);
  const router = useRouter();
  const { member } = useAuth();

  const [plans, setPlans] = useState<ExperiencePlan[]>([]);
  const [sessions, setSessions] = useState<ExperienceSession[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [headcount, setHeadcount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank-transfer");
  const [transferFileName, setTransferFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const today = useMemo(() => new Date(), []);
  const [calendarYear, setCalendarYear] = useState(today.getUTCFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getUTCMonth());

  useEffect(() => {
    if (!experienceId) return;

    fetch(`/api/experience-plans?experienceId=${experienceId}`)
      .then((res) => res.json())
      .then((payload) => setPlans(payload.data ?? []));

    fetch(`/api/experience-sessions?experienceId=${experienceId}`)
      .then((res) => res.json())
      .then((payload) => setSessions(payload.data ?? []));
  }, [experienceId]);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const remainingByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const session of sessions) {
      if (session.remaining <= 0) continue;
      map.set(session.sessionDate, (map.get(session.sessionDate) ?? 0) + session.remaining);
    }
    return map;
  }, [sessions]);
  const sessionsOnSelectedDate = sessions.filter((session) => session.sessionDate === selectedDate);
  const selectedSession = sessions.find((session) => session.id === selectedSessionId);

  const maxHeadcount = Math.min(selectedPlan?.maxHeadcount ?? Infinity, selectedSession?.remaining ?? Infinity);
  const total = (selectedPlan?.pricePerPerson ?? 0) * headcount;

  useEffect(() => {
    setHeadcount(selectedPlan?.minHeadcount ?? 1);
  }, [selectedPlan]);

  if (!experience) {
    notFound();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedPlan) {
      setError("請選擇方案");
      return;
    }
    if (!selectedSession) {
      setError("請選擇場次時間");
      return;
    }

    const formData = new FormData(event.currentTarget);
    setSubmitting(true);

    const response = await fetch("/api/bookings", {
      body: JSON.stringify({
        customer: {
          email: String(formData.get("email") ?? ""),
          name: String(formData.get("name") ?? ""),
          phone: String(formData.get("phone") ?? "")
        },
        experienceId,
        headcount,
        note: String(formData.get("note") ?? ""),
        paymentMethod,
        planId: selectedPlan.id,
        sessionId: selectedSession.id
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "預約建立失敗");
      return;
    }

    router.push(`/bookings/${payload.data.id}/success`);
  }

  return (
    <section className="container-shell py-10">
      <div className="mb-8 flex items-center gap-3 text-xs text-crystal-muted">
        <Link href="/crystal-workshop">← 返回體驗介紹</Link>
      </div>

      <form className="grid gap-8 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="space-y-8">
          <section>
            <div className="border-b border-crystal-line pb-3">
              <h1 className="font-serif text-3xl font-semibold">{experience.title}</h1>
            </div>
            {experience!.description ? <p className="mt-5 text-sm leading-7 text-crystal-muted">{experience!.description}</p> : null}
          </section>

          <section>
            <div className="border-b border-crystal-line pb-3">
              <h2 className="text-xl font-semibold">選擇方案</h2>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {plans.map((plan) => (
                <button
                  className={`border p-5 text-left transition ${selectedPlanId === plan.id ? "border-crystal-ink ring-1 ring-crystal-ink" : "border-crystal-line hover:border-crystal-rose"}`}
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  type="button"
                >
                  <span className="block font-semibold">{plan.name}</span>
                  {plan.description ? <span className="mt-1 block text-xs text-crystal-muted">{plan.description}</span> : null}
                  <span className="mt-2 block text-sm text-crystal-rose">{formatPrice(plan.pricePerPerson)} / 人</span>
                </button>
              ))}
              {!plans.length ? <p className="text-sm text-crystal-muted">目前尚未開放方案，請洽詢客服。</p> : null}
            </div>
          </section>

          <section>
            <div className="border-b border-crystal-line pb-3">
              <h2 className="text-xl font-semibold">選擇日期</h2>
            </div>
            <div className="mt-5 max-w-md">
              <CalendarMonthGrid
                isDateEnabled={(dateKey) => remainingByDate.has(dateKey)}
                month={calendarMonth}
                onMonthChange={(year, month) => {
                  setCalendarYear(year);
                  setCalendarMonth(month);
                }}
                onSelectDate={(dateKey) => {
                  setSelectedDate(dateKey);
                  setSelectedSessionId("");
                }}
                renderDayExtra={(dateKey) => `剩 ${remainingByDate.get(dateKey)}`}
                selectedDate={selectedDate}
                year={calendarYear}
              />
              {!remainingByDate.size ? <p className="mt-3 text-sm text-crystal-muted">目前沒有開放中的場次，請洽詢客服。</p> : null}
            </div>
          </section>

          {selectedDate ? (
            <section>
              <div className="border-b border-crystal-line pb-3">
                <h2 className="text-xl font-semibold">選擇場次時間</h2>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {sessionsOnSelectedDate.map((session) => (
                  <button
                    className={`border px-4 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${selectedSessionId === session.id ? "border-crystal-ink bg-crystal-ink text-white" : "border-crystal-line bg-white hover:border-crystal-rose"}`}
                    disabled={session.remaining <= 0}
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    type="button"
                  >
                    {session.startTime.slice(0, 5)}
                    {session.endTime ? `-${session.endTime.slice(0, 5)}` : ""} ・ 剩 {session.remaining} 位
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {selectedSession ? (
            <section>
              <div className="border-b border-crystal-line pb-3">
                <h2 className="text-xl font-semibold">選擇人數</h2>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <button
                  className="grid h-10 w-10 place-items-center border border-crystal-line bg-white disabled:opacity-40"
                  disabled={headcount <= (selectedPlan?.minHeadcount ?? 1)}
                  onClick={() => setHeadcount((current) => Math.max(selectedPlan?.minHeadcount ?? 1, current - 1))}
                  type="button"
                >
                  -
                </button>
                <span className="w-10 text-center text-lg font-semibold">{headcount}</span>
                <button
                  className="grid h-10 w-10 place-items-center border border-crystal-line bg-white disabled:opacity-40"
                  disabled={headcount >= maxHeadcount}
                  onClick={() => setHeadcount((current) => Math.min(maxHeadcount, current + 1))}
                  type="button"
                >
                  +
                </button>
                <span className="text-xs text-crystal-muted">此場次剩餘 {selectedSession.remaining} 位</span>
              </div>
            </section>
          ) : null}

          {selectedSession ? (
            <>
              <BuyerInfoSection email={member?.profile?.email ?? member?.user.email ?? ""} name={member?.profile?.name ?? ""} phone={member?.profile?.phone ?? ""} />
              <PaymentSection
                grandTotal={total}
                paymentMethod={paymentMethod}
                transferFileName={transferFileName}
                onPaymentMethodChange={setPaymentMethod}
                onTransferFileNameChange={setTransferFileName}
              />
              <NoteField />
            </>
          ) : null}

          <CheckoutError error={error} />

          {selectedSession ? (
            <button className="flex w-full items-center justify-center gap-2 bg-crystal-ink px-6 py-4 text-sm font-semibold tracking-[0.18em] text-white disabled:bg-zinc-400" disabled={submitting} type="submit">
              {submitting ? "建立預約中..." : "確認預約"}
            </button>
          ) : null}
        </div>

        <BookingSummary
          date={selectedSession?.sessionDate ?? ""}
          experienceTitle={experience!.title}
          headcount={headcount}
          planName={selectedPlan?.name ?? ""}
          pricePerPerson={selectedPlan?.pricePerPerson ?? 0}
          startTime={selectedSession?.startTime.slice(0, 5) ?? ""}
          total={total}
        />
      </form>
    </section>
  );
}
