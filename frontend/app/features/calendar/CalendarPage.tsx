import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api";
import { cn } from "~/lib/cn";
import { SkeletonCard } from "~/components/ui/Skeleton";

interface CalendarData {
  tasks: { id: string; date: string; title: string; status: string; priority: string }[];
  journals: { id: string; date: string; mood: string | null }[];
  habitLogs: { id: string; date: string; habitId: string }[];
}

const MOOD_EMOJI: Record<string, string> = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  low: "😕",
  bad: "😞",
};

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const [current, setCurrent] = useState(() => new Date());
  const month = monthKey(current);

  const { data, isLoading } = useQuery({
    queryKey: ["calendar", month],
    queryFn: () => api<CalendarData>(`/api/dashboard/calendar?month=${month}`),
  });

  const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
  const startOffset = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const tasksByDate = new Map<string, CalendarData["tasks"]>();
  data?.tasks.forEach((t) => {
    const arr = tasksByDate.get(t.date) ?? [];
    arr.push(t);
    tasksByDate.set(t.date, arr);
  });
  const journalsByDate = new Map<string, string>();
  data?.journals.forEach((j) => {
    if (j.mood) journalsByDate.set(j.date, j.mood);
  });
  const habitCountByDate = new Map<string, number>();
  data?.habitLogs.forEach((l) => {
    habitCountByDate.set(l.date, (habitCountByDate.get(l.date) ?? 0) + 1);
  });

  function prevMonth() {
    setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  const monthLabel = current.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">Kalender</h1>
          <p className="mt-0.5 text-sm text-gray-500 sm:mt-1 dark:text-gray-400">
            Tasks, journal, dan habit dalam satu tampilan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            aria-label="Bulan sebelumnya"
            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-32 text-center text-sm font-medium text-gray-900 dark:text-white">
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            aria-label="Bulan berikutnya"
            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonCard lines={6} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
              <div
                key={d}
                className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="min-h-20 border-b border-r border-gray-100 dark:border-gray-800" />;
              const dateKey = `${month}-${String(day).padStart(2, "0")}`;
              const dayTasks = tasksByDate.get(dateKey) ?? [];
              const mood = journalsByDate.get(dateKey);
              const habitCount = habitCountByDate.get(dateKey) ?? 0;
              const isToday = dateKey === new Date().toISOString().slice(0, 10);

              return (
                <div
                  key={dateKey}
                  className={cn(
                    "min-h-20 border-b border-r border-gray-100 p-1 dark:border-gray-800",
                    isToday && "bg-blue-50 dark:bg-blue-950/30",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 dark:text-gray-300",
                      )}
                    >
                      {day}
                    </span>
                    {mood && <span className="text-sm">{MOOD_EMOJI[mood] ?? "📝"}</span>}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[10px]",
                          t.status === "completed"
                            ? "bg-green-100 text-green-700 line-through dark:bg-green-900/40 dark:text-green-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
                        )}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="px-1 text-[10px] text-gray-400">+{dayTasks.length - 2} lagi</div>
                    )}
                    {habitCount > 0 && (
                      <div className="px-1 text-[10px] text-teal-600 dark:text-teal-400">
                        🔁 {habitCount} habit
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
