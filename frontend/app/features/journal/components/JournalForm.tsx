import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { cn } from "~/lib/cn";
import { todayStr } from "~/lib/date";
import { toastError, toastSuccess } from "~/lib/toast";
import type { Journal, JournalPayload, Mood } from "~/lib/types";
import { ENERGY_LEVELS, MOOD_OPTIONS, PROMPT_FIELDS } from "../const";
import { useCreateJournal, useDeleteJournal, useUpdateJournal } from "../hooks";

interface JournalFormProps {
  journal?: Journal | null;
  onSaved?: () => void;
}

export function JournalForm({ journal, onSaved }: JournalFormProps) {
  const createMutation = useCreateJournal();
  const updateMutation = useUpdateJournal();
  const deleteMutation = useDeleteJournal();

  const [mood, setMood] = useState<Mood | null>(journal?.mood ?? null);
  const [energy, setEnergy] = useState<number | null>(journal?.energy ?? null);
  const [gratitude, setGratitude] = useState(journal?.prompts.gratitude ?? "");
  const [intention, setIntention] = useState(journal?.prompts.intention ?? "");
  const [affirmation, setAffirmation] = useState(journal?.prompts.affirmation ?? "");

  const isEditing = Boolean(journal);
  const saving = createMutation.isPending || updateMutation.isPending;

  const payload: JournalPayload = {
    mood: mood ?? undefined,
    energy: energy ?? undefined,
    prompts: { gratitude, intention, affirmation },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEditing && journal) {
        await updateMutation.mutateAsync({ id: journal.id, ...payload });
        toastSuccess("Journal diperbarui");
      } else {
        await createMutation.mutateAsync({ date: todayStr(), ...payload });
        toastSuccess("Journal hari ini tersimpan");
      }
      onSaved?.();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menyimpan journal");
    }
  }

  return (
    <Card
      title={isEditing ? "Edit Journal" : "Journal Hari Ini"}
      description={isEditing ? undefined : "Tulis refleksi pagimu untuk memulai hari dengan jelas."}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mood */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Bagaimana perasaanmu?</p>
          <div className="flex gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                type="button"
                title={m.label}
                onClick={() => setMood(m.value)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl border text-2xl transition",
                  mood === m.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800",
                )}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Level energi (1-5)
          </p>
          <div className="flex gap-2">
            {ENERGY_LEVELS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEnergy(n)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition",
                  energy === n
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Prompts */}
        <div className="space-y-4">
          {PROMPT_FIELDS.map((p) => (
            <div key={p.key}>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {p.label}
              </label>
              <textarea
                rows={3}
                placeholder={p.placeholder}
                value={p.key === "gratitude" ? gratitude : p.key === "intention" ? intention : affirmation}
                onChange={(e) => {
                  const v = e.target.value;
                  if (p.key === "gratitude") setGratitude(v);
                  else if (p.key === "intention") setIntention(v);
                  else setAffirmation(v);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={saving} className="flex-1">
            {isEditing ? "Simpan Perubahan" : "Simpan Journal"}
          </Button>
          {isEditing && journal && (
            <Button
              type="button"
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={async (e) => {
                e.preventDefault();
                if (!confirm("Hapus journal ini?")) return;
                try {
                  await deleteMutation.mutateAsync(journal.id);
                  toastSuccess("Journal dihapus");
                  onSaved?.();
                } catch (err) {
                  toastError(err instanceof Error ? err.message : "Gagal menghapus journal");
                }
              }}
            >
              Hapus
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}