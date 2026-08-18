import { RefreshCw, BookOpen } from "lucide-react";
import { Card } from "~/components/ui/Card";
import { cn } from "~/lib/cn";
import type { DashboardData } from "~/lib/types";
import { MOOD_OPTIONS } from "~/features/journal/const";

interface SnapshotCardProps {
  today: DashboardData["today"];
  onRefresh: () => void;
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
      <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export function SnapshotCard({ today, onRefresh }: SnapshotCardProps) {
  const moodEmoji = today.journalMood
    ? MOOD_OPTIONS.find((m) => m.value === today.journalMood)?.emoji ?? "📝"
    : null;

  return (
    <Card
      title="Snapshot Hari Ini"
      description="Ringkasan aktivitas produktivitas hari ini."
      action={
        <button
          onClick={onRefresh}
          aria-label="Muat ulang"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Metric value={String(today.pendingTasks)} label="Task belum selesai" />
        <Metric value={String(today.completedToday)} label="Selesai hari ini" />
        <Metric value={`${today.focusMinutes}m`} label="Fokus hari ini" />
        <div className="flex flex-col justify-center rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span
              className={cn(
                "text-xs font-medium",
                today.journalDone ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400",
              )}
            >
              {today.journalDone ? "Journal hari ini ✓" : "Journal belum diisi"}
            </span>
          </div>
          {moodEmoji && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Mood: {moodEmoji}</p>}
        </div>
      </div>
    </Card>
  );
}