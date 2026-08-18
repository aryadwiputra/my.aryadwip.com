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

function statCard(value: string, label: string) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
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

  function handleComplete(minutes: number) {
    const text =
      minutes >= 50
        ? `Sesi ${minutes} menit selesai! Lakukan stretch & rehidrasi.`
        : `Sesi ${minutes} menit selesai! Istirahat 5-10 menit. 💪`;
    toastSuccess(text);
  }

  const timer = (
    <Timer taskId={taskId || undefined} onComplete={handleComplete} />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Focus Timer</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Blok kerja fokus untuk deep work.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setFocusMode(true)}>
          <Maximize2 className="h-4 w-4" /> Mode Fokus
        </Button>
      </div>

      {/* Today summary */}
      {todayLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {statCard(String(today?.sessions.length ?? 0), "Sesi hari ini")}
          {statCard(`${today?.focusMinutes ?? 0}m`, "Fokus hari ini")}
          {statCard(`${stats?.weekMinutes ?? 0}m`, "Fokus minggu ini")}
        </div>
      )}

      {/* Task association */}
      <div className="flex items-center gap-3">
        <TimerIcon className="h-5 w-5 text-gray-400" />
        <label className="text-sm text-gray-600 dark:text-gray-300">Kaitkan dengan task:</label>
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
        {timer}
      </div>

      {/* Modal: FocusMode overlay */}
      {focusMode && <FocusMode onExit={() => setFocusMode(false)}>{timer}</FocusMode>}

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