import { useState } from "react";
import { Card } from "~/components/ui/Card";

const REVIEW_PROMPTS = [
  { key: "well", label: "Apa yang berjalan baik minggu ini?" },
  { key: "improve", label: "Apa yang bisa ditingkatkan?" },
  { key: "next", label: "3 prioritas utama minggu depan?" },
];

export function WeeklyReview() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <Card title="Weekly Review" description="Refleksi mingguan — disimpan lokal di perangkat ini.">
      <div className="space-y-4">
        {REVIEW_PROMPTS.map((p) => (
          <div key={p.key}>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {p.label}
            </label>
            <textarea
              rows={2}
              value={answers[p.key] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [p.key]: e.target.value }))}
              placeholder="Tulis refleksimu..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}