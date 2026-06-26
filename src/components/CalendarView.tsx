import { useMemo, useState } from "react";
import type { Task } from "../types";

interface Props {
  tasks: Task[];
  onSelectTask: (t: Task) => void;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date): Date {
  const r = new Date(d);
  r.setDate(1);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function CalendarView({ tasks, onSelectTask }: Props) {
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(new Date()));

  const todayYmd = formatYmd(new Date());

  const cells = useMemo<Date[]>(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) {
      arr.push(new Date(year, month, 1 - firstDow + i));
    }
    return arr;
  }, [cursor]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.due_date) continue;
      const list = map.get(t.due_date) ?? [];
      list.push(t);
      map.set(t.due_date, list);
    }
    return map;
  }, [tasks]);

  const monthLabel = `${cursor.getFullYear()}年 ${cursor.getMonth() + 1}月`;

  const goPrev = () => {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() - 1);
    setCursor(d);
  };
  const goNext = () => {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + 1);
    setCursor(d);
  };
  const goToday = () => setCursor(startOfMonth(new Date()));

  return (
    <div className="calendar">
      <header className="calendar-header">
        <h2 className="calendar-title">{monthLabel}</h2>
        <div className="calendar-nav">
          <button type="button" onClick={goPrev} aria-label="前の月">
            ‹
          </button>
          <button type="button" onClick={goToday}>
            今日
          </button>
          <button type="button" onClick={goNext} aria-label="次の月">
            ›
          </button>
        </div>
      </header>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`calendar-weekday ${
              i === 0 ? "sun" : i === 6 ? "sat" : ""
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((d) => {
          const ymd = formatYmd(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const isToday = ymd === todayYmd;
          const dow = d.getDay();
          const dayTasks = tasksByDate.get(ymd) ?? [];
          return (
            <div
              key={ymd}
              className={`calendar-cell ${inMonth ? "" : "out"} ${
                isToday ? "today" : ""
              } ${dow === 0 ? "sun" : dow === 6 ? "sat" : ""}`}
            >
              <div className="calendar-date">{d.getDate()}</div>
              {dayTasks.length > 0 && (
                <ul className="calendar-tasks">
                  {dayTasks.map((t) => (
                    <li
                      key={t.id}
                      className={`calendar-task status-${t.status} ${
                        t.status === "done" ? "done" : ""
                      }`}
                      onClick={() => onSelectTask(t)}
                      title={t.title}
                    >
                      {t.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
