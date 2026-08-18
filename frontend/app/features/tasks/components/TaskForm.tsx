import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Modal } from "~/components/ui/Modal";
import { toastError, toastSuccess } from "~/lib/toast";
import type { Task, TaskPriority } from "~/lib/types";
import { PRIORITY_OPTIONS } from "../const";
import { useCreateTask, useUpdateTask } from "../hooks";

const schema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(200),
});

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
}

export function TaskForm({ open, onClose, task }: TaskFormProps) {
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const isEditing = Boolean(task);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("P2");
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setDueDate(task?.dueDate ?? "");
      setPriority(task?.priority ?? "P2");
      setTagsInput((task?.tags ?? []).join(", "));
      setError(null);
    }
  }, [open, task]);

  const saving = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ title });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validasi gagal");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      tags,
    };
    try {
      if (isEditing && task) {
        await updateMutation.mutateAsync({ id: task.id, ...payload });
        toastSuccess("Task diperbarui");
      } else {
        await createMutation.mutateAsync(payload);
        toastSuccess("Task dibuat");
      }
      onClose();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menyimpan task");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit Task" : "Task Baru"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Input
          label="Judul *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Selesaikan laporan"
          autoFocus
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Deskripsi
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            placeholder="Detail opsional"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tenggat
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prioritas
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className={inputClass}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Input
          label="Tags (pisahkan dengan koma)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="kerja, urgent, pribadi"
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={saving}>
            {isEditing ? "Simpan" : "Buat Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}