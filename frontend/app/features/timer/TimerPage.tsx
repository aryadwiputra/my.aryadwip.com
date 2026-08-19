import { useState } from "react";
import { Maximize2, Timer as TimerIcon } from "lucide-react";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { SkeletonCard } from "~/components/ui/Skeleton";
import { formatDateTime } from "~/lib/date";
import { toastSuccess } from "~/lib/toast";
import { useTasks } from "~/features/tasks/hooks";
import { useSessions, useSessionStats, useTodaySessions } from "./hooks";
import { Timer } from "./components/Timer";
import { FocusMode } from "./components/FocusMode";
import { FocusJournalPrompt } from "./components/FocusJournalPrompt";

function statCard(value: string, label: string) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-center sm:p-5 sm:text-left dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm dark:text-gray-400">{label}</p>
    </div>
  );
}

export default function TimerPage() {
  const { data: today, isLoading: todayLoading } = useTodaySessions();
  const { data: stats } = useSessionStats();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const { data: tasks = [] } = useTasks();

  const [taskId, setTaskId] = useState<string>("");
  const [focusMode, setFocusMode] = useState(false);
  const [journalPrompt, setJournalPrompt] = useState<{ minutes: number } | null>(null);

  const linkedTask = tasks.find((t) => t.id === taskId);

  function handleComplete(minutes: number) {
    const text =
      minutes >= 50
        ? `Sesi ${minutes} menit selesai! Lakukan stretch & rehidrasi.`
        : `Sesi ${minutes} menit selesai! Istirahat 5-10 menit. 💪`;
    toastSuccess(text);
    // Show auto-journal prompt
    setJournalPrompt({ minutes });
  }

  const timer = <Timer taskId={taskId || undefined} onComplete={handleComplete} />;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">Focus Timer</h1>
          <p className="mt-0.5 text-sm text-gray-500 sm:mt-1 dark:text-gray-400">
            Blok kerja fokus untuk deep work.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setFocusMode(true)}
          className="shrink-0"
          aria-label="Mode Fokus"
          title="Mode Fokus"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Today summary */}
      {todayLoading ? (
        <div className="grid grid-cols-3 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {statCard(String(today?.sessions.length ?? 0), "Sesi hari ini")}
          {statCard(`${today?.focusMinutes ?? 0}m`, "Fokus hari ini")}
          {statCard(`${stats?.weekMinutes ?? 0}m`, "Fokus minggu ini")}
        </div>
      )}

      {/* Task association */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <TimerIcon className="h-5 w-5 text-gray-400" />
          Kaitkan dengan task:
        </label>
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:flex-1"
        >
          <option value="">— Tidak ada —</option>
          {tasks
            .filter((t) => t.status !== "completed")
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
        </select>
      </div>

      {/* Timer */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-8 dark:border-gray-800 dark:bg-gray-900">
        {timer}
      </div>

      {/* FocusMode overlay */}
      {focusMode && (
        <FocusMode onExit={() => setFocusMode(false)} taskName={linkedTask?.title}>
          <Timer taskId={taskId || undefined} onComplete={handleComplete} variant="dark" />
        </FocusMode>
      )}

      {/* Auto-journal prompt after focus session */}
      {journalPrompt && (
        <FocusJournalPrompt
          open
          minutes={journalPrompt.minutes}
          taskName={linkedTask?.title}
          onClose={() => setJournalPrompt(null)}
        />
      )}

      {/* Session history */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Riwayat Sesi</h2>
        {sessionsLoading ? (
          <SkeletonCard />
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Belum ada sesi fokus.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Badge
                    tone={s.status === "completed" ? "green" : s.status === "active" ? "blue" : "gray"}
                  >
                    {s.status}
                  </Badge>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {s.duration} min
                  </span>
                </div>
                <span className="text-xs text-gray-400">{formatDateTime(s.startedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}