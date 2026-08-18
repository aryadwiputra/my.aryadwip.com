import { useState } from "react";
import { ListChecks, MoreVertical, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Dropdown, DropdownItem } from "~/components/ui/Dropdown";
import { Modal } from "~/components/ui/Modal";
import { SkeletonCard } from "~/components/ui/Skeleton";
import { formatDateTime } from "~/lib/date";
import { toastError, toastSuccess } from "~/lib/toast";
import type { Idea } from "~/lib/types";
import {
  useConvertToNote,
  useConvertToTask,
  useDeleteIdea,
  useIdeas,
  useUpdateIdea,
} from "./hooks";

export default function IdeasPage() {
  const { data: ideas = [], isLoading } = useIdeas("inbox");
  const deleteMutation = useDeleteIdea();
  const convertToTask = useConvertToTask();
  const convertToNote = useConvertToNote();
  const updateMutation = useUpdateIdea();

  const [editing, setEditing] = useState<Idea | null>(null);
  const [editText, setEditText] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  function openEdit(idea: Idea) {
    setEditing(idea);
    setEditText(idea.content);
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editing || !editText.trim()) return;
    try {
      await updateMutation.mutateAsync({ id: editing.id, content: editText.trim() });
      toastSuccess("Idea diperbarui");
      setEditOpen(false);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal memperbarui idea");
    }
  }

  async function handleConvertToTask(idea: Idea) {
    try {
      await convertToTask.mutateAsync(idea.id);
      toastSuccess("Idea dikonversi menjadi task");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal konversi ke task");
    }
  }

  async function handleConvertToNote(idea: Idea) {
    try {
      await convertToNote.mutateAsync(idea.id);
      toastSuccess("Idea dikonversi menjadi note");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal konversi ke note");
    }
  }

  async function handleDelete(idea: Idea) {
    if (!confirm("Hapus idea ini?")) return;
    await deleteMutation.mutateAsync(idea.id);
    toastSuccess("Idea dihapus");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Idea Inbox</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tangkap ide lewat tombol <span className="rounded bg-gray-100 px-1 dark:bg-gray-800">Ctrl+K</span> atau tombol lampu di pojok kanan bawah.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : ideas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          Inbox kosong. Tangkap ide pertamamu!
        </div>
      ) : (
        <div className="space-y-2">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-100">{idea.content}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {formatDateTime(idea.createdAt)}
                </p>
              </div>
              <Dropdown
                trigger={
                  <button
                    aria-label="Aksi idea"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                }
              >
                {(close) => (
                  <>
                    <DropdownItem
                      onClick={() => {
                        handleConvertToTask(idea);
                        close();
                      }}
                    >
                      <ListChecks className="h-4 w-4" /> Konversi ke Task
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        handleConvertToNote(idea);
                        close();
                      }}
                    >
                      <NotebookPen className="h-4 w-4" /> Konversi ke Note
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        openEdit(idea);
                        close();
                      }}
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownItem>
                    <DropdownItem
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                      onClick={() => {
                        handleDelete(idea);
                        close();
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Hapus
                    </DropdownItem>
                  </>
                )}
              </Dropdown>
            </div>
          ))}
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Idea" size="sm">
        <div className="space-y-3">
          <textarea
            rows={4}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Batal
            </Button>
            <Button onClick={saveEdit} loading={updateMutation.isPending}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}