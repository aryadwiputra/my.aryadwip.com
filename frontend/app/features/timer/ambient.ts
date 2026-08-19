// #13 Ambient sounds — generated via WebAudio (no external files, offline-safe).
// Provides white noise / rain-like ambience and a "lofi-ish" brown noise.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: AudioNode[] = [];
let active = false;
let currentType: "white" | "rain" = "white";

function ensureCtx() {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.12;
    master.connect(ctx.destination);
  }
  return ctx;
}

function makeNoiseBuffer(type: "white" | "rain"): AudioBuffer {
  const ac = ensureCtx();
  const len = ac.sampleRate * 2;
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (type === "white") {
      data[i] = white;
    } else {
      // Brown-ish noise (deeper, rain-like) via leaky integrator.
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buffer;
}

export function isAmbientOn(): boolean {
  return active;
}

export function getAmbientType(): "white" | "rain" {
  return currentType;
}

export function setAmbientType(t: "white" | "rain") {
  currentType = t;
  if (active) {
    stopAmbient();
    startAmbient(t);
  }
}

export function startAmbient(type: "white" | "rain" = "white") {
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
