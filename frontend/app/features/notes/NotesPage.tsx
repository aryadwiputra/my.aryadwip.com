import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { SkeletonCard } from "~/components/ui/Skeleton";
import { cn } from "~/lib/cn";
import { formatDateTime } from "~/lib/date";
import { toastError, toastSuccess } from "~/lib/toast";
import type { Note } from "~/lib/types";
import { NoteForm } from "./components/NoteForm";
import { useDeleteNote, useNotes } from "./hooks";

export default function NotesPage() {
  const { data: notes = [], isLoading } = useNotes({});
  const deleteMutation = useDeleteNote();

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const n of notes) for (const t of n.tags) set.add(t);
    return [...set].sort();
  }, [notes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes.filter((n) => {
      if (activeTag && !n.tags.includes(activeTag)) return false;
      if (q && !(`${n.title}\n${n.content}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [notes, search, activeTag]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(note: Note) {
    setEditing(note);
    setFormOpen(true);
  }

  async function handleDelete(note: Note) {
    if (!confirm("Hapus note ini?")) return;
    await deleteMutation.mutateAsync(note.id);
    toastSuccess("Note dihapus");
    if (activeTag && !notes.some((n) => n.id !== note.id && n.tags.includes(activeTag!))) {
      setActiveTag(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Knowledge Notes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Simpan insight dari buku dan artikel.
          </p>
        </div>
        <Button onClick={openCreate} aria-label="Note Baru" title="Note Baru">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search + tags */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau isi catatan..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <TagChip label="Semua" active={activeTag === null} onClick={() => setActiveTag(null)} />
            {allTags.map((tag) => (
              <TagChip
                key={tag}
                label={`#${tag}`}
                active={activeTag === tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              />
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} lines={3} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          Tidak ada note. Buat note pertamamu!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <div
              key={note.id}
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            >
              <button onClick={() => openEdit(note)} className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">{note.title}</p>
                {note.source && (
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{note.source}</p>
                )}
                <p className="mt-2 line-clamp-4 text-sm text-gray-600 dark:text-gray-300">
                  {note.content || "Tidak ada isi."}
                </p>
              </button>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                  {note.tags.length === 0 && (
                    <span className="text-xs text-gray-400">{formatDateTime(note.createdAt)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(note)}
                  aria-label="Hapus note"
                  className="rounded-lg p-1.5 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NoteForm open={formOpen} onClose={() => setFormOpen(false)} note={editing} />
    </div>
  );
}

function TagChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition",
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
      )}
    >
      {label}
    </button>
  );
}