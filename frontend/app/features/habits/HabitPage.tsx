import { useState } from "react";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Modal } from "~/components/ui/Modal";
import { SkeletonCard } from "~/components/ui/Skeleton";
import { cn } from "~/lib/cn";
import { toastError, toastSuccess } from "~/lib/toast";
import type { Habit } from "~/lib/types";
import { useCreateHabit, useDeleteHabit, useHabits, useToggleHabit } from "./hooks";

const ICONS = ["✅", "💧", "🏃", "📚", "🧘", "😴", "🥗", "✍️", "🎯", "💊"];
const COLORS = [
  { value: "blue", class: "bg-blue-500" },
  { value: "green", class: "bg-green-500" },
  { value: "amber", class: "bg-amber-500" },
  { value: "purple", class: "bg-purple-500" },
  { value: "rose", class: "bg-rose-500" },
];

function HabitItem({ habit }: { habit: Habit }) {
  const toggle = useToggleHabit();
  const del = useDeleteHabit();
  const color = COLORS.find((c) => c.value === habit.color)?.class ?? "bg-blue-500";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={() => toggle.mutate({ id: habit.id })}
        aria-label={habit.doneToday ? "Tandai belum selesai" : "Tandai selesai"}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition",
          habit.doneToday
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-gray-300 text-transparent hover:border-blue-500 dark:border-gray-600",
        )}
      >
        <Check className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
          <span className="mr-1.5">{habit.icon}</span>
          {habit.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Flame className={cn("h-3.5 w-3.5", habit.streak > 0 ? "text-orange-500" : "text-gray-300")} />
          {habit.streak} hari berturut · {habit.totalDone} total
        </p>
      </div>
      <button
        onClick={() => del.mutate(habit.id)}
        aria-label="Hapus habit"
        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function HabitPage() {
  const { data: habits = [], isLoading } = useHabits();
  const create = useCreateHabit();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✅");
  const [color, setColor] = useState("blue");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toastError("Nama habit wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await create.mutateAsync({ name: name.trim(), icon, color });
      toastSuccess("Habit dibuat");
      setName("");
      setOpen(false);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal membuat habit");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">Habits</h1>
          <p className="mt-0.5 text-sm text-gray-500 sm:mt-1 dark:text-gray-400">
            Bangun kebiasaan kecil setiap hari.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Habit Baru</span>
          <span className="sm:hidden">Baru</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : habits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          Belum ada habit. Tambahkan kebiasaan pertamamu!
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((h) => (
            <HabitItem key={h.id} habit={h} />
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Habit Baru">
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
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={saving}>
              Buat Habit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}