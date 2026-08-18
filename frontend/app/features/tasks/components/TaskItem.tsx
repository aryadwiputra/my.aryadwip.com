import { CalendarDays, Check, Pencil, Trash2 } from "lucide-react";
import { Badge, priorityTone } from "~/components/ui/Badge";
import { cn } from "~/lib/cn";
import { formatDate } from "~/lib/date";
import { toastSuccess } from "~/lib/toast";
import type { Task } from "~/lib/types";
import { useDeleteTask, useToggleComplete } from "../hooks";

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const toggleMutation = useToggleComplete();
  const deleteMutation = useDeleteTask();
  const completed = task.status === "completed";

  async function handleToggle() {
    await toggleMutation.mutateAsync({ id: task.id, complete: !completed });
    toastSuccess(completed ? "Task dibuka kembali" : "Task selesai! 🎉");
  }

  async function handleDelete() {
    if (!confirm("Hapus task ini?")) return;
    await deleteMutation.mutateAsync(task.id);
    toastSuccess("Task dihapus");
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-white p-4 dark:bg-gray-900",
        completed ? "border-gray-200 opacity-70 dark:border-gray-800" : "border-gray-200 dark:border-gray-800",
      )}
    >
      <button
        onClick={handleToggle}
        aria-label={completed ? "Tandai belum selesai" : "Tandai selesai"}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
          completed
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-gray-300 hover:border-blue-500 dark:border-gray-600",
        )}
      >
        {completed && <Check className="h-3.5 w-3.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium text-gray-900 dark:text-white",
            completed && "line-through",
          )}
        >
          {task.title}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
          {task.dueDate && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          onClick={onEdit}
          aria-label="Edit"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          aria-label="Hapus"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}