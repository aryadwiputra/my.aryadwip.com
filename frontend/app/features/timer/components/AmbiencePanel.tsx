import { useEffect, useState } from "react";
import { Volume2, Wind } from "lucide-react";
import {
  AMBIENT_TYPES,
  MURATTAL_SURAHS,
  isAmbientOn,
  isMurattalPlaying,
  loadSavedSurah,
  loadSavedType,
  saveSurah,
  saveType,
  setAmbientType,
  startAmbient,
  startMurattal,
  stopAmbient,
  stopMurattal,
  type AmbientType,
} from "../ambient";

interface AmbiencePanelProps {
  /** compact: row layout for narrow spaces (timer page). default: wrap grid. */
  compact?: boolean;
}

/**
 * Reusable ambience controls: nature sounds + Murattal Al-Qur'an + breath guide.
 * Uses the GLOBAL ambient engine, so state syncs across pages & focus mode.
 */
export function AmbiencePanel({ compact = false }: AmbiencePanelProps) {
  const [ambient, setAmbient] = useState(false);
  const [ambientType, setAmbientTypeState] = useState<AmbientType>(() =>
    typeof window !== "undefined" ? loadSavedType() : "rain",
  );
  const [murattal, setMurattal] = useState(false);
  const [murattalSurah, setMurattalSurah] = useState(() =>
    typeof window !== "undefined" ? loadSavedSurah() : "055",
  );
  const [breathGuide, setBreathGuide] = useState(false);

  // Reflect current global state on mount (e.g. ambience left running from focus mode).
  useEffect(() => {
    setAmbient(isAmbientOn());
    setMurattal(isMurattalPlaying());
  }, []);

  function toggleNature(t: AmbientType) {
    setAmbientTypeState(t);
    setAmbientType(t);
    saveType(t);
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
    saveSurah(s);
    if (isMurattalPlaying()) {
      startMurattal(s);
    }
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {/* Nature sounds */}
      <div className={compact ? "flex flex-wrap items-center gap-1.5" : "flex flex-wrap items-center justify-center gap-1.5"}>
        {AMBIENT_TYPES.map((a) => (
          <button
            key={a.type}
            onClick={() => toggleNature(a.type)}
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              ambientType === a.type && ambient
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:text-white"
            }`}
          >
            {a.emoji} {a.label}
          </button>
        ))}
      </div>

      {/* Murattal + breath */}
      <div className={compact ? "flex flex-wrap items-center gap-2" : "flex flex-wrap items-center justify-center gap-2"}>
        <button
          onClick={toggleMurattal}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
            murattal
              ? "border-emerald-500 bg-emerald-600 text-white"
              : "border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-300 dark:hover:text-white"
          }`}
        >
          <Volume2 className="h-3.5 w-3.5" />
          {murattal ? "Murattal On" : "Murattal"}
        </button>
        <select
          value={murattalSurah}
          onChange={(e) => selectMurattalSurah(e.target.value)}
          className="rounded-full border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
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
              : "border-gray-300 text-gray-600 hover:border-teal-500 hover:text-teal-600 dark:border-gray-700 dark:text-gray-300 dark:hover:text-white"
          }`}
        >
          <Wind className="h-3.5 w-3.5" />
          {breathGuide ? "Napas On" : "Napas 4-4-4-4"}
        </button>
      </div>

      {breathGuide && <BreathGuide />}
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
    <div className="flex flex-col items-center">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-600/20 text-teal-600 transition-all duration-[4000ms] ease-in-out dark:text-teal-300"
        style={{ transform: `scale(${scale})` }}
      >
        <span className="text-xs font-medium">{label}</span>
      </div>
    </div>
  );
}
