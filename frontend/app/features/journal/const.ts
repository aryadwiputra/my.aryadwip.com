import type { Mood } from "~/lib/types";

export const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: "great", emoji: "😄", label: "Hebat" },
  { value: "good", emoji: "🙂", label: "Baik" },
  { value: "okay", emoji: "😐", label: "Biasa" },
  { value: "low", emoji: "😕", label: "Rendah" },
  { value: "bad", emoji: "😞", label: "Buruk" },
];

export const ENERGY_LEVELS = [1, 2, 3, 4, 5] as const;

export const PROMPT_FIELDS = [
  { key: "gratitude" as const, label: "Rasa Syukur", placeholder: "Apa yang kamu syukuri hari ini?" },
  { key: "intention" as const, label: "Niat Hari Ini", placeholder: "Apa fokus utama yang ingin kamu capai?" },
  { key: "affirmation" as const, label: "Afirmasi", placeholder: "Kalimat positif untuk dirimu sendiri." },
];