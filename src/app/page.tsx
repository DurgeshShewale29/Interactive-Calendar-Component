"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTH_ACCENTS = [
  "#258fd5",
  "#9f7aea",
  "#f28c2f",
  "#5ba855",
  "#d44855",
  "#17a2a4",
  "#ec6d5f",
  "#4285f4",
  "#8b5cf6",
  "#f59e0b",
  "#16a34a",
  "#0ea5e9",
];

type CalendarDay = {
  date: Date;
  inCurrentMonth: boolean;
};

const atMidnight = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const getMonthGrid = (month: Date) => {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstWeekDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  const result: CalendarDay[] = [];

  for (let i = firstWeekDay; i > 0; i -= 1) {
    result.push({ date: new Date(month.getFullYear(), month.getMonth(), 1 - i), inCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    result.push({ date: new Date(month.getFullYear(), month.getMonth(), day), inCurrentMonth: true });
  }

  while (result.length % 7 !== 0) {
    const next = result.length - (firstWeekDay + daysInMonth) + 1;
    result.push({ date: new Date(month.getFullYear(), month.getMonth() + 1, next), inCurrentMonth: false });
  }

  return result;
};

export default function Home() {
  const today = atMidnight(new Date());
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [nextMonth, setNextMonth] = useState<Date | null>(null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [flipPhase, setFlipPhase] = useState<"idle" | "out">("idle");
  const pendingMonthRef = useRef<Date | null>(null);
  const [notesByMonth, setNotesByMonth] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem("calendar-notes");
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  });

  const grid = useMemo(() => getMonthGrid(month), [month]);
  const nextGrid = useMemo(() => (nextMonth ? getMonthGrid(nextMonth) : []), [nextMonth]);

  const activePreview = useMemo(() => {
    if (!rangeStart || rangeEnd || !hoverDate) return null;
    return hoverDate >= rangeStart
      ? { start: rangeStart, end: hoverDate }
      : { start: hoverDate, end: rangeStart };
  }, [rangeStart, rangeEnd, hoverDate]);

  useEffect(() => {
    localStorage.setItem("calendar-notes", JSON.stringify(notesByMonth));
  }, [notesByMonth]);

  const onDayClick = (date: Date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
      return;
    }

    if (date < rangeStart) {
      setRangeEnd(rangeStart);
      setRangeStart(date);
      return;
    }

    setRangeEnd(date);
  };

  const clearSelection = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setHoverDate(null);
  };

  const goToMonth = (step: 1 | -1) => {
    if (flipPhase !== "idle" || nextMonth) return;
    const target = new Date(month.getFullYear(), month.getMonth() + step, 1);
    pendingMonthRef.current = target;
    setNextMonth(target);
    setFlipPhase("out");
  };

  useEffect(() => {
    return () => {
      pendingMonthRef.current = null;
    };
  }, []);

  const onPageAnimationEnd = () => {
    if (flipPhase !== "out") return;
    const target = pendingMonthRef.current;
    if (!target) return;

    setMonth(target);
    setNextMonth(null);
    setFlipPhase("idle");
    pendingMonthRef.current = null;
  };

  const onNotesChange = (monthStorageKey: string, value: string) => {
    setNotesByMonth((prev) => ({
      ...prev,
      [monthStorageKey]: value,
    }));
  };

  const isSameDate = (a: Date | null, b: Date | null) => Boolean(a && b && dateKey(a) === dateKey(b));
  const isBetween = (date: Date, start: Date, end: Date) => date > start && date < end;

  const getDayState = (date: Date) => {
    const isStart = isSameDate(date, rangeStart);
    const isEnd = isSameDate(date, rangeEnd);
    const hasRange = rangeStart && rangeEnd;
    const inRange = hasRange ? isBetween(date, rangeStart, rangeEnd) : false;
    const inPreview = activePreview ? isBetween(date, activePreview.start, activePreview.end) : false;
    const isToday = isSameDate(date, today);

    return { isStart, isEnd, inRange, inPreview, isToday };
  };

  const renderCalendarSheet = (displayMonth: Date, displayGrid: CalendarDay[], interactive: boolean) => {
    const accent = MONTH_ACCENTS[displayMonth.getMonth()];
    const monthLabel = displayMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
    const storageKey = `calendar-notes-${monthKey(displayMonth)}`;
    const notes = notesByMonth[storageKey] ?? "";

    return (
      <div className="flex flex-col">
        <div className="relative min-h-[290px]">
          <Image
            src="/calendar-hero.png"
            alt="Wall calendar hero"
            fill
            priority
            className="object-cover object-top"
          />
          <div
            className="absolute bottom-0 left-0 h-[68px] w-[60%]"
            style={{ backgroundColor: accent, clipPath: "polygon(0 100%, 100% 35%, 100% 100%)" }}
          />
          <div
            className="absolute bottom-0 right-0 flex h-[78px] w-[46%] items-center justify-end px-5 text-right text-white"
            style={{ backgroundColor: accent, clipPath: "polygon(0 35%, 100% 0%, 100% 100%, 10% 100%)" }}
          >
            <p className="text-xs font-medium tracking-widest">
              {displayMonth.toLocaleString("en-US", { year: "numeric" })}
              <br />
              <span className="text-base font-semibold">{displayMonth.toLocaleString("en-US", { month: "long" })}</span>
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={interactive ? () => goToMonth(-1) : undefined}
              disabled={!interactive}
              className="rounded-md border border-black/10 px-3 py-1.5 text-sm transition hover:-translate-y-[1px] hover:bg-black/5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50"
            >
              Prev
            </button>
            <h1 className="text-sm font-semibold tracking-wide">{monthLabel}</h1>
            <button
              type="button"
              onClick={interactive ? () => goToMonth(1) : undefined}
              disabled={!interactive}
              className="rounded-md border border-black/10 px-3 py-1.5 text-sm transition hover:-translate-y-[1px] hover:bg-black/5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-[95px_1fr] gap-3 sm:grid-cols-[120px_1fr]">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-black/45">Notes</p>
              <textarea
                value={notes}
                onChange={(event) => onNotesChange(storageKey, event.target.value)}
                readOnly={!interactive}
                placeholder="Memo for this month or selected date range..."
                className="h-[220px] w-full resize-none rounded-sm border border-black/10 p-2 text-xs outline-none focus:border-black/30"
              />
            </div>

            <div>
              <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-semibold text-black/45">
                {WEEK_DAYS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {displayGrid.map(({ date, inCurrentMonth }) => {
                  const { isStart, isEnd, inRange, inPreview, isToday } = getDayState(date);
                  return (
                    <button
                      key={dateKey(date)}
                      type="button"
                      onMouseEnter={interactive ? () => setHoverDate(date) : undefined}
                      onMouseLeave={interactive ? () => setHoverDate(null) : undefined}
                      onClick={interactive ? () => onDayClick(date) : undefined}
                      disabled={!interactive}
                      className={[
                        "relative aspect-square rounded-sm text-xs transition disabled:pointer-events-none",
                        inCurrentMonth ? "text-black" : "text-black/25",
                        inRange || inPreview ? "bg-black/7" : "hover:bg-black/6",
                        isToday ? "ring-1 ring-black/30" : "",
                        isStart || isEnd ? "cal-day-pop bg-black text-white hover:bg-black" : "",
                        "hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]",
                      ].join(" ")}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={interactive ? clearSelection : undefined}
                  disabled={!interactive}
                  className="rounded-md border border-black/10 px-2 py-1 transition hover:-translate-y-[1px] hover:bg-black/5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50"
                >
                  Clear range
                </button>
                <span className="rounded-md bg-black/5 px-2 py-1">
                  {rangeStart ? `From ${rangeStart.toDateString()}` : "Pick start date"}
                </span>
                <span className="rounded-md bg-black/5 px-2 py-1">
                  {rangeEnd ? `To ${rangeEnd.toDateString()}` : "Pick end date"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#ebebeb] px-4 py-10 text-[#1f1f1f]">
      <section className="mx-auto w-full max-w-xl">
        <div className="mx-auto mb-3 flex w-[220px] justify-between opacity-60">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="h-3 w-1 rounded-full bg-black/55" />
          ))}
        </div>

        <article className="cal-card-enter cal-perspective overflow-hidden rounded-sm border border-black/5 bg-white shadow-[0_24px_40px_rgba(0,0,0,0.18)]">
          <div className="relative">
            {nextMonth && (
              <div className="cal-page-under cal-page-under-reveal pointer-events-none absolute inset-0 z-0">
                {renderCalendarSheet(nextMonth, nextGrid, false)}
              </div>
            )}
            <div
              onAnimationEnd={onPageAnimationEnd}
              className={["relative z-10", flipPhase === "out" ? "cal-page-peel-out" : ""].join(" ")}
            >
              {renderCalendarSheet(month, grid, true)}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
