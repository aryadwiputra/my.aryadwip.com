import { create } from "zustand";

// Single module-level interval so only ONE countdown runs regardless of how
// many <Timer> instances are mounted (page + focus overlay).
let intervalId: ReturnType<typeof setInterval> | null = null;

interface TimerStore {
  minutes: number;
  remainingMs: number;
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
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  minutes: 25,
  remainingMs: 25 * 60_000,
  running: false,
  custom: "",
  sessionId: null,
  overlay: false,
  onComplete: null,

  setMinutes: (m) => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    set({ minutes: m, remainingMs: m * 60_000, running: false, custom: "" });
  },
  setCustom: (c) => set({ custom: c }),
  setRunning: (r) => set({ running: r }),
  setSessionId: (id) => set({ sessionId: id }),
  setOverlay: (v) => set({ overlay: v }),
  setOnComplete: (fn) => set({ onComplete: fn }),

  start: () => {
    if (get().running) return;
    set({ running: true });
    if (!intervalId) {
      intervalId = setInterval(() => get().tick(), 1000);
    }
  },
  pause: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    set({ running: false });
  },
  reset: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    set({ running: false, remainingMs: get().minutes * 60_000 });
  },
  tick: () => {
    const { remainingMs } = get();
    if (remainingMs <= 1000) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      set({ remainingMs: 0, running: false });
      get().onComplete?.();
    } else {
      set({ remainingMs: remainingMs - 1000 });
    }
  },
}));
