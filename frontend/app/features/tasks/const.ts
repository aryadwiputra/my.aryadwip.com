import type { TaskPriority } from "~/lib/types";

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "P1", label: "P1 — Urgent" },
  { value: "P2", label: "P2 — Tinggi" },
  { value: "P3", label: "P3 — Normal" },
  { value: "P4", label: "P4 — Rendah" },
];

export type TaskView = "today" | "week" | "someday";