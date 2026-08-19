import { create } from "zustand";
import { persist } from "zustand/middleware";

// Single module-level interval so only ONE countdown runs regardless of how
// many <Timer> instances are mounted (page + focus overlay).
let intervalId: ReturnType<typeof setInterval> | null = null;
let oneMinuteFired = false; // guard so the 1-min warning fires only once per session

interface TimerStore {
  minutes: number;
  durationMs: number;
  startedAt: number | null; // epoch ms when the session started (or resumed)
  running: boolean;
  custom: string;
  sessionId: string | null;
  overlay: boolean;
  isBreak: boolean; // true when running a break (client-only, not counted in stats)
  pomodoroCount: number; // completed focus sessions today (drives long-break cadence)
  pendingJournalPrompt: number | null; // minutes of a just-finished session, to show journal prompt anywhere
  pendingBreakPrompt: boolean; // true to offer a break after a finished session
  onOneMinute: (() => void) | null;
  onComplete: ((sessionId: string | null, minutes: number) => void) | null;
  setMinutes: (m: number) => void;
  setCustom: (c: string) => void;
  setRunning: (r: boolean) => void;
  setSessionId: (id: string | null) => void;
  setOverlay: (v: boolean) => void;
  setIsBreak: (b: boolean) => void;
  incrementPomodoro: () => void;
  setPomodoroCount: (n: number) => void;
  setPendingJournalPrompt: (v: number | null) => void;
  setPendingBreakPrompt: (v: boolean) => void;
  setOnOneMinute: (fn: (() => void) | null) => void;
  setOnComplete: (fn: ((sessionId: string | null, minutes: number) => void) | null) => void;
  // Restore an active session from the backend (refresh / cross-device).
  restore: (session: { id: string; duration: number; startedAt: number }) => void;
  // Timestamp-based: sisa waktu = (startedAt + durationMs) - now.
  remainingMs: number;
  tick: () => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      minutes: 25,
      durationMs: 25 * 60_000,
      startedAt: null,
      running: false,
      custom: "",
      sessionId: null,
      overlay: false,
      isBreak: false,
      pomodoroCount: 0,
      pendingJournalPrompt: null,
      pendingBreakPrompt: false,
      onOneMinute: null,
      onComplete: null,
      remainingMs: 25 * 60_000,

      setMinutes: (m) => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        set({ minutes: m, durationMs: m * 60_000, remainingMs: m * 60_000, running: false, startedAt: null, custom: "" });
      },
      setCustom: (c) => set({ custom: c }),
      setRunning: (r) => set({ running: r }),
      setSessionId: (id) => set({ sessionId: id }),
      setOverlay: (v) => set({ overlay: v }),
      setIsBreak: (b) => set({ isBreak: b }),
      incrementPomodoro: () => set((s) => ({ pomodoroCount: s.pomodoroCount + 1 })),
      setPomodoroCount: (n) => set({ pomodoroCount: n }),
      setPendingJournalPrompt: (v) => set({ pendingJournalPrompt: v }),
      setPendingBreakPrompt: (v) => set({ pendingBreakPrompt: v }),
      setOnOneMinute: (fn) => set({ onOneMinute: fn }),
      setOnComplete: (fn) => set({ onComplete: fn }),

      // Restore from an active backend session: recompute remaining from
      // server timestamps so refresh / cross-device resumes accurately.
      restore: (session) => {
        const durationMs = session.duration * 60_000;
        const remaining = (session.startedAt + durationMs) - Date.now();
        set({
          sessionId: session.id,
          minutes: session.duration,
          durationMs,
          remainingMs: Math.max(0, remaining),
          startedAt: session.startedAt,
          running: remaining > 0, // auto-lanjut if time remains
          custom: "",
        });
        // If resuming with time left, ensure the interval is actually running
        // (start() bails early when running is already true).
        if (remaining > 0 && !intervalId) {
          intervalId = setInterval(() => useTimerStore.getState().tick(), 500);
        }
      },

      tick: () => {
        const { startedAt, durationMs, minutes, onComplete, onOneMinute, sessionId } = get();
        if (!startedAt) return;
        const remaining = (startedAt + durationMs) - Date.now();
        if (remaining <= 0) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          oneMinuteFired = false;
          // Clear the session so the UI returns to a fresh/startable state and
          // the backend can be marked completed via onComplete.
          set({ remainingMs: 0, running: false, sessionId: null, startedAt: null });
          onComplete?.(sessionId, minutes);
        } else {
          set({ remainingMs: remaining });
          // Fire a one-time warning when ~1 minute remains (#5).
          if (remaining <= 61_000 && remaining > 0 && !oneMinuteFired) {
            oneMinuteFired = true;
            onOneMinute?.();
          }
        }
      },

      start: () => {
        const { running, remainingMs, durationMs, sessionId } = get();
        if (running) return;
        if (!sessionId) return; // must have a session started via API
        // A finished session (0 remaining) must not resume — require a fresh start.
        if (remainingMs <= 0) return;
        // Resume: re-anchor startedAt based on remaining time.
        set({
          running: true,
          startedAt: Date.now() - (durationMs - remainingMs),
        });
        if (!intervalId) {
          intervalId = setInterval(() => get().tick(), 500);
        }
      },

      pause: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        // Freeze remaining at current value (tick already updated it).
        set({ running: false, startedAt: null });
      },

      reset: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        set({
          running: false,
          remainingMs: get().durationMs,
          startedAt: null,
          sessionId: null,
        });
      },
    }),
    {
      name: "clarityflow-timer",
      partialize: (s) => ({
        minutes: s.minutes,
        durationMs: s.durationMs,
        remainingMs: s.remainingMs,
        running: s.running,
        sessionId: s.sessionId,
        startedAt: s.startedAt,
        custom: s.custom,
      }),
      // Re-anchor remaining time from persisted startedAt after rehydrate
      // (handles tab closed + reopened where the countdown should continue).
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.running && state.startedAt) {
          const remaining = (state.startedAt + state.durationMs) - Date.now();
          if (remaining <= 0) {
            // Session expired while away — stop cleanly; backend session
            // stays active and will be auto-cancelled/restored on next load.
            state.setRunning(false);
            state.setSessionId(null);
          } else {
            state.remainingMs = remaining;
            // Restart the interval.
            if (!intervalId) {
              intervalId = setInterval(() => useTimerStore.getState().tick(), 500);
            }
          }
        }
      },
    },
  ),
);
