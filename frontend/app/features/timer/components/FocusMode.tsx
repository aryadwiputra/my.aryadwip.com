import { useEffect, useState, useCallback, type ReactNode } from "react";
import { X, Volume2, VolumeX, Wind } from "lucide-react";
import {
  AMBIENT_TYPES,
  MURATTAL_SURAHS,
  isAmbientOn,
  isMurattalPlaying,
  setAmbientType,
  startAmbient,
  startMurattal,
  stopAll,
  stopAmbient,
  stopMurattal,
  type AmbientType,
} from "../ambient";

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
  const [ambient, setAmbient] = useState(false);
  const [ambientType, setAmbientTypeState] = useState<AmbientType>("rain");
  const [murattal, setMurattal] = useState(false);
  const [murattalSurah, setMurattalSurah] = useState("055");
  const [breathGuide, setBreathGuide] = useState(false);
  const [fsError, setFsError] = useState(false);

  const handleExit = useCallback(() => {
    stopAll();
    if (isFullscreen()) exitFullscreen();
    onExit();
  }, [onExit]);

  useEffect(() => {
    const el = document.getElementById("focus-mode-root");
    if (el) {
      enterFullscreen(el).then((ok) => {
        if (!ok) setFsError(true);
      });
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
      if (!isFullscreen() && !fsError) {
        stopAll();
        onExit();
      }
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [onExit, fsError]);

  function toggleNature(t: AmbientType) {
    setAmbientTypeState(t);
    setAmbientType(t);
    if (murattal) {
      stopMurattal();
      setMurattal(false);
    }
    if (isAmbientOn()) {
      stopAmbient();
      startAmbient(t);
    } else {
      startAmbient(t);
      setAmbient(true);
    }
  }

  function toggleMurattal() {
    if (isMurattalPlaying()) {
      stopMurattal();
      setMurattal(false);
      return;
    }
    if (isAmbientOn()) {
      stopAmbient();
      setAmbient(false);
    }
    startMurattal(murattalSurah);
    setMurattal(true);
  }

  function selectMurattalSurah(s: string) {
    setMurattalSurah(s);
    if (isMurattalPlaying()) {
      startMurattal(s);
    }
  }

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
        <div className="flex items-center gap-2">
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

      {/* Ambience controls */}
      <div className="mx-auto w-full max-w-lg px-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        {/* Nature sounds grid */}
        <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5">
          {AMBIENT_TYPES.map((a) => (
            <button
              key={a.type}
              onClick={() => toggleNature(a.type)}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                ambientType === a.type && ambient
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-gray-700 text-gray-300 hover:border-blue-500 hover:text-white"
              }`}
            >
              {a.emoji} {a.label}
            </button>
          ))}
        </div>

        {/* Murattal + breath */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={toggleMurattal}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
              murattal
                ? "border-emerald-500 bg-emerald-600 text-white"
                : "border-gray-700 text-gray-300 hover:border-emerald-500 hover:text-white"
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            {murattal ? "Murattal On" : "Murattal"}
          </button>
          <select
            value={murattalSurah}
            onChange={(e) => selectMurattalSurah(e.target.value)}
            className="rounded-full border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs text-gray-300"
            aria-label="Pilih surah"
          >
            {MURATTAL_SURAHS.map((s) => (
              <option key={s.num} value={s.num}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setBreathGuide((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
              breathGuide
                ? "border-teal-500 bg-teal-600 text-white"
                : "border-gray-700 text-gray-300 hover:border-teal-500 hover:text-white"
            }`}
          >
            <Wind className="h-3.5 w-3.5" />
            {breathGuide ? "Napas On" : "Napas 4-4-4-4"}
          </button>
        </div>

        {/* Breath guide visual */}
        {breathGuide && <BreathGuide />}

        <p className="mt-2 text-center text-xs text-gray-600">
          Tekan <span className="rounded bg-gray-800 px-1.5 py-0.5 text-gray-400">Esc</span> untuk keluar
        </p>
      </div>
    </div>
  );
}

// Box breathing 4-4-4-4 visual guide (no audio).
function BreathGuide() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setPhase("inhale");
      setScale(0.6);
      t = setTimeout(() => {
        setPhase("hold");
        setScale(1);
        t = setTimeout(() => {
          setPhase("exhale");
          setScale(0.6);
          t = setTimeout(cycle, 4000);
        }, 4000);
      }, 4000);
    };
    cycle();
    return () => clearTimeout(t);
  }, []);

  const label =
    phase === "inhale" ? "Tarik napas 4 detik" : phase === "hold" ? "Tahan 4 detik" : "Hembuskan 4 detik";

  return (
    <div className="mt-3 flex flex-col items-center">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-600/20 text-teal-300 transition-all duration-[4000ms] ease-in-out"
        style={{ transform: `scale(${scale})` }}
      >
        <span className="text-xs font-medium">{label}</span>
      </div>
    </div>
  );
}
