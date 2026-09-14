"use client";

import { useMemo, useState } from "react";
import { SessionRow } from "@/components/admin/SessionRow";
import type { AdminSession } from "@/lib/admin-sessions";

type ViewMode = "day" | "week" | "month";

const VIEW_LABELS: Record<ViewMode, string> = { day: "Dia", week: "Semana", month: "Mês" };
const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function startOfWeek(d: Date) {
  return addDays(startOfDay(d), -d.getDay());
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const dayLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });
const monthYearFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export function AgendaCalendar({
  sessions,
  todayIso,
}: {
  sessions: AdminSession[];
  todayIso: string;
}) {
  const today = useMemo(() => new Date(todayIso), [todayIso]);
  const [view, setView] = useState<ViewMode>("week");
  const [cursor, setCursor] = useState(() => new Date(todayIso));

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, AdminSession[]>();
    for (const session of sessions) {
      const key = dateKey(new Date(session.scheduled_at));
      const list = map.get(key) ?? [];
      list.push(session);
      map.set(key, list);
    }
    return map;
  }, [sessions]);

  function goPrev() {
    if (view === "day") setCursor((c) => addDays(c, -1));
    else if (view === "week") setCursor((c) => addDays(c, -7));
    else setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  }
  function goNext() {
    if (view === "day") setCursor((c) => addDays(c, 1));
    else if (view === "week") setCursor((c) => addDays(c, 7));
    else setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  }
  function goToday() {
    setCursor(new Date(todayIso));
  }
  function selectDay(day: Date) {
    setCursor(day);
    setView("day");
  }

  const headerLabel =
    view === "day"
      ? dayLabelFormatter.format(cursor)
      : view === "week"
        ? `${shortDateFormatter.format(startOfWeek(cursor))} – ${shortDateFormatter.format(addDays(startOfWeek(cursor), 6))}`
        : monthYearFormatter.format(cursor);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border bg-paper p-1">
          {(["day", "week", "month"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                view === v ? "bg-primary text-paper" : "text-ink-soft hover:text-ink"
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Anterior"
            className="rounded-lg border border-border px-2.5 py-1 text-ink-soft hover:text-ink"
          >
            ‹
          </button>
          <span className="min-w-40 text-center font-medium capitalize text-ink">
            {headerLabel}
          </span>
          <button
            type="button"
            onClick={goNext}
            aria-label="Próximo"
            className="rounded-lg border border-border px-2.5 py-1 text-ink-soft hover:text-ink"
          >
            ›
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-ink-soft hover:text-ink"
          >
            Hoje
          </button>
        </div>
      </div>

      {view === "month" && (
        <MonthGrid cursor={cursor} today={today} sessionsByDay={sessionsByDay} onSelectDay={selectDay} />
      )}

      {view === "week" && (
        <WeekStrip cursor={cursor} today={today} sessionsByDay={sessionsByDay} onSelectDay={selectDay} />
      )}

      {(view === "day" || view === "week") && (
        <SessionList view={view} cursor={cursor} sessionsByDay={sessionsByDay} />
      )}
    </div>
  );
}

function MonthGrid({
  cursor,
  today,
  sessionsByDay,
  onSelectDay,
}: {
  cursor: Date;
  today: Date;
  sessionsByDay: Map<string, AdminSession[]>;
  onSelectDay: (day: Date) => void;
}) {
  const gridStart = startOfWeek(startOfMonth(cursor));
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-ink-soft">
        {WEEKDAY_SHORT.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = day.getMonth() === cursor.getMonth();
          const count = sessionsByDay.get(dateKey(day))?.length ?? 0;
          const isToday = sameDay(day, today);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-label={`Dia ${day.getDate()}${count > 0 ? `, ${count} sessão(ões)` : ""}`}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border text-xs transition ${
                isToday ? "border-primary" : "border-border"
              } ${inMonth ? "bg-paper text-ink" : "bg-paper-alt/40 text-ink-soft/60"} hover:border-primary`}
            >
              <span aria-hidden="true">{day.getDate()}</span>
              {count > 0 && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekStrip({
  cursor,
  today,
  sessionsByDay,
  onSelectDay,
}: {
  cursor: Date;
  today: Date;
  sessionsByDay: Map<string, AdminSession[]>;
  onSelectDay: (day: Date) => void;
}) {
  const weekStart = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="mt-4 grid grid-cols-7 gap-1">
      {days.map((day) => {
        const count = sessionsByDay.get(dateKey(day))?.length ?? 0;
        const isToday = sameDay(day, today);
        return (
          <button
            key={day.toISOString()}
            type="button"
            onClick={() => onSelectDay(day)}
            className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs transition ${
              isToday ? "border-primary" : "border-border"
            } hover:border-primary`}
          >
            <span className="uppercase tracking-wide text-ink-soft">{WEEKDAY_SHORT[day.getDay()]}</span>
            <span className="font-semibold text-ink">{day.getDate()}</span>
            <span className="text-[10px] text-ink-soft">
              {count > 0 ? `${count} sessão${count === 1 ? "" : "ões"}` : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SessionList({
  view,
  cursor,
  sessionsByDay,
}: {
  view: "day" | "week";
  cursor: Date;
  sessionsByDay: Map<string, AdminSession[]>;
}) {
  const days = view === "day" ? [cursor] : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i));
  const hasAny = days.some((d) => (sessionsByDay.get(dateKey(d))?.length ?? 0) > 0);

  if (!hasAny) {
    return <p className="mt-4 text-sm text-ink-soft">Nenhuma sessão nesse período.</p>;
  }

  return (
    <div className="mt-4 space-y-6">
      {days.map((day) => {
        const daySessions = sessionsByDay.get(dateKey(day)) ?? [];
        if (daySessions.length === 0) return null;
        return (
          <div key={day.toISOString()}>
            {view === "week" && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {dayLabelFormatter.format(day)}
              </p>
            )}
            <div className="space-y-3">
              {daySessions.map((session) => (
                <SessionRow key={session.id} session={session} own />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
