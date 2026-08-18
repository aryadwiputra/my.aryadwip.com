import { CalendarDays, Pencil } from "lucide-react";
import { cn } from "~/lib/cn";
import { formatDate } from "~/lib/date";
import type { Journal } from "~/lib/types";
import { MOOD_OPTIONS } from "../const";

interface JournalListProps {
  journals: Journal[];
  activeId: string | null;
  onSelect: (journal: Journal) => void;
}

function moodEmoji(mood?: string | null) {
  return MOOD_OPTIONS.find((m) => m.value === mood)?.emoji ?? "📝";
}

export function JournalList({ journals, activeId, onSelect }: JournalListProps) {
  if (journals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Belum ada journal. Mulai tulis journal pertamamu di atas.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {journals.map((j) => {
        const preview =
          j.prompts.intention || j.prompts.gratitude || j.prompts.affirmation || "Tidak ada catatan";
        const isActive = j.id === activeId;
        return (
          <button
            key={j.id}
            onClick={() => onSelect(j)}
            className={cn(
              "flex w-full items-start gap-4 rounded-xl border bg-white p-4 text-left transition dark:bg-gray-900",
              isActive
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700",
            )}
          >
            <span className="text-2xl">{moodEmoji(j.mood)}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CalendarDays className="h-4 w-4" />
                {formatDate(j.date)}
                {j.energy ? (
                  <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                    Energi {j.energy}/5
                  </span>
                ) : null}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-gray-700 dark:text-gray-200">{preview}</p>
            </div>
            <Pencil className="h-4 w-4 shrink-0 text-gray-400" />
          </button>
        );
      })}
    </div>
  );
}