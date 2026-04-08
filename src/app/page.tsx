"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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

export default function Home() {
  const today = atMidnight(new Date());
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [notesByMonth, setNotesByMonth] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem("calendar-notes");
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  });

  const accent = MONTH_ACCENTS[month.getMonth()];
  const monthLabel = month.toLocaleString("en-US", { month: "long", year: "numeric" });
  const storageKey = `calendar-notes-${monthKey(month)}`;
  const notes = notesByMonth[storageKey] ?? "";

  const grid = useMemo(() => {
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
  }, [month]);

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

  const onNotesChange = (value: string) => {
    setNotesByMonth((prev) => ({
      ...prev,
      [storageKey]: value,
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

  return (
    <main className="min-h-screen bg-[#ebebeb] px-4 py-10 text-[#1f1f1f]">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mx-auto mb-3 flex w-[220px] justify-between opacity-60">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="h-3 w-1 rounded-full bg-black/55" />
          ))}
        </div>

        <article className="overflow-hidden rounded-sm border border-black/5 bg-white shadow-[0_24px_40px_rgba(0,0,0,0.18)]">
          <div className="grid gap-0 md:grid-cols-[1.05fr_1fr]">
            <div className="relative min-h-[250px]">
              <Image src="/calendar-hero.png" alt="Wall calendar hero" fill priority className="object-cover" />
              <div
                className="absolute bottom-0 left-0 h-[68px] w-[60%]"
                style={{ backgroundColor: accent, clipPath: "polygon(0 100%, 100% 35%, 100% 100%)" }}
              />
              <div
                className="absolute bottom-0 right-0 flex h-[78px] w-[46%] items-center justify-end px-5 text-right text-white"
                style={{ backgroundColor: accent, clipPath: "polygon(0 35%, 100% 0%, 100% 100%, 10% 100%)" }}
              >
                <p className="text-xs font-medium tracking-widest">
                  {month.toLocaleString("en-US", { year: "numeric" })}
                  <br />
                  <span className="text-base font-semibold">{month.toLocaleString("en-US", { month: "long" })}</span>
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5"
                >
                  Prev
                </button>
                <h1 className="text-sm font-semibold tracking-wide">{monthLabel}</h1>
                <button
                  type="button"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                  className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5"
                >
                  Next
                </button>
              </div>

              <div className="grid grid-cols-[90px_1fr] gap-3 sm:grid-cols-[115px_1fr]">
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-black/45">Notes</p>
                  <textarea
                    value={notes}
                    onChange={(event) => onNotesChange(event.target.value)}
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
                    {grid.map(({ date, inCurrentMonth }) => {
                      const { isStart, isEnd, inRange, inPreview, isToday } = getDayState(date);
                      return (
                        <button
                          key={dateKey(date)}
                          type="button"
                          onMouseEnter={() => setHoverDate(date)}
                          onMouseLeave={() => setHoverDate(null)}
                          onClick={() => onDayClick(date)}
                          className={[
                            "relative aspect-square rounded-sm text-xs transition-colors",
                            inCurrentMonth ? "text-black" : "text-black/25",
                            inRange || inPreview ? "bg-black/7" : "hover:bg-black/6",
                            isToday ? "ring-1 ring-black/30" : "",
                            isStart || isEnd ? "bg-black text-white hover:bg-black" : "",
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
                      onClick={clearSelection}
                      className="rounded-md border border-black/10 px-2 py-1 hover:bg-black/5"
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
        </article>
      </section>
    </main>
  );
}
