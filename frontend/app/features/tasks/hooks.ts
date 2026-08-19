import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";
import type { Task, TaskPayload, TaskStats } from "~/lib/types";
import {
  addToQueue,
  markSynced,
  setLastSyncTime,
  storeOfflineData,
} from "~/lib/offlineStorage";

export const taskKeys = {
  all: ["tasks"] as const,
  list: ["tasks", "list"] as const,
  stats: ["tasks", "stats"] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.list,
    queryFn: () => api<{ tasks: Task[] }>("/api/tasks").then((d) => d.tasks),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTaskStats() {
  return useQuery({
    queryKey: taskKeys.stats,
    queryFn: () => api<TaskStats>("/api/tasks/stats"),
    staleTime: 1000 * 60 * 60,
  });
}

function patchTaskInCache(qc: ReturnType<typeof useQueryClient>, id: string, patch: Partial<Task>) {
  qc.setQueryData<Task[]>(taskKeys.list, (old) =>
    old ? old.map((t) => (t.id === id ? { ...t, ...patch } : t)) : old,
  );
}

/**
 * Create task - works offline
 */
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TaskPayload) => {
      try {
        const res = await api<{ task: Task }>("/api/tasks", {
          method: "POST",
          body: payload,
        });
        setLastSyncTime();
        return res.task;
      } catch {
        const offlineId = `offline-task-${Date.now()}-${Math.random()}`;
        addToQueue({
          id: offlineId,
          type: "create",
          entity: "task",
          payload,
          timestamp: Date.now(),
          retryCount: 0,
        });
        storeOfflineData("task", payload);
        return {
          id: offlineId,
          title: payload.title,
          description: payload.description ?? null,
          dueDate: payload.dueDate ?? null,
          priority: payload.priority ?? "P2",
          status: "todo",
          tags: payload.tags ?? [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as Task;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

/**
 * Update task - works offline
 */
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<TaskPayload>) => {
      try {
        const res = await api<{ task: Task }>(`/api/tasks/${id}`, {
          method: "PUT",
          body: payload,
        });
        markSynced(id, "task");
        setLastSyncTime();
        return res.task;
      } catch {
        addToQueue({
          id: `offline-task-update-${id}-${Date.now()}`,
          type: "update",
          entity: "task",
          payload: { id, ...payload },
          timestamp: Date.now(),
          retryCount: 0,
        });
        storeOfflineData(`task-${id}`, payload);
        return { id, ...payload, updatedAt: Date.now() } as Task;
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

/**
 * Delete task - works offline
 */
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api(`/api/tasks/${id}`, { method: "DELETE" });
        markSynced(id, "task");
        setLastSyncTime();
      } catch {
        addToQueue({
          id: `offline-task-delete-${id}-${Date.now()}`,
          type: "delete",
          entity: "task",
          payload: { id },
          timestamp: Date.now(),
          retryCount: 0,
        });
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

/**
 * Toggle task complete - works offline
 */
export function useToggleComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, complete }: { id: string; complete: boolean }) => {
      try {
        const res = await api<{ task: Task }>(
          `/api/tasks/${id}/${complete ? "complete" : "uncomplete"}`,
          { method: "PATCH" },
        );
        markSynced(id, "task");
        setLastSyncTime();
        return res.task;
      } catch {
        // Optimistic update
        patchTaskInCache(qc, id, {
          status: complete ? "completed" : "todo",
          completedAt: complete ? Date.now() : null,
        });
        addToQueue({
          id: `offline-task-toggle-${id}-${Date.now()}`,
          type: "toggle",
          entity: "task",
          payload: { id, complete },
          timestamp: Date.now(),
          retryCount: 0,
        });
        return { id, status: complete ? "completed" : "todo", completedAt: complete ? Date.now() : null } as Task;
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
