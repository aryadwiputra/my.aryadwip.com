import { useState } from "react";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";
import { toastError, toastSuccess } from "~/lib/toast";
import { todayStr } from "~/lib/date";
import { useCreateJournal } from "~/features/journal/hooks";

interface FocusJournalPromptProps {
  open: boolean;
  minutes: number;
  taskName?: string;
  onClose: () => void;
}

export function FocusJournalPrompt({ open, minutes, taskName, onClose }: FocusJournalPromptProps) {
  const createJournal = useCreateJournal();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await createJournal.mutateAsync({
        date: todayStr(),
        slot: "evening",
        mood: "good",
        energy: 4,
        prompts: { wentWell: note.trim() || undefined, win: `Selesai sesi fokus ${minutes} menit` },
      });
      toastSuccess("Journal tersimpan ✨");
      setNote("");
      onClose();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menyimpan journal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Sesi Fokus Selesai 🎉" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {taskName
            ? `Kamu menyelesaikan ${minutes} menit fokus untuk "${taskName}".`
            : `Kamu menyelesaikan ${minutes} menit fokus.`}{" "}
          Apa yang kamu kerjakan?
        </p>
        <textarea
          autoFocus
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tulis ringkasan singkat pekerjaanmu..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Lewati
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Simpan ke Journal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
