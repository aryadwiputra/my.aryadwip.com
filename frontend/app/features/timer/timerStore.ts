import { create } from "zustand";
import { persist } from "zustand/middleware";

// Single module-level interval so only ONE countdown runs regardless of how
// many <Timer> instances are mounted (page + focus overlay).
let intervalId: ReturnType<typeof setInterval> | null = null;

interface TimerStore {
  minutes: number;
  durationMs: number;
  startedAt: number | null; // epoch ms when the session started (or resumed)
  running: boolean;
  custom: string;
  sessionId: string | null;
  overlay: boolean;
  onComplete: (() => void) | null;
  setMinutes: (m: number) => void;
  setCustom: (c: string) => void;
  setRunning: (r: boolean) => void;
  setSessionId: (id: string | null) => void;
  setOverlay: (v: boolean) => void;
  setOnComplete: (fn: (() => void) | null) => void;
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
      },

      tick: () => {
        const { startedAt, durationMs, onComplete } = get();
        if (!startedAt) return;
        const remaining = (startedAt + durationMs) - Date.now();
        if (remaining <= 0) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          set({ remainingMs: 0, running: false });
          onComplete?.();
        } else {
          set({ remainingMs: remaining });
        }
      },

      start: () => {
        const { running, remainingMs, sessionId } = get();
        if (running) return;
        if (!sessionId) return; // must have a session started via API
        // Resume: re-anchor startedAt based on remaining time.
        set({
          running: true,
          startedAt: Date.now() - (get().durationMs - remainingMs),
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
