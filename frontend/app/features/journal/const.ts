import type { Mood } from "~/lib/types";

export const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: "great", emoji: "😄", label: "Hebat" },
  { value: "good", emoji: "🙂", label: "Baik" },
  { value: "okay", emoji: "😐", label: "Biasa" },
  { value: "low", emoji: "😕", label: "Rendah" },
  { value: "bad", emoji: "😞", label: "Buruk" },
];

export const ENERGY_LEVELS = [1, 2, 3, 4, 5] as const;

export const MORNING_PROMPTS = [
  { key: "intention" as const, label: "Niat Hari Ini", placeholder: "Apa 1 fokus utama yang ingin kamu capai hari ini?" },
  { key: "gratitude" as const, label: "Rasa Syukur", placeholder: "Apa yang kamu syukuri hari ini? Semakin spesifik semakin baik." },
  { key: "affirmation" as const, label: "Afirmasi", placeholder: "Kalimat positif untuk dirimu sendiri." },
];

export const EVENING_PROMPTS = [
  { key: "win" as const, label: "Win of the Day", placeholder: "Apa 1 kemenangan kecil hari ini, sekecil apa pun?" },
  { key: "wentWell" as const, label: "Apa yang Berjalan Baik", placeholder: "Apa yang berjalan baik hari ini?" },
  { key: "toImprove" as const, label: "Yang Bisa Ditingkatkan", placeholder: "Apa yang bisa lebih baik?" },
  { key: "lesson" as const, label: "Pelajaran", placeholder: "Apa yang kamu pelajari hari ini?" },
];