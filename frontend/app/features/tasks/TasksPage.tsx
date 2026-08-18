import { useMemo, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { SkeletonCard } from "~/components/ui/Skeleton";
import { cn } from "~/lib/cn";
import { todayStr } from "~/lib/date";
import type { Task, TaskPriority } from "~/lib/types";
import { PRIORITY_OPTIONS, type TaskView } from "./const";
import { TaskForm } from "./components/TaskForm";
import { TaskItem } from "./components/TaskItem";
import { useTasks } from "./hooks";

const priorityOrder: Record<TaskPriority, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };

const VIEWS: { key: TaskView; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "someday", label: "Someday" },
];

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const [view, setView] = useState<TaskView>("today");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const today = todayStr();
  const weekEnd = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  })();

  const { pending, completed } = useMemo(() => {
    let list = tasks;
    if (priorityFilter !== "all") list = list.filter((t) => t.priority === priorityFilter);

    const inView = (t: Task) => {
      if (view === "today") return t.dueDate === today;
      if (view === "week") return t.dueDate != null && t.dueDate > today && t.dueDate <= weekEnd;
      return t.dueDate === null || t.dueDate === undefined;
    };
    list = list.filter(inView);
    const sortFn = (a: Task, b: Task) =>
      (priorityOrder[a.priority] - priorityOrder[b.priority]) ||
      (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
    return {
      pending: list.filter((t) => t.status !== "completed").sort(sortFn),
      completed: list.filter((t) => t.status === "completed").sort(sortFn),
    };
  }, [tasks, view, priorityFilter, today, weekEnd]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Task Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola semua pekerjaanmu di satu tempat.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Task Baru
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
              view === v.key
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as "all" | TaskPriority)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">Semua prioritas</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowCompleted((v) => !v)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition", showCompleted && "rotate-180")}
          />
          Selesai ({completed.length})
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Tidak ada task di view ini.
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((t) => (
                <TaskItem key={t.id} task={t} onEdit={() => openEdit(t)} />
              ))}
            </div>
          )}

          {showCompleted && completed.length > 0 && (
            <div className="space-y-2">
              {completed.map((t) => (
                <TaskItem key={t.id} task={t} onEdit={() => openEdit(t)} />
              ))}
            </div>
          )}
        </div>
      )}

      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} task={editing} />
    </div>
  );
}