import { useState } from "react";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { toastSuccess } from "~/lib/toast";
import { useTimerStore } from "~/features/timer/timerStore";

interface BreakPromptProps {
  open: boolean;
  minutes: number;
  onClose: () => void;
}

const BREAKS = [5, 15];
const LONG_BREAKS = [15, 30];
const LONG_BREAK_AFTER = 4; // offer a long break after this many pomodoros

/**
 * Offered after a finished focus session: "Mulai istirahat?"
 * Short break after every session; long break after every 4 sessions.
 *
 * Breaks are CLIENT-ONLY (isBreak=true): they run as a countdown but do NOT
 * create a backend session, so they never pollute focus stats / pomodoro count.
 */
export function BreakPrompt({ open, minutes, onClose }: BreakPromptProps) {
  const start = useTimerStore((s) => s.start);
  const setMinutes = useTimerStore((s) => s.setMinutes);
  const setIsBreak = useTimerStore((s) => s.setIsBreak);
  const pomodoroCount = useTimerStore((s) => s.pomodoroCount);
  const [starting, setStarting] = useState<number | null>(null);

  const isLongBreak = pomodoroCount % LONG_BREAK_AFTER === 0;
  const options = isLongBreak ? LONG_BREAKS : BREAKS;

  function handleBreak(breakMin: number) {
    setStarting(breakMin);
    // Client-only break: no backend session, isBreak=true so it's not counted.
    setIsBreak(true);
    setMinutes(breakMin);
    useTimerStore.setState({
      startedAt: Date.now(),
      remainingMs: breakMin * 60_000,
      running: false,
      sessionId: null,
      isBreak: true,
    });
    start();
    toastSuccess(`Istirahat ${breakMin} menit dimulai ☕`);
    onClose();
    setStarting(null);
  }

  return (
    <Modal open={open} onClose={onClose} title="Sesi Selesai — Mau Istirahat?" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Kamu menyelesaikan {minutes} menit fokus.
          {isLongBreak
            ? " Kamu sudah 4 sesi fokus — ambil istirahat panjang! 🎉"
            : " Ambil istirahat sebentar untuk memulihkan energi?"}
        </p>
        <div className="flex flex-col gap-2">
          {options.map((b) => (
            <Button key={b} variant="secondary" onClick={() => handleBreak(b)} loading={starting === b}>
              Istirahat {b} menit
            </Button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Lewati
          </Button>
        </div>
      </div>
    </Modal>
  );
}
