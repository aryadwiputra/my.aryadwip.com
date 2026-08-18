import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";
import type { Task, TaskPayload, TaskStats } from "~/lib/types";

export const taskKeys = {
  all: ["tasks"] as const,
  list: ["tasks", "list"] as const,
  stats: ["tasks", "stats"] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.list,
    queryFn: () => api<{ tasks: Task[] }>("/api/tasks").then((d) => d.tasks),
  });
}

export function useTaskStats() {
  return useQuery({
    queryKey: taskKeys.stats,
    queryFn: () => api<TaskStats>("/api/tasks/stats"),
  });
}

function patchTaskInCache(qc: ReturnType<typeof useQueryClient>, id: string, patch: Partial<Task>) {
  qc.setQueryData<Task[]>(taskKeys.list, (old) =>
    old ? old.map((t) => (t.id === id ? { ...t, ...patch } : t)) : old,
  );
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskPayload) =>
      api<{ task: Task }>("/api/tasks", { method: "POST", body: payload }).then((d) => d.task),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.list });
      qc.invalidateQueries({ queryKey: taskKeys.stats });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: TaskPayload & { id: string }) =>
      api<{ task: Task }>(`/api/tasks/${id}`, { method: "PUT", body: payload }).then((d) => d.task),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.list });
      qc.invalidateQueries({ queryKey: taskKeys.stats });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/tasks/${id}`, { method: "DELETE" }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.list });
      qc.invalidateQueries({ queryKey: taskKeys.stats });
    },
  });
}

/** Optimistically toggle a task between completed and todo. */
export function useToggleComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, complete }: { id: string; complete: boolean }) =>
      api<{ task: Task }>(`/api/tasks/${id}/${complete ? "complete" : "uncomplete"}`, {
        method: "PATCH",
      }).then((d) => d.task),
    onMutate: async ({ id, complete }) => {
      await qc.cancelQueries({ queryKey: taskKeys.list });
      const prev = qc.getQueryData<Task[]>(taskKeys.list);
      patchTaskInCache(qc, id, {
        status: complete ? "completed" : "todo",
        completedAt: complete ? Date.now() : null,
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(taskKeys.list, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.list });
      qc.invalidateQueries({ queryKey: taskKeys.stats });
    },
  });
}