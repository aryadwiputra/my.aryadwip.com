import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Modal } from "~/components/ui/Modal";
import { toastError, toastSuccess } from "~/lib/toast";
import type { Note } from "~/lib/types";
import { TagInput } from "~/features/shared/TagInput";
import { useCreateNote, useUpdateNote } from "../hooks";

interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  note?: Note | null;
}

export function NoteForm({ open, onClose, note }: NoteFormProps) {
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const isEditing = Boolean(note);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? "");
      setContent(note?.content ?? "");
      setSource(note?.source ?? "");
      setTags(note?.tags ?? []);
    }
  }, [open, note]);

  const saving = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toastError("Judul wajib diisi");
      return;
    }
    try {
      if (isEditing && note) {
        await updateMutation.mutateAsync({
          id: note.id,
          title: title.trim(),
          content,
          source: source || undefined,
          tags,
        });
        toastSuccess("Note diperbarui");
      } else {
        await createMutation.mutateAsync({
          title: title.trim(),
          content,
          source: source || undefined,
          tags,
        });
        toastSuccess("Note disimpan");
      }
      onClose();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menyimpan note");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit Note" : "Note Baru"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Judul *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul catatan"
          autoFocus
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Isi</label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={inputClass}
            placeholder="Tulis insight, ringkasan, atau pemikiran (markdown)."
          />
        </div>
        <Input
          label="Sumber (opsional)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Contoh: Buku Atomic Habits"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
          <TagInput value={tags} onChange={setTags} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={saving}>
            {isEditing ? "Simpan" : "Buat Note"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}