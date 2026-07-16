"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalendarMonthGrid } from "@/components/calendar-month-grid";
import { useAdminApi } from "@/hooks/useAdminApi";
import { workshopExperiences } from "@/app/crystal-workshop/workshop-model";

type ExperiencePlan = {
  id: string;
  experience_id: string;
  name: string;
  description: string | null;
  price_per_person: number;
  min_headcount: number;
  max_headcount: number | null;
  is_active: boolean;
};

type ExperienceSession = {
  id: string;
  experience_id: string;
  session_date: string;
  start_time: string;
  end_time: string | null;
  capacity: number;
  booked_count: number;
  status: string;
};

const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];

export default function AdminExperienceDetailPage() {
  const params = useParams<{ experienceId: string }>();
  const experienceId = params.experienceId;
  const experience = workshopExperiences.find((item) => item.id === experienceId);

  const adminApi = useAdminApi({ initialLoading: true, nextPath: `/admin/experiences/${experienceId}` });
  const [plans, setPlans] = useState<ExperiencePlan[]>([]);
  const [sessions, setSessions] = useState<ExperienceSession[]>([]);

  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planMinHeadcount, setPlanMinHeadcount] = useState("1");
  const [planMaxHeadcount, setPlanMaxHeadcount] = useState("");

  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [timeSlots, setTimeSlots] = useState([{ startTime: "14:00", endTime: "", capacity: "4" }]);

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ sessionDate: "", startTime: "", endTime: "", capacity: "" });

  const today = useMemo(() => new Date(), []);
  const [calendarYear, setCalendarYear] = useState(today.getUTCFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getUTCMonth());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState("");

  async function loadData() {
    const [planPayload, sessionPayload] = await Promise.all([
      adminApi.request<{ data: ExperiencePlan[] }>(`/api/admin/experience-plans?experienceId=${experienceId}`, undefined, {
        errorMessage: "無法讀取方案資料"
      }),
      adminApi.request<{ data: ExperienceSession[] }>(`/api/admin/experience-sessions?experienceId=${experienceId}`, undefined, {
        errorMessage: "無法讀取場次資料",
        loading: false
      })
    ]);

    if (planPayload) setPlans(planPayload.data);
    if (sessionPayload) setSessions(sessionPayload.data);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceId]);

  async function createPlan() {
    const payload = await adminApi.request<{ data: ExperiencePlan }>(
      "/api/admin/experience-plans",
      {
        body: JSON.stringify({
          experienceId,
          maxHeadcount: planMaxHeadcount ? Number(planMaxHeadcount) : null,
          minHeadcount: Number(planMinHeadcount) || 1,
          name: planName,
          pricePerPerson: Number(planPrice)
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      },
      { errorMessage: "新增方案失敗", loading: false, successMessage: "已新增方案" }
    );

    if (!payload) return;
    setPlans((current) => [...current, payload.data]);
    setPlanName("");
    setPlanPrice("");
    setPlanMinHeadcount("1");
    setPlanMaxHeadcount("");
  }

  async function togglePlanActive(plan: ExperiencePlan) {
    const payload = await adminApi.request<{ data: ExperiencePlan }>(
      `/api/admin/experience-plans/${plan.id}`,
      {
        body: JSON.stringify({ isActive: !plan.is_active }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      },
      { errorMessage: "更新方案狀態失敗", loading: false }
    );

    if (!payload) return;
    setPlans((current) => current.map((item) => (item.id === plan.id ? payload.data : item)));
  }

  function toggleWeekday(day: number) {
    setSelectedWeekdays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]));
  }

  function addTimeSlot() {
    setTimeSlots((current) => [...current, { startTime: "14:00", endTime: "", capacity: "4" }]);
  }

  function removeTimeSlot(index: number) {
    setTimeSlots((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateTimeSlot(index: number, patch: Partial<{ startTime: string; endTime: string; capacity: string }>) {
    setTimeSlots((current) => current.map((slot, itemIndex) => (itemIndex === index ? { ...slot, ...patch } : slot)));
  }

  function buildSessionDates() {
    if (!rangeStart || !rangeEnd || !selectedWeekdays.length) return [];

    const dates: string[] = [];
    const cursor = new Date(`${rangeStart}T00:00:00Z`);
    const end = new Date(`${rangeEnd}T00:00:00Z`);

    while (cursor <= end) {
      if (selectedWeekdays.includes(cursor.getUTCDay())) {
        dates.push(cursor.toISOString().slice(0, 10));
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return dates;
  }

  async function createSessions() {
    const dates = buildSessionDates();
    if (!dates.length) {
      adminApi.setError("請選擇日期區間與至少一個星期");
      return;
    }
    if (!timeSlots.length) {
      adminApi.setError("請至少新增一個時段");
      return;
    }

    const sessionsToCreate = dates.flatMap((sessionDate) =>
      timeSlots.map((slot) => ({
        capacity: Number(slot.capacity),
        endTime: slot.endTime || null,
        experienceId,
        sessionDate,
        startTime: slot.startTime
      }))
    );

    const payload = await adminApi.request<{ data: ExperienceSession[] }>(
      "/api/admin/experience-sessions",
      {
        body: JSON.stringify({ sessions: sessionsToCreate }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      },
      { errorMessage: "新增場次失敗", loading: false, successMessage: `已開放 ${sessionsToCreate.length} 個場次` }
    );

    if (!payload) return;
    setSessions((current) => [...current, ...payload.data].sort((a, b) => a.session_date.localeCompare(b.session_date) || a.start_time.localeCompare(b.start_time)));
  }

  async function closeSession(session: ExperienceSession) {
    const payload = await adminApi.request<{ data: ExperienceSession }>(
      `/api/admin/experience-sessions/${session.id}`,
      {
        body: JSON.stringify({ status: session.status === "closed" ? "open" : "closed" }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      },
      { errorMessage: "更新場次狀態失敗", loading: false }
    );

    if (!payload) return;
    setSessions((current) => current.map((item) => (item.id === session.id ? payload.data : item)));
  }

  async function cancelSession(session: ExperienceSession) {
    if (session.booked_count > 0) {
      adminApi.setError("此場次已有預約，請先取消或退款相關預約後再取消場次");
      return;
    }
    if (!window.confirm(`確定要取消「${session.session_date} ${session.start_time.slice(0, 5)}」這個場次嗎？`)) return;

    const payload = await adminApi.request<{ data: ExperienceSession }>(
      `/api/admin/experience-sessions/${session.id}`,
      {
        body: JSON.stringify({ status: "cancelled" }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      },
      { errorMessage: "取消場次失敗", loading: false, successMessage: "已取消場次" }
    );

    if (!payload) return;
    setSessions((current) => current.map((item) => (item.id === session.id ? payload.data : item)));
  }

  function startEditSession(session: ExperienceSession) {
    setEditingSessionId(session.id);
    setEditForm({
      capacity: String(session.capacity),
      endTime: session.end_time?.slice(0, 5) ?? "",
      sessionDate: session.session_date,
      startTime: session.start_time.slice(0, 5)
    });
  }

  async function saveSessionEdit(session: ExperienceSession) {
    const payload = await adminApi.request<{ data: ExperienceSession }>(
      `/api/admin/experience-sessions/${session.id}`,
      {
        body: JSON.stringify({
          capacity: Number(editForm.capacity),
          endTime: editForm.endTime || null,
          sessionDate: editForm.sessionDate,
          startTime: editForm.startTime
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      },
      { errorMessage: "更新場次失敗", loading: false, successMessage: "已更新場次" }
    );

    if (!payload) return;
    setSessions((current) => current.map((item) => (item.id === session.id ? payload.data : item)));
    setEditingSessionId(null);
  }

  const sessionsByDate = useMemo(() => {
    const groups = new Map<string, ExperienceSession[]>();
    for (const session of sessions) {
      const list = groups.get(session.session_date) ?? [];
      list.push(session);
      groups.set(session.session_date, list);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dateSessions]) => ({
        date,
        sessions: dateSessions.sort((a, b) => a.start_time.localeCompare(b.start_time))
      }));
  }, [sessions]);

  useEffect(() => {
    if (selectedCalendarDate || !sessionsByDate.length) return;

    const firstDate = sessionsByDate[0].date;
    setSelectedCalendarDate(firstDate);
    const [year, month] = firstDate.split("-").map(Number);
    setCalendarYear(year);
    setCalendarMonth(month - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionsByDate]);

  const selectedDateGroup = sessionsByDate.find((group) => group.date === selectedCalendarDate);

  if (!experience) {
    return (
      <section className="container-shell py-10">
        <p className="text-crystal-muted">找不到這個體驗項目。</p>
        <Link className="mt-4 inline-block text-sm text-crystal-rose" href="/admin/experiences">
          返回體驗列表
        </Link>
      </section>
    );
  }

  return (
    <section className="container-shell py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="text-xs text-crystal-muted" href="/admin/experiences">
            ← 返回體驗列表
          </Link>
          <h1 className="mt-3 font-serif text-3xl font-semibold">{experience.title}</h1>
        </div>
      </div>

      {adminApi.error ? <p className="mt-6 border border-red-100 bg-red-50 p-4 text-sm text-red-700">{adminApi.error}</p> : null}
      {adminApi.toast ? <p className="mt-6 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{adminApi.toast}</p> : null}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">價格方案</h2>
        <div className="mt-4 grid gap-3 rounded-md border border-crystal-line bg-crystal-pearl/40 p-5 md:grid-cols-2">
          <input
            className="border border-crystal-line bg-white p-3 text-sm"
            onChange={(event) => setPlanName(event.target.value)}
            placeholder="方案名稱，例如：標準方案"
            value={planName}
          />
          <input
            className="border border-crystal-line bg-white p-3 text-sm"
            onChange={(event) => setPlanPrice(event.target.value)}
            placeholder="每人價格"
            type="number"
            value={planPrice}
          />
          <input
            className="border border-crystal-line bg-white p-3 text-sm"
            onChange={(event) => setPlanMinHeadcount(event.target.value)}
            placeholder="最少人數"
            type="number"
            value={planMinHeadcount}
          />
          <input
            className="border border-crystal-line bg-white p-3 text-sm"
            onChange={(event) => setPlanMaxHeadcount(event.target.value)}
            placeholder="最多人數（留空不限）"
            type="number"
            value={planMaxHeadcount}
          />
          <Button className="justify-self-start md:col-span-2" onClick={createPlan} size="sm" type="button">
            新增方案
          </Button>
        </div>

        <div className="mt-4 grid gap-3">
          {plans.map((plan) => (
            <div className="flex items-center justify-between gap-3 rounded-md border border-crystal-line bg-white/70 p-4" key={plan.id}>
              <div>
                <p className="font-medium">{plan.name}</p>
                <p className="mt-1 text-sm text-crystal-muted">
                  NT$ {plan.price_per_person.toLocaleString()} / 人 ・ {plan.min_headcount}
                  {plan.max_headcount ? `-${plan.max_headcount}` : "+"} 人
                </p>
              </div>
              <Button onClick={() => togglePlanActive(plan)} size="sm" type="button" variant="outline">
                {plan.is_active ? "下架" : "上架"}
              </Button>
            </div>
          ))}
          {!plans.length ? <p className="text-sm text-crystal-muted">尚未新增方案</p> : null}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">開放預約場次</h2>

        <div className="mt-4 grid gap-3 rounded-md border border-crystal-line bg-crystal-pearl/40 p-5">
          <p className="font-semibold">設定開放預約的日期</p>
          <div className="flex gap-3">
            <input
              className="w-full border border-crystal-line bg-white p-3 text-sm"
              onChange={(event) => setRangeStart(event.target.value)}
              type="date"
              value={rangeStart}
            />
            <input
              className="w-full border border-crystal-line bg-white p-3 text-sm"
              onChange={(event) => setRangeEnd(event.target.value)}
              type="date"
              value={rangeEnd}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {weekdayLabels.map((label, day) => (
              <button
                className={`h-9 w-9 rounded-full border text-sm ${selectedWeekdays.includes(day) ? "border-crystal-ink bg-crystal-ink text-white" : "border-crystal-line bg-white"}`}
                key={label}
                onClick={() => toggleWeekday(day)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            <p className="text-xs text-crystal-muted">時段（可新增多組，同一批日期會一次開放所有時段）</p>
            {timeSlots.map((slot, index) => (
              <div className="flex items-center gap-2" key={index}>
                <input
                  className="w-full border border-crystal-line bg-white p-3 text-sm"
                  onChange={(event) => updateTimeSlot(index, { startTime: event.target.value })}
                  type="time"
                  value={slot.startTime}
                />
                <input
                  className="w-full border border-crystal-line bg-white p-3 text-sm"
                  onChange={(event) => updateTimeSlot(index, { endTime: event.target.value })}
                  placeholder="結束時間（選填）"
                  type="time"
                  value={slot.endTime}
                />
                <input
                  className="w-32 shrink-0 border border-crystal-line bg-white p-3 text-sm"
                  onChange={(event) => updateTimeSlot(index, { capacity: event.target.value })}
                  placeholder="名額上限"
                  type="number"
                  value={slot.capacity}
                />
                <button
                  className="shrink-0 px-2 text-sm text-crystal-muted disabled:opacity-30"
                  disabled={timeSlots.length <= 1}
                  onClick={() => removeTimeSlot(index)}
                  type="button"
                >
                  移除
                </button>
              </div>
            ))}
            <button className="justify-self-start text-sm text-crystal-rose" onClick={addTimeSlot} type="button">
              + 新增時段
            </button>
          </div>
          <Button className="justify-self-start" onClick={createSessions} size="sm" type="button">
            批次開放場次
          </Button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <CalendarMonthGrid
            isDateEnabled={(dateKey) => sessionsByDate.some((group) => group.date === dateKey)}
            month={calendarMonth}
            onMonthChange={(year, month) => {
              setCalendarYear(year);
              setCalendarMonth(month);
            }}
            onSelectDate={setSelectedCalendarDate}
            renderDayExtra={(dateKey) => {
              const group = sessionsByDate.find((item) => item.date === dateKey);
              return group ? `${group.sessions.length} 場` : null;
            }}
            selectedDate={selectedCalendarDate}
            year={calendarYear}
          />

          <div>
            {!selectedDateGroup ? (
              <p className="rounded-md border border-crystal-line bg-white/70 p-5 text-sm text-crystal-muted">
                {sessionsByDate.length ? "請從左側日曆選擇日期查看當日場次" : "尚未開放任何場次"}
              </p>
            ) : (
              <div className="rounded-md border border-crystal-line bg-white/70">
                <div className="flex items-center justify-between gap-3 border-b border-crystal-line bg-crystal-pearl/40 px-3 py-2">
                  <p className="text-sm font-semibold">{selectedDateGroup.date}</p>
                  <p className="text-xs text-crystal-muted">
                    共 {selectedDateGroup.sessions.length} 場次 ・ 已預約{" "}
                    {selectedDateGroup.sessions.reduce((sum, item) => sum + item.booked_count, 0)} /{" "}
                    {selectedDateGroup.sessions.reduce((sum, item) => sum + item.capacity, 0)} 人
                  </p>
                </div>
                <div className="grid gap-2 p-3">
                  {selectedDateGroup.sessions.map((session) =>
                    editingSessionId === session.id ? (
                      <div className="grid gap-2 rounded-md border border-crystal-ink/40 bg-crystal-pearl/30 p-3 text-sm" key={session.id}>
                        <div className="flex gap-2">
                          <input
                            className="w-full border border-crystal-line bg-white p-2 text-sm"
                            onChange={(event) => setEditForm((current) => ({ ...current, sessionDate: event.target.value }))}
                            type="date"
                            value={editForm.sessionDate}
                          />
                          <input
                            className="w-full border border-crystal-line bg-white p-2 text-sm"
                            onChange={(event) => setEditForm((current) => ({ ...current, startTime: event.target.value }))}
                            type="time"
                            value={editForm.startTime}
                          />
                          <input
                            className="w-full border border-crystal-line bg-white p-2 text-sm"
                            onChange={(event) => setEditForm((current) => ({ ...current, endTime: event.target.value }))}
                            placeholder="結束時間"
                            type="time"
                            value={editForm.endTime}
                          />
                          <input
                            className="w-24 shrink-0 border border-crystal-line bg-white p-2 text-sm"
                            onChange={(event) => setEditForm((current) => ({ ...current, capacity: event.target.value }))}
                            placeholder="名額"
                            type="number"
                            value={editForm.capacity}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => saveSessionEdit(session)} size="sm" type="button">
                            儲存
                          </Button>
                          <Button onClick={() => setEditingSessionId(null)} size="sm" type="button" variant="outline">
                            取消編輯
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 rounded-md border border-crystal-line/60 bg-white p-3 text-sm" key={session.id}>
                        <div>
                          <p className="font-medium">
                            {session.start_time.slice(0, 5)}
                            {session.end_time ? `-${session.end_time.slice(0, 5)}` : ""}
                          </p>
                          <p className="mt-1 text-crystal-muted">
                            已預約 {session.booked_count} / {session.capacity} 人 ・ {session.status === "open" ? "開放中" : session.status === "closed" ? "已關閉" : "已取消"}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/experiences/${experienceId}/sessions/${session.id}/attendees`}>查看名單</Link>
                          </Button>
                          {session.status !== "cancelled" ? (
                            <>
                              <Button onClick={() => startEditSession(session)} size="sm" type="button" variant="outline">
                                編輯
                              </Button>
                              <Button onClick={() => closeSession(session)} size="sm" type="button" variant="outline">
                                {session.status === "closed" ? "重新開放" : "關閉場次"}
                              </Button>
                              <Button onClick={() => cancelSession(session)} size="sm" type="button" variant="outline">
                                取消場次
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
