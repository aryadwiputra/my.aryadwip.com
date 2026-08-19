import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { cn } from "~/lib/cn";
import { todayStr } from "~/lib/date";
import { toastError, toastSuccess } from "~/lib/toast";
import type { Journal, JournalPayload, JournalSlot, Mood } from "~/lib/types";
import { ENERGY_LEVELS, MOOD_OPTIONS, MORNING_PROMPTS, EVENING_PROMPTS } from "../const";
import { useCreateJournal, useDeleteJournal, useUpdateJournal } from "../hooks";

interface JournalFormProps {
  journal?: Journal | null;
  slot: JournalSlot;
  onSlotChange: (slot: JournalSlot) => void;
  onSaved?: () => void;
}

export function JournalForm({ journal, slot, onSlotChange, onSaved }: JournalFormProps) {
  const createMutation = useCreateJournal();
  const updateMutation = useUpdateJournal();
  const deleteMutation = useDeleteJournal();

  const [mood, setMood] = useState<Mood | null>(journal?.mood as Mood | null ?? null);
  const [energy, setEnergy] = useState<number | null>(journal?.energy ?? null);
  const [noScroll, setNoScroll] = useState<boolean>(journal?.noScroll ?? false);
  const [quickMode, setQuickMode] = useState(false);
  const [prompts, setPrompts] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        [...MORNING_PROMPTS, ...EVENING_PROMPTS].map((p) => [p.key, journal?.prompts?.[p.key] ?? ""]),
      ),
  );

  const isEditing = Boolean(journal);
  const saving = createMutation.isPending || updateMutation.isPending;
  const isMorning = slot === "morning";
  const promptList = isMorning ? MORNING_PROMPTS : EVENING_PROMPTS;

  const payload: JournalPayload = {
    slot,
    mood: mood ?? undefined,
    energy: energy ?? undefined,
    noScroll,
    prompts,
  };

  function setPrompt(key: string, value: string) {
    setPrompts((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEditing && journal) {
        await updateMutation.mutateAsync({ id: journal.id, ...payload });
        toastSuccess("Journal diperbarui");
      } else {
        await createMutation.mutateAsync({ date: todayStr(), ...payload });
        toastSuccess(isMorning ? "Journal pagi tersimpan" : "Journal malam tersimpan");
      }
      onSaved?.();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menyimpan journal");
    }
  }

  return (
    <Card
      title={isEditing ? "Edit Journal" : isMorning ? "Journal Pagi" : "Journal Malam"}
      description={
        isEditing
          ? undefined
          : isMorning
            ? "Atur niat & energi untuk memulai hari dengan jelas."
            : "Tutup hari dengan refleksi — apa yang berjalan baik dan pelajarannya."
      }
    >
      {/* Slot switcher */}
      <div className="mb-5 flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => onSlotChange("morning")}
          className={cn(
            "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition",
            isMorning ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 dark:text-gray-300",
          )}
        >
          🌅 Pagi
        </button>
        <button
          type="button"
          onClick={() => onSlotChange("evening")}
          className={cn(
            "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition",
            !isMorning ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 dark:text-gray-300",
          )}
        >
          🌙 Malam
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mood */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {isMorning ? "Bagaimana perasaanmu sekarang?" : "Bagaimana perasaanmu di penghujung hari?"}
          </p>
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

        {/* Quick mode toggle */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setQuickMode((v) => !v)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              quickMode
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700",
            )}
          >
            ⚡ Mode 30 Detik {quickMode ? "ON" : "OFF"}
          </button>
        </div>

        {/* Prompts — quick mode shows a single free-text area */}
        {quickMode ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {isMorning ? "Apa 1 hal yang penting hari ini?" : "Bagaimana harimu dalam 1 kalimat?"}
            </label>
            <textarea
              rows={3}
              placeholder={isMorning ? "Niat singkat untuk hari ini..." : "Refleksi singkat hari ini..."}
              value={prompts[isMorning ? "intention" : "wentWell"] ?? ""}
              onChange={(e) => setPrompt(isMorning ? "intention" : "wentWell", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-400">Selesai dalam 30 detik — yang penting tercatat.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promptList.map((p) => (
              <div key={p.key}>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {p.label}
                </label>
                <textarea
                  rows={3}
                  placeholder={p.placeholder}
                  value={prompts[p.key] ?? ""}
                  onChange={(e) => setPrompt(p.key, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            ))}
          </div>
        )}

        {/* No-scroll toggle (evening only) */}
        {!isMorning && (
          <button
            type="button"
            onClick={() => setNoScroll((v) => !v)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition",
              noScroll
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300",
            )}
          >
            <span className="flex items-center gap-2">
              🚫 Hari ini bebas doomscroll?
            </span>
            <span className={cn("flex h-5 w-9 items-center rounded-full p-0.5 transition", noScroll ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600")}>
              <span className={cn("h-4 w-4 rounded-full bg-white shadow transition", noScroll && "translate-x-4")} />
            </span>
          </button>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={saving} className="flex-1">
            {isEditing ? "Simpan Perubahan" : isMorning ? "Simpan Journal Pagi" : "Simpan Journal Malam"}
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
