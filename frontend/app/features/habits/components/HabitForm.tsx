import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Modal } from "~/components/ui/Modal";
import { cn } from "~/lib/cn";
import { toastError, toastSuccess } from "~/lib/toast";
import type { Habit } from "~/lib/types";
import { useCreateHabit, useUpdateHabit } from "../hooks";

const ICONS = ["✅", "💧", "🏃", "📚", "🧘", "😴", "🥗", "✍️", "🎯", "💊"];
const COLORS = [
  { value: "blue", class: "bg-blue-500" },
  { value: "green", class: "bg-green-500" },
  { value: "amber", class: "bg-amber-500" },
  { value: "purple", class: "bg-purple-500" },
  { value: "rose", class: "bg-rose-500" },
];

interface HabitFormProps {
  open: boolean;
  onClose: () => void;
  habit?: Habit | null;
}

export function HabitForm({ open, onClose, habit }: HabitFormProps) {
  const create = useCreateHabit();
  const update = useUpdateHabit();
  const isEditing = Boolean(habit);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✅");
  const [color, setColor] = useState("blue");

  useEffect(() => {
    if (open) {
      setName(habit?.name ?? "");
      setIcon(habit?.icon ?? "✅");
      setColor(habit?.color ?? "blue");
    }
  }, [open, habit]);

  const saving = create.isPending || update.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toastError("Nama habit wajib diisi");
      return;
    }
    try {
      if (isEditing && habit) {
        await update.mutateAsync({ id: habit.id, name: name.trim(), icon, color });
        toastSuccess("Habit diperbarui");
      } else {
        await create.mutateAsync({ name: name.trim(), icon, color });
        toastSuccess("Habit dibuat");
      }
      onClose();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menyimpan habit");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit Habit" : "Habit Baru"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama habit *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Minum air 2L"
          autoFocus
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ikon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition",
                  icon === i
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 hover:border-blue-400 dark:border-gray-700",
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Warna</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                aria-label={`Warna ${c.value}`}
                className={cn(
                  "h-8 w-8 rounded-full transition",
                  c.class,
                  color === c.value ? "ring-2 ring-offset-2 ring-gray-400" : "opacity-70 hover:opacity-100",
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={saving}>
            {isEditing ? "Simpan" : "Buat Habit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}