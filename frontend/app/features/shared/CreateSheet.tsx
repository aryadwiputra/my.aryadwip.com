import { useEffect } from "react";
import { Lightbulb, CheckSquare, StickyNote, Repeat, X } from "lucide-react";
import { useCreateStore, type CreateType } from "./createStore";
import { QuickCapture } from "~/features/ideas/components/QuickCapture";
import { TaskForm } from "~/features/tasks/components/TaskForm";
import { NoteForm } from "~/features/notes/components/NoteForm";
import { HabitForm } from "~/features/habits/components/HabitForm";

const options: { type: CreateType; label: string; desc: string; icon: typeof Lightbulb }[] = [
  { type: "idea", label: "Ide", desc: "Tangkap ide cepat", icon: Lightbulb },
  { type: "task", label: "Task", desc: "Buat tugas baru", icon: CheckSquare },
  { type: "note", label: "Note", desc: "Simpan catatan", icon: StickyNote },
  { type: "habit", label: "Habit", desc: "Bangun kebiasaan", icon: Repeat },
];

export function CreateSheet() {
  const open = useCreateStore((s) => s.open);
  const type = useCreateStore((s) => s.type);
  const setType = useCreateStore((s) => s.setType);
  const close = useCreateStore((s) => s.close);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Once a type is chosen, show the corresponding modal (sheet closes).
  if (type === "idea") {
    return <QuickCapture open onClose={close} />;
  }
  if (type === "task") {
    return <TaskForm open onClose={close} />;
  }
  if (type === "note") {
    return <NoteForm open onClose={close} />;
  }
  if (type === "habit") {
    return <HabitForm open onClose={close} />;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Tambah</span>
          <button
            onClick={close}
            aria-label="Tutup"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Nudge: capture instead of scroll */}
        <p className="mx-5 mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          🧠 Lagi pengen scroll? Tulis 1 ide dulu — 30 detik, jauh lebih berharga.
        </p>
        <div className="p-3">
          {options.map((opt) => (
            <button
              key={opt.type}
              onClick={() => setType(opt.type)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <opt.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  {opt.label}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{opt.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}