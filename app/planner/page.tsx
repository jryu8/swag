// app/planner/page.tsx
"use client";

import { useMemo, useState } from "react";

type DayKey = string; // "YYYY-MM-DD"

function formatDateKey(date: Date): DayKey {
  return date.toISOString().slice(0, 10);
}

export default function PlannerPage() {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [notes, setNotes] = useState<Record<DayKey, string>>({});

  // build calendar grid
  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Monday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [currentMonth]);

  const handleChangeMonth = (delta: number) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  };

  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null;
  const selectedNote = selectedKey ? notes[selectedKey] ?? "" : "";

  const handleNoteChange = (value: string) => {
    if (!selectedKey) return;
    setNotes((prev) => ({
      ...prev,
      [selectedKey]: value,
    }));
  };

  const monthLabel = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f6eadf]">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#1f130a]">
              Outfit Planner
            </h1>
            <p className="mt-1 max-w-md text-sm text-[#6c5a4a]">
              Use the calendar to block future events and jot down outfit plans.
              This is a simple, local planner – you can hook it up to real
              storage later.
            </p>
          </div>
        </header>

        {/* Layout: calendar + notes */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Calendar */}
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleChangeMonth(-1)}
                className="rounded-full border border-[#e1d2c3] bg-[#f9f1e6] px-3 py-1 text-xs text-[#4f3c2c] hover:bg-[#f6eadf]"
              >
                ← Previous
              </button>
              <div className="text-sm font-semibold text-[#1f130a]">
                {monthLabel}
              </div>
              <button
                type="button"
                onClick={() => handleChangeMonth(1)}
                className="rounded-full border border-[#e1d2c3] bg-[#f9f1e6] px-3 py-1 text-xs text-[#4f3c2c] hover:bg-[#f6eadf]"
              >
                Next →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a08975]">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
              {days.map((date, idx) => {
                if (!date) {
                  return <div key={idx} className="h-10 rounded-2xl" />;
                }

                const key = formatDateKey(date);
                const isToday =
                  formatDateKey(date) === formatDateKey(today);
                const isSelected =
                  selectedDate &&
                  formatDateKey(selectedDate) === formatDateKey(date);
                const hasNote = !!notes[key];

                const baseClasses =
                  "flex h-10 items-center justify-center rounded-2xl border text-xs cursor-pointer transition";
                const colorClasses = isSelected
                  ? "border-[#b46a2a] bg-[#b46a2a] text-white"
                  : isToday
                  ? "border-[#c2894f] bg-[#f9f1e6] text-[#1f130a]"
                  : "border-transparent bg-[#f9f1e6] text-[#4f3c2c] hover:bg-[#f6eadf]";

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`${baseClasses} ${colorClasses}`}
                  >
                    <span>{date.getDate()}</span>
                    {hasNote && (
                      <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#1f130a]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes panel */}
          <div className="flex flex-col rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-[#1f130a]">
              Outfit note
            </h2>
            <p className="mb-3 text-xs text-[#8f7a66]">
              Click a date on the calendar, then describe the event and outfit
              idea for that day. Notes are stored only in this session.
            </p>

            <div className="mb-2 text-xs text-[#4f3c2c]">
              {selectedDate ? (
                <>
                  Planning for{" "}
                  <span className="font-semibold">
                    {selectedDate.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </>
              ) : (
                "Choose a day on the calendar."
              )}
            </div>

            <textarea
              value={selectedNote}
              onChange={(e) => handleNoteChange(e.target.value)}
              disabled={!selectedDate}
              rows={8}
              className="mt-1 flex-1 rounded-2xl border border-[#e1d2c3] bg-[#f9f1e6] px-3 py-2 text-sm text-[#1f130a] placeholder:text-[#b39a85] focus:outline-none focus:ring-2 focus:ring-[#c2894f]/50 disabled:opacity-60"
              placeholder={
                selectedDate
                  ? "Example: 11 AM presentation + evening study session.\n• Beige coat + black trousers + loafers\n• Bring scarf if it gets cold."
                  : "Select a date to start planning."
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}
