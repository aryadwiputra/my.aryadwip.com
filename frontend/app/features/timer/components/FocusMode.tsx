import { useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";
import { stopAll } from "../ambient";
import { AmbiencePanel } from "./AmbiencePanel";

interface FocusModeProps {
  onExit: () => void;
  children: ReactNode;
  taskName?: string;
}

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
    /* browser rejected */
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
  const handleExit = useCallback(() => {
    stopAll();
    if (isFullscreen()) exitFullscreen();
    onExit();
  }, [onExit]);

  useEffect(() => {
    const el = document.getElementById("focus-mode-root");
    if (el) {
      enterFullscreen(el);
    }
    return () => {
      stopAll();
      if (isFullscreen()) exitFullscreen();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleExit]);

  useEffect(() => {
    function onChange() {
      if (!isFullscreen()) {
        stopAll();
        onExit();
      }
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [onExit]);

  return (
    <div id="focus-mode-root" className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Mode Fokus</p>
          {taskName && (
            <p className="truncate text-sm font-medium text-gray-300">{taskName}</p>
          )}
        </div>
        <button
          onClick={handleExit}
          aria-label="Keluar dari mode fokus"
          className="flex items-center gap-1.5 rounded-full border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
        >
          <X className="h-4 w-4" />
          Keluar
        </button>
      </div>

      {/* Timer centered */}
      <div className="flex flex-1 items-center justify-center px-4">{children}</div>

      {/* Ambience controls (reusable panel) */}
      <div className="mx-auto w-full max-w-lg px-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <AmbiencePanel />
        <p className="mt-2 text-center text-xs text-gray-600">
          Tekan <span className="rounded bg-gray-800 px-1.5 py-0.5 text-gray-400">Esc</span> untuk keluar
        </p>
      </div>
    </div>
  );
}
