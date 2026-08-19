import { useEffect } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { cn } from "~/lib/cn";
import { toastError } from "~/lib/toast";
import { useTimerStore } from "../timerStore";
import { useEndSession, useStartSession } from "../hooks";

const PRESETS = [25, 50, 90];

function format(ms: number) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch {
    /* audio unavailable */
  }
}

interface TimerProps {
  taskId?: string;
  onComplete?: (minutes: number) => void;
  variant?: "default" | "dark";
}

export function Timer({ taskId, onComplete, variant = "default" }: TimerProps) {
  const overlay = useTimerStore((s) => s.overlay);
  const onDark = variant === "dark" || overlay;
  const startMutation = useStartSession();
  const endMutation = useEndSession();

  const minutes = useTimerStore((s) => s.minutes);
  const remainingMs = useTimerStore((s) => s.remainingMs);
  const running = useTimerStore((s) => s.running);
  const custom = useTimerStore((s) => s.custom);
  const sessionId = useTimerStore((s) => s.sessionId);
  const setMinutes = useTimerStore((s) => s.setMinutes);
  const setCustom = useTimerStore((s) => s.setCustom);
  const setSessionId = useTimerStore((s) => s.setSessionId);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const reset = useTimerStore((s) => s.reset);

  const totalMs = minutes * 60_000;
  const progress = totalMs > 0 ? 1 - remainingMs / totalMs : 0;

  async function handleStart() {
    if (running) {
      pause();
      return;
    }
    // resume from pause — same session continues
    if (sessionId) {
      start();
      return;
    }
    // fresh start — create backend session, then anchor & run
    try {
      const session = await startMutation.mutateAsync({ duration: minutes, taskId });
      setSessionId(session.id);
      // Anchor the start time but leave running=false so start() begins the
      // interval (start() bails early if running is already true).
      useTimerStore.setState({
        startedAt: Date.now(),
        remainingMs: minutes * 60_000,
        running: false,
      });
      start();
    } catch (err) {
      pause();
      toastError(err instanceof Error ? err.message : "Gagal memulai sesi");
    }
  }

  async function handleReset() {
    reset();
    if (sessionId) {
      try {
        await endMutation.mutateAsync({ id: sessionId, status: "cancelled" });
      } catch {
        /* ignore */
      }
      setSessionId(null);
    }
  }

  function selectMinutes(m: number) {
    if (sessionId) {
      endMutation.mutate({ id: sessionId, status: "cancelled" });
      setSessionId(null);
    }
    setMinutes(m);
  }

  function applyCustom() {
    const n = parseInt(custom, 10);
    if (isNaN(n) || n < 1 || n > 600) {
      toastError("Durasi harus 1-600 menit");
      return;
    }
    selectMinutes(n);
  }

  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress ring */}
      <div className="relative h-56 w-56">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            strokeWidth="10"
            className={onDark ? "stroke-gray-800" : "stroke-gray-200 dark:stroke-gray-700"}
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="stroke-blue-500 transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-5xl font-semibold tabular-nums",
              onDark ? "text-white" : "text-gray-900 dark:text-white",
            )}
          >
            {format(remainingMs)}
          </span>
          <span
            className={cn(
              "mt-1 text-sm",
              onDark ? "text-gray-400" : "text-gray-500 dark:text-gray-400",
            )}
          >
            {running ? "Fokus..." : remainingMs === totalMs ? "Siap mulai" : "Dijeda"}
          </span>
        </div>
      </div>

      {/* Presets + custom */}
      <div className="flex items-center gap-2">
        {PRESETS.map((m) => (
          <button
            key={m}
            onClick={() => selectMinutes(m)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition",
              minutes === m && !custom
                ? "border-blue-600 bg-blue-600 text-white"
                : onDark
                  ? "border-gray-700 text-gray-300 hover:border-blue-500"
                  : "border-gray-300 text-gray-700 hover:border-blue-500 dark:border-gray-700 dark:text-gray-200",
            )}
          >
            {m} min
          </button>
        ))}
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onBlur={applyCustom}
          onKeyDown={(e) => e.key === "Enter" && applyCustom()}
          placeholder="Custom"
          inputMode="numeric"
          className={cn(
            "w-24 rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none",
            onDark
              ? "border-gray-700 bg-gray-900 text-white"
              : "border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white",
          )}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button onClick={handleStart} size="lg" className="min-w-32">
          {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          {running ? "Jeda" : remainingMs < totalMs ? "Lanjut" : "Mulai"}
        </Button>
        <Button variant="secondary" size="lg" onClick={handleReset} aria-label="Reset">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
