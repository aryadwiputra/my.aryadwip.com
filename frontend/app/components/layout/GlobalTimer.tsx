import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Play, Pause, Timer as TimerIcon, Volume2 } from "lucide-react";
import { toastSuccess } from "~/lib/toast";
import { useTimerStore } from "~/features/timer/timerStore";
import { useEndSession, fetchActiveSession } from "~/features/timer/hooks";
import { FocusJournalPrompt } from "~/features/timer/components/FocusJournalPrompt";
import { BreakPrompt } from "~/features/timer/components/BreakPrompt";
import {
  AMBIENT_TYPES,
  getAmbientType,
  isAmbientOn,
  isMurattalPlaying,
  stopAll,
} from "~/features/timer/ambient";

function format(ms: number) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function notify(title: string, body?: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/icon.svg" });
    }
  } catch {
    /* ignore */
  }
  try {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } catch {
    /* ignore */
  }
}

/**
 * Global timer logic — mounted once in AppShell so it survives navigation.
 * - Handles auto-complete when the countdown hits 0 (marks backend completed).
 * - Renders a floating mini-timer chip while a session is running.
 * - Shows the journal prompt and break offer anywhere in the app.
 */
export function GlobalTimer() {
  const navigate = useNavigate();
  const location = useLocation();
  const endSession = useEndSession();

  const running = useTimerStore((s) => s.running);
  const remainingMs = useTimerStore((s) => s.remainingMs);
  const minutes = useTimerStore((s) => s.minutes);
  const sessionId = useTimerStore((s) => s.sessionId);
  const pendingJournal = useTimerStore((s) => s.pendingJournalPrompt);
  const pendingBreak = useTimerStore((s) => s.pendingBreakPrompt);
  const pause = useTimerStore((s) => s.pause);
  const start = useTimerStore((s) => s.start);

  // Poll ambient/murattal state (global module) for the cross-page indicator.
  const [ambienceActive, setAmbienceActive] = useState(false);
  const [ambienceLabel, setAmbienceLabel] = useState("");
  useEffect(() => {
    const refresh = () => {
      const murattalOn = isMurattalPlaying();
      if (murattalOn) {
        setAmbienceActive(true);
        setAmbienceLabel("Murattal Al-Qur'an");
      } else if (isAmbientOn()) {
        const t = getAmbientType();
        const info = AMBIENT_TYPES.find((a) => a.type === t);
        setAmbienceActive(true);
        setAmbienceLabel(`${info?.emoji ?? ""} ${info?.label ?? t}`);
      } else {
        setAmbienceActive(false);
        setAmbienceLabel("");
      }
    };
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, []);

  const onTimerPage = location.pathname.startsWith("/timer");

  // Global completion handler: registered once, survives navigation.
  useEffect(() => {
    useTimerStore.getState().setOnComplete((sid, mins) => {
      const { isBreak } = useTimerStore.getState();
      // A break ending should NOT hit the backend (client-only) nor count as a pomodoro.
      if (!isBreak) {
        if (sid) {
          endSession.mutate({ id: sid, status: "completed" });
        }
        useTimerStore.getState().incrementPomodoro();
      }
      if (isBreak) {
        toastSuccess("Istirahat selesai! Siap fokus lagi? 💪");
        return; // no journal/break offer after a break
      }
      toastSuccess(`Sesi ${mins} menit selesai! Istirahat sejenak. 💪`);
      notify(`Fokus ${mins} menit selesai! 🎉`, "Istirahat sejenak dan regangkan badan.");
      // Queue prompts so they can appear on any page.
      useTimerStore.getState().setPendingJournalPrompt(mins);
      useTimerStore.getState().setPendingBreakPrompt(true);
    });
    // One-minute warning (#5).
    useTimerStore.getState().setOnOneMinute(() => {
      toastSuccess("1 menit lagi! Selesaikan pekerjaanmu. ⏳");
      notify("Tinggal 1 menit lagi! ⏳", "Sesi fokus hampir selesai.");
    });
    return () => {
      useTimerStore.getState().setOnComplete(null);
      useTimerStore.getState().setOnOneMinute(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore an active backend session on mount (refresh / cross-device),
  // regardless of which page the user lands on.
  useEffect(() => {
    const store = useTimerStore.getState();
    if (store.sessionId) return;
    fetchActiveSession().then((session) => {
      if (session) {
        store.restore(session);
      }
    });
  }, []);

  return (
    <>
      {/* Floating mini-timer chip while running */}
      {running && (
        <button
          onClick={() => navigate("/timer")}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full border border-blue-200 bg-blue-600 px-3 py-2 text-white shadow-lg transition hover:bg-blue-700 dark:border-blue-500 lg:bottom-6 lg:right-6"
          aria-label="Buka timer"
        >
          <TimerIcon className="h-4 w-4" />
          <span className="tabular-nums text-sm font-semibold">{format(remainingMs)}</span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (running) pause();
              else if (sessionId) start();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
            aria-label={running ? "Jeda" : "Lanjut"}
          >
            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </span>
        </button>
      )}

      {/* Ambience indicator — visible on any page except /timer (has its own panel) */}
      {ambienceActive && !onTimerPage && (
        <button
          onClick={() => stopAll()}
          title="Hentikan ambience"
          className="fixed bottom-40 right-4 z-40 flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-lg transition hover:border-red-400 hover:text-red-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 lg:bottom-24 lg:right-6"
        >
          <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
          {ambienceLabel}
          <span className="text-gray-400">✕</span>
        </button>
      )}

      {/* Journal prompt after a finished session (global) */}
      {pendingJournal !== null && (
        <FocusJournalPrompt
          open
          minutes={pendingJournal}
          onClose={() => useTimerStore.getState().setPendingJournalPrompt(null)}
        />
      )}

      {/* Break offer after a finished session (global) */}
      {pendingBreak && (
        <BreakPrompt
          open
          minutes={minutes}
          onClose={() => useTimerStore.getState().setPendingBreakPrompt(false)}
        />
      )}
    </>
  );
}
