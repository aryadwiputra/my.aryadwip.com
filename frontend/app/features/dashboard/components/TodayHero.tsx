import { BookOpen, CheckSquare, Clock, Flame } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "~/lib/cn";
import type { DashboardData, Streak } from "~/lib/types";
import { MOOD_OPTIONS } from "~/features/journal/const";

interface TodayHeroProps {
  today: DashboardData["today"];
  streaks: DashboardData["streaks"];
  onRefresh: () => void;
}

function StreakPill({ streak, icon }: { streak: Streak; icon: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
      <Flame className="h-3.5 w-3.5" />
      {icon} {streak.current}
    </span>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-800/50">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm dark:bg-gray-700 dark:text-gray-300")}>
        {icon}
      </div>
      <span className="text-xl font-semibold text-gray-900 dark:text-white">{value}</span>
      <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

export function TodayHero({ today, streaks, onRefresh }: TodayHeroProps) {
  const moodEmoji = today.journalMood
    ? MOOD_OPTIONS.find((m) => m.value === today.journalMood)?.emoji ?? "📝"
    : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Hari Ini</span>
          <div className="flex items-center gap-1.5">
            <StreakPill streak={streaks.journal} icon="📓" />
            <StreakPill streak={streaks.task} icon="✅" />
            <StreakPill streak={streaks.focus} icon="⏱️" />
          </div>
        </div>
        <button
          onClick={onRefresh}
          aria-label="Muat ulang"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <Clock className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          value={String(today.pendingTasks)}
          label="Task tersisa"
          icon={<CheckSquare className="h-4 w-4" />}
        />
        <Stat
          value={String(today.completedToday)}
          label="Selesai hari ini"
          icon={<CheckSquare className="h-4 w-4 text-green-500" />}
        />
        <Stat
          value={`${today.focusMinutes}m`}
          label="Fokus hari ini"
          icon={<Clock className="h-4 w-4 text-violet-500" />}
        />
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-800/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm dark:bg-gray-700 dark:text-gray-300">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className={cn("text-xl font-semibold", today.journalDone ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>
            {today.journalDone ? "✓" : "…"}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {today.journalDone ? "Journal diisi" : "Belum journal"}
          </span>
          {moodEmoji && <span className="text-sm">{moodEmoji}</span>}
        </div>
      </div>
    </div>
  );
}
