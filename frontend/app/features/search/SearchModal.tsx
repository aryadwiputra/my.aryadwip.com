import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Search as SearchIcon, X, BookOpen, CheckSquare, Lightbulb, StickyNote, Repeat } from "lucide-react";
import { useSearch } from "./hooks";
import { cn } from "~/lib/cn";

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useSearch(query);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleSelect(type: string, id: string) {
    const route = {
      task: "/tasks",
      journal: "/journal",
      idea: "/ideas",
      note: "/notes",
      habit: "/habits",
    }[type] ?? "/";
    navigate(route);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <SearchIcon className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari task, journal, ide, note, habit..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white"
          />
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-gray-500">Mencari...</p>
          ) : query.length < 2 ? (
            <p className="py-8 text-center text-sm text-gray-500">Ketik minimal 2 karakter untuk mencari.</p>
          ) : !data ||
            (!data.tasks.length && !data.journals.length && !data.ideas.length && !data.notes.length && !data.habits.length) ? (
            <p className="py-8 text-center text-sm text-gray-500">Tidak ada hasil untuk "{query}".</p>
          ) : (
            <div className="space-y-4">
              {data.tasks.length > 0 && (
                <ResultGroup icon={CheckSquare} label="Tasks" color="blue" items={data.tasks} onSelect={handleSelect} />
              )}
              {data.journals.length > 0 && (
                <ResultGroup icon={BookOpen} label="Journals" color="purple" items={data.journals.map(j => ({ id: j.id, title: j.date, subtitle: j.mood ?? "" })) as any} onSelect={handleSelect} />
              )}
              {data.ideas.length > 0 && (
                <ResultGroup icon={Lightbulb} label="Ideas" color="amber" items={data.ideas.map(i => ({ id: i.id, title: i.content.slice(0, 50), subtitle: "" })) as any} onSelect={handleSelect} />
              )}
              {data.notes.length > 0 && (
                <ResultGroup icon={StickyNote} label="Notes" color="green" items={data.notes.map(n => ({ id: n.id, title: n.title, subtitle: "" })) as any} onSelect={handleSelect} />
              )}
              {data.habits.length > 0 && (
                <ResultGroup icon={Repeat} label="Habits" color="rose" items={data.habits.map(h => ({ id: h.id, title: h.name, subtitle: "" })) as any} onSelect={handleSelect} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultGroup<T extends { id: string; title: string; subtitle?: string }>({
  icon: Icon,
  label,
  color,
  items,
  onSelect,
}: {
  icon: typeof SearchIcon;
  label: string;
  color: string;
  items: T[];
  onSelect: (type: string, id: string) => void;
}) {
  const type = label.toLowerCase();
  return (
    <div>
      <h3 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <Icon className={cn("h-3.5 w-3.5", color === "blue" && "text-blue-500", color === "purple" && "text-purple-500", color === "amber" && "text-amber-500", color === "green" && "text-green-500", color === "rose" && "text-rose-500")} />
        {label}
      </h3>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(type, item.id)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
              {item.subtitle && <p className="truncate text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
