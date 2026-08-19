import { useEffect, useState, type ReactNode } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import { startAmbient, stopAmbient, isAmbientOn } from "../ambient";

interface FocusModeProps {
  onExit: () => void;
  children: ReactNode;
  taskName?: string;
}

export function FocusMode({ onExit, children, taskName }: FocusModeProps) {
  const [ambient, setAmbient] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  // Stop ambient sound when leaving focus mode.
  useEffect(() => {
    return () => {
      if (isAmbientOn()) stopAmbient();
    };
  }, []);

  function toggleSound() {
    if (ambient) {
      stopAmbient();
      setAmbient(false);
    } else {
      startAmbient("rain");
      setAmbient(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Mode Fokus</p>
          {taskName && (
            <p className="truncate text-sm font-medium text-gray-300">{taskName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            aria-label={ambient ? "Matikan suara ambience" : "Nyalakan suara ambience"}
            title={ambient ? "Matikan ambience" : "Nyalakan ambience (hujan)"}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition hover:bg-gray-800 ${
              ambient
                ? "border-blue-500 text-blue-300"
                : "border-gray-700 text-gray-300 hover:text-white"
            }`}
          >
            {ambient ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {ambient ? "Ambience On" : "Ambience"}
          </button>
          <button
            onClick={onExit}
            aria-label="Keluar dari mode fokus"
            className="flex items-center gap-1.5 rounded-full border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
          >
            <X className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </div>

      {/* Timer centered */}
      <div className="flex flex-1 items-center justify-center px-4">{children}</div>

      {/* Hint */}
      <p className="pb-[max(env(safe-area-inset-bottom),1rem)] text-center text-xs text-gray-600">
        Tekan <span className="rounded bg-gray-800 px-1.5 py-0.5 text-gray-400">Esc</span> untuk keluar
      </p>
    </div>
  );
}
