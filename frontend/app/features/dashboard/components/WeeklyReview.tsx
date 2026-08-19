import { useState, useEffect } from "react";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { api } from "~/lib/api";
import { toastError, toastSuccess } from "~/lib/toast";
import { cn } from "~/lib/cn";

const REVIEW_PROMPTS = [
  { key: "whatWentWell", label: "Apa yang berjalan baik minggu ini?" },
  { key: "whatToImprove", label: "Apa yang bisa ditingkatkan?" },
  { key: "nextPriorities", label: "3 prioritas utama minggu depan?" },
];

function getWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dayStr = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dayStr}`;
}

interface ReviewData {
  whatWentWell?: string | null;
  whatToImprove?: string | null;
  nextPriorities?: string | null;
}

export function WeeklyReview() {
  const [answers, setAnswers] = useState<ReviewData>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingReview, setLoadingReview] = useState(true);
  const weekStart = getWeekStart();

  useEffect(() => {
    loadReview();
  }, []);

  async function loadReview() {
    try {
      const res = await api<{ review: ReviewData | null }>(`/api/dashboard/reviews?weekStart=${weekStart}`);
      if (res.review) {
        setAnswers({
          whatWentWell: res.review.whatWentWell ?? "",
          whatToImprove: res.review.whatToImprove ?? "",
          nextPriorities: res.review.nextPriorities ?? "",
        });
      }
    } catch {
      // ignore
    } finally {
      setLoadingReview(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      await api("/api/dashboard/reviews", {
        method: "POST",
        body: {
          weekStart,
          whatWentWell: answers.whatWentWell?.trim() || undefined,
          whatToImprove: answers.whatToImprove?.trim() || undefined,
          nextPriorities: answers.nextPriorities?.trim() || undefined,
        },
      });
      setSaved(true);
      toastSuccess("Review mingguan tersimpan");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menyimpan review");
    } finally {
      setLoading(false);
    }
  }

  const hasContent = answers.whatWentWell || answers.whatToImprove || answers.nextPriorities;

  return (
    <Card title="Weekly Review" description="Refleksi mingguan — tersimpan otomatis.">
      <div className="space-y-4">
        {REVIEW_PROMPTS.map((p) => (
          <div key={p.key}>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {p.label}
            </label>
            <textarea
              rows={2}
              value={answers[p.key as keyof ReviewData] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [p.key]: e.target.value }))}
              placeholder="Tulis refleksimu..."
              className={cn(
                "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white",
                loading && "opacity-50 cursor-wait",
              )}
              disabled={loading}
            />
          </div>
        ))}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Minggu mulai {weekStart}
          </span>
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={!hasContent || loading}
            className={cn(saved && "bg-green-600 hover:bg-green-700")}
          >
            {saved ? "✓ Tersimpan" : "Simpan Review"}
          </Button>
        </div>
      </div>
    </Card>
  );
}