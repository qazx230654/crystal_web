"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function firstWeekdayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 1)).getUTCDay();
}

export function CalendarMonthGrid({
  isDateEnabled,
  month,
  onMonthChange,
  onSelectDate,
  renderDayExtra,
  selectedDate,
  year
}: {
  isDateEnabled: (dateKey: string) => boolean;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  onSelectDate: (dateKey: string) => void;
  renderDayExtra?: (dateKey: string) => ReactNode;
  selectedDate?: string;
  year: number;
}) {
  const totalDays = daysInMonth(year, month);
  const leadingBlanks = firstWeekdayOfMonth(year, month);
  const cells: Array<{ day: number; dateKey: string } | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => ({ day: index + 1, dateKey: toDateKey(year, month, index + 1) }))
  ];

  function goToPreviousMonth() {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  }

  function goToNextMonth() {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  }

  return (
    <div className="border border-crystal-line bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {year} 年 {month + 1} 月
        </p>
        <div className="flex gap-1">
          <button aria-label="上個月" className="grid h-8 w-8 place-items-center border border-crystal-line" onClick={goToPreviousMonth} type="button">
            <ChevronLeft size={16} />
          </button>
          <button aria-label="下個月" className="grid h-8 w-8 place-items-center border border-crystal-line" onClick={goToNextMonth} type="button">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-crystal-muted">
        {weekdayLabels.map((label) => (
          <span className="py-1" key={label}>
            {label}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell) return <div key={`blank-${index}`} />;

          const enabled = isDateEnabled(cell.dateKey);
          const isSelected = selectedDate === cell.dateKey;

          return (
            <button
              className={`flex h-16 flex-col items-center justify-start gap-1 rounded-md border p-1 text-sm transition ${
                !enabled
                  ? "cursor-not-allowed border-transparent text-crystal-muted/40"
                  : isSelected
                    ? "border-crystal-ink bg-crystal-ink text-white"
                    : "border-crystal-line bg-white hover:border-crystal-rose"
              }`}
              disabled={!enabled}
              key={cell.dateKey}
              onClick={() => onSelectDate(cell.dateKey)}
              type="button"
            >
              <span>{cell.day}</span>
              {enabled && renderDayExtra ? <span className="text-[10px] leading-none">{renderDayExtra(cell.dateKey)}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
