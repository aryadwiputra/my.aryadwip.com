// #13 Ambient sounds — generated via WebAudio (no external files, offline-safe).
// Nature sounds: white noise (hujan), ocean, wind, fire, thunderstorm, forest.
// Plus optional Murattal Al-Qur'an streaming (needs internet).
// Plus breath guide (visual, no audio).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: AudioNode[] = [];
let active = false;
let currentType: AmbientType = "rain";

export type AmbientType =
  | "rain"
  | "ocean"
  | "wind"
  | "fire"
  | "thunder"
  | "forest";

export const AMBIENT_TYPES: { type: AmbientType; label: string; emoji: string }[] = [
  { type: "rain", label: "Hujan", emoji: "🌧️" },
  { type: "ocean", label: "Ombak", emoji: "🌊" },
  { type: "wind", label: "Angin", emoji: "🍃" },
  { type: "fire", label: "Perapian", emoji: "🔥" },
  { type: "thunder", label: "Badai", emoji: "⛈️" },
  { type: "forest", label: "Hutan", emoji: "🌲" },
];

function ensureCtx() {
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.12;
    master.connect(ctx.destination);
  }
  return ctx;
}

function makeNoiseBuffer(type: AmbientType): AudioBuffer {
  const ac = ensureCtx();
  const len = ac.sampleRate * 2;
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  let last2 = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    switch (type) {
      case "rain":
        // White noise with slight lowpass feel — steady rainfall.
        data[i] = white * 0.7 + Math.random() * 0.3;
        break;
      case "ocean":
        // Slow swell: brown-ish noise modulated by a slow sine.
        last = (last + 0.02 * white) / 1.02;
        const swell = 0.5 + 0.5 * Math.sin((i / ac.sampleRate) * Math.PI * 0.08);
        data[i] = last * 3.5 * (0.3 + 0.7 * swell);
        break;
      case "wind":
        // Soft highpass-ish hiss with gentle modulation.
        last = (last + 0.03 * white) / 1.03;
        const gust = 0.5 + 0.5 * Math.sin((i / ac.sampleRate) * Math.PI * 0.05 + Math.sin(i * 0.0001) * 2);
        data[i] = white * 0.4 * gust + last * 0.6;
        break;
      case "fire":
        // Crackling: bursty noise.
        const crackle = Math.random() < 0.02 ? Math.random() * 2 - 1 : 0;
        data[i] = white * 0.2 + crackle * 0.9;
        break;
      case "thunder":
        // Deep rumble: heavy brown noise with occasional boom.
        last = (last + 0.015 * white) / 1.015;
        const boom = Math.random() < 0.003 ? 1 : 0;
        data[i] = last * 4 * (0.6 + boom * 2);
        break;
      case "forest":
        // Gentle chirp-ish texture: noise + sparse tonal blips.
        last2 = (last2 + 0.02 * white) / 1.02;
        const chirp = Math.random() < 0.005 ? Math.sin(i * 0.15) * 0.3 : 0;
        data[i] = last2 * 1.5 + chirp;
        break;
    }
  }
  return buffer;
}

export function isAmbientOn(): boolean {
  return active;
}

export function getAmbientType(): AmbientType {
  return currentType;
}

export function setAmbientType(t: AmbientType) {
  currentType = t;
  if (active && !isMurattalPlaying()) {
    stopAmbient();
    startAmbient(t);
  }
}

export function startAmbient(type: AmbientType = "rain") {
  const ac = ensureCtx();
  if (!master) return;
  if (active) return;
  currentType = type;

  const src = ac.createBufferSource();
  src.buffer = makeNoiseBuffer(type);
  src.loop = true;
  src.connect(master!);
  src.start();
  nodes.push(src);
  active = true;
}

export function stopAmbient() {
  if (!ctx) return;
  nodes.forEach((n) => {
    try {
      (n as AudioBufferSourceNode).stop?.();
    } catch {
      /* ignore */
    }
    n.disconnect();
  });
  nodes = [];
  active = false;
}

export function toggleAmbient(): boolean {
  if (active) {
    stopAmbient();
    return false;
  }
  startAmbient(currentType);
  return true;
}

// ---------------- Murattal Al-Qur'an ----------------

let murattalAudio: HTMLAudioElement | null = null;

export const MURATTAL_SURAHS: { num: string; name: string }[] = [
  { num: "001", name: "Al-Fatihah" },
  { num: "018", name: "Al-Kahfi" },
  { num: "036", name: "Ya-Sin" },
  { num: "055", name: "Ar-Rahman" },
  { num: "067", name: "Al-Mulk" },
  { num: "112", name: "Al-Ikhlas" },
];

// Mishary Al-Afasy, 128kbps via mp3quran.net (free public CDN).
export const MURATTAL_BASE = "https://server8.mp3quran.net/afs/";

export function startMurattal(surah: string) {
  stopMurattal();
  const ac = ensureCtx();
  if (!master) return;
  // Duck ambient while murattal plays (keep it quiet underneath).
  if (master.gain.value > 0.12) master.gain.value = 0.12;
  const audio = new Audio(`${MURATTAL_BASE}${surah}.mp3`);
  audio.loop = false;
  audio.volume = 0.9;
  murattalAudio = audio;
  audio.play().catch(() => {
    /* autoplay/policy blocked */
  });
}

export function stopMurattal() {
  if (murattalAudio) {
    murattalAudio.pause();
    murattalAudio.src = "";
    murattalAudio = null;
  }
}

export function isMurattalPlaying(): boolean {
  return Boolean(murattalAudio && !murattalAudio.paused);
}

export function getMurattalSurah(): string | null {
  return murattalAudio?.src.split("/").pop()?.replace(".mp3", "") ?? null;
}

// Stop everything (ambient + murattal) — used when leaving focus mode.
export function stopAll() {
  stopAmbient();
  stopMurattal();
}
