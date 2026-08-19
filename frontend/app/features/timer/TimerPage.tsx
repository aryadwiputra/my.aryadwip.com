import { useState, useEffect } from "react";
import { Maximize2, Timer as TimerIcon, Trash2, Flame, Award, Play } from "lucide-react";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { SkeletonCard } from "~/components/ui/Skeleton";
import { formatDateTime } from "~/lib/date";
import { toastSuccess, toastError } from "~/lib/toast";
import { useTasks } from "~/features/tasks/hooks";
import { useSessions, useSessionStats, useTodaySessions, useDeleteSession, useDeleteAllSessions, resumeSessionById } from "./hooks";
import { computeFocusStreak, computeDeepWorkScore, focusStreakLabel } from "./focusStats";
import { useTimerStore } from "./timerStore";
import { Timer } from "./components/Timer";
import { FocusMode } from "./components/FocusMode";
import { AmbiencePanel } from "./components/AmbiencePanel";

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

  const linkedTask = tasks.find((t) => t.id === taskId);
  const deleteSession = useDeleteSession();
  const deleteAllSessions = useDeleteAllSessions();

  const streak = computeFocusStreak(sessions);
  const score = computeDeepWorkScore(sessions);

  async function handleDeleteSession(id: string) {
    if (!confirm("Yakin hapus sesi ini dari riwayat?")) return;
    try {
      await deleteSession.mutateAsync(id);
      toastSuccess("Sesi dihapus");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menghapus sesi");
    }
  }

  async function handleDeleteAll() {
    if (!confirm("Yakin hapus SEMUA riwayat sesi?")) return;
    if (!confirm("Konfirmasi terakhir: seluruh riwayat fokus akan dihapus permanen.")) return;
    try {
      await deleteAllSessions.mutateAsync();
      toastSuccess("Semua riwayat sesi dihapus");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menghapus riwayat");
    }
  }

  // Resume an "active" session directly from its history row (A).
  async function handleResume(id: string) {
    const s = await resumeSessionById(id);
    if (!s) {
      toastError("Sesi sudah berakhir / tidak bisa dilanjutkan");
      return;
    }
    const store = useTimerStore.getState();
    store.restore(s); // restore() already starts the interval if time remains
    toastSuccess("Sesi dilanjutkan");
  }

  // Keep overlay flag in sync so the timer renders dark while focused.
  useEffect(() => {
    useTimerStore.getState().setOverlay(focusMode);
  }, [focusMode]);

  // Single timer instance shared between the page and the focus overlay.
  // Completion is handled globally (GlobalTimer), not by this page.
  const timer = <Timer taskId={taskId || undefined} />;

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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCard(String(today?.sessions.length ?? 0), "Sesi hari ini")}
          {statCard(`${today?.focusMinutes ?? 0}m`, "Fokus hari ini")}
          {statCard(`${stats?.weekMinutes ?? 0}m`, "Fokus minggu ini")}
          {statCard(`${stats?.completedToday ?? 0}`, "Pomodoro selesai")}
        </div>
      )}

      {/* Focus streak + deep work score (#10, #11) */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{focusStreakLabel(streak)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Konsistensi fokus harian</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Deep Work Score: <span className="font-semibold text-violet-600 dark:text-violet-400">{score}/100</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Volume & konsistensi 7 hari terakhir</p>
          </div>
        </div>
      </div>

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

      {/* Ambience (non-fullscreen mode) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
          🎧 Ambience
        </p>
        <AmbiencePanel compact />
      </div>

      {/* FocusMode overlay — wraps the SAME timer instance (shared store state) */}
      {focusMode && (
        <FocusMode onExit={() => setFocusMode(false)} taskName={linkedTask?.title}>
          {timer}
        </FocusMode>
      )}

      {/* Session history */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Riwayat Sesi</h2>
          {sessions.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-3.5 w-3.5" /> Hapus Semua
            </button>
          )}
        </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatDateTime(s.startedAt)}</span>
                  {s.status === "active" && (
                    <button
                      onClick={() => handleResume(s.id)}
                      aria-label="Lanjutkan sesi"
                      title="Lanjutkan sesi"
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      <Play className="h-3.5 w-3.5" /> Lanjutkan
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteSession(s.id)}
                    aria-label="Hapus sesi"
                    title="Hapus sesi"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}