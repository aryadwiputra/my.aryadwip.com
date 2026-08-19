import { useEffect, useState, useCallback, type ReactNode } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import { startAmbient, stopAmbient, isAmbientOn } from "../ambient";

interface FocusModeProps {
  onExit: () => void;
  children: ReactNode;
  taskName?: string;
}

// Attempt to enter real browser fullscreen; falls back to overlay-only if the
// browser rejects it (some mobile browsers restrict requestFullscreen).
async function enterFullscreen(el: HTMLElement): Promise<boolean> {
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    }
    const w = el as unknown as { webkitRequestFullscreen?: () => Promise<void> };
    if (w.webkitRequestFullscreen) {
      await w.webkitRequestFullscreen();
      return true;
    }
  } catch {
    /* browser rejected fullscreen — fall back to overlay */
  }
  return false;
}

function exitFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    } else {
      const d = document as unknown as { webkitExitFullscreen?: () => void };
      if (d.webkitExitFullscreen) d.webkitExitFullscreen();
    }
  } catch {
    /* ignore */
  }
}

function isFullscreen(): boolean {
  return Boolean(
    document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement,
  );
}

export function FocusMode({ onExit, children, taskName }: FocusModeProps) {
  const [ambient, setAmbient] = useState(false);
  const [fsError, setFsError] = useState(false);

  const handleExit = useCallback(() => {
    if (isFullscreen()) exitFullscreen();
    onExit();
  }, [onExit]);

  // Enter real fullscreen on mount; fall back gracefully.
  useEffect(() => {
    const el = document.getElementById("focus-mode-root");
    if (el) {
      enterFullscreen(el).then((ok) => {
        if (!ok) setFsError(true);
      });
    }
    return () => {
      if (isFullscreen()) exitFullscreen();
    };
  }, []);

  // Esc exits both fullscreen and focus mode.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleExit]);

  // If the user leaves fullscreen manually (Esc browser) while still in focus
  // mode, close focus mode too (keeps everything in sync).
  useEffect(() => {
    function onChange() {
      if (!isFullscreen() && !fsError) {
        // exit fullscreen without re-entering; close focus mode
        onExit();
      }
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [onExit, fsError]);

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
    <div
      id="focus-mode-root"
      className="fixed inset-0 z-50 flex flex-col bg-gray-950"
    >
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
            onClick={handleExit}
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