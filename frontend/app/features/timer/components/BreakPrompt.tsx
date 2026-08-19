import { useState } from "react";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { toastError, toastSuccess } from "~/lib/toast";
import { useTimerStore } from "~/features/timer/timerStore";
import { useStartSession } from "~/features/timer/hooks";

interface BreakPromptProps {
  open: boolean;
  minutes: number;
  onClose: () => void;
}

const BREAKS = [5, 15];

/**
 * Offered after a finished focus session: "Mulai istirahat 5/15 menit?"
 * Starts a short break session as a normal focus session.
 */
export function BreakPrompt({ open, minutes, onClose }: BreakPromptProps) {
  const startSession = useStartSession();
  const start = useTimerStore((s) => s.start);
  const setSessionId = useTimerStore((s) => s.setSessionId);
  const setMinutes = useTimerStore((s) => s.setMinutes);
  const setRunning = useTimerStore((s) => s.setRunning);
  const [starting, setStarting] = useState<number | null>(null);

  async function handleBreak(breakMin: number) {
    setStarting(breakMin);
    try {
      const session = await startSession.mutateAsync({ duration: breakMin });
      setSessionId(session.id);
      setMinutes(breakMin);
      useTimerStore.setState({
        startedAt: Date.now(),
        remainingMs: breakMin * 60_000,
        running: false,
      });
      start();
      toastSuccess(`Istirahat ${breakMin} menit dimulai ☕`);
      onClose();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal memulai istirahat");
    } finally {
      setStarting(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Sesi Selesai — Mau Istirahat?" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Kamu menyelesaikan {minutes} menit fokus. Ambil istirahat sebentar untuk memulihkan energi?
        </p>
        <div className="flex flex-col gap-2">
          {BREAKS.map((b) => (
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
