import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";
import type { Habit, HabitPayload } from "~/lib/types";
import {
  addToQueue,
  markSynced,
  setLastSyncTime,
  storeOfflineData,
} from "~/lib/offlineStorage";

export const habitKeys = {
  all: ["habits"] as const,
};

export function useHabits() {
  return useQuery({
    queryKey: habitKeys.all,
    queryFn: () => api<{ habits: Habit[] }>("/api/habits").then((d) => d.habits),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create habit - works offline
 */
export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: HabitPayload) => {
      try {
        const res = await api<{ habit: Habit }>("/api/habits", {
          method: "POST",
          body: payload,
        });
        setLastSyncTime();
        return res.habit;
      } catch {
        const offlineId = `offline-habit-${Date.now()}-${Math.random()}`;
        addToQueue({
          id: offlineId,
          type: "create",
          entity: "habit",
          payload,
          timestamp: Date.now(),
          retryCount: 0,
        });
        storeOfflineData("habit", payload);
        return {
          id: offlineId,
          name: payload.name,
          icon: payload.icon ?? "✅",
          color: payload.color ?? "blue",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          doneToday: false,
          streak: 0,
          totalDone: 0,
        } as Habit;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: habitKeys.all }),
  });
}

/**
 * Update habit - works offline
 */
export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<HabitPayload>) => {
      try {
        const res = await api<{ habit: Habit }>(`/api/habits/${id}`, {
          method: "PUT",
          body: payload,
        });
        markSynced(id, "habit");
        setLastSyncTime();
        return res.habit;
      } catch {
        addToQueue({
          id: `offline-habit-update-${id}-${Date.now()}`,
          type: "update",
          entity: "habit",
          payload: { id, ...payload },
          timestamp: Date.now(),
          retryCount: 0,
        });
        storeOfflineData(`habit-${id}`, payload);
        return { id, ...payload, updatedAt: Date.now() } as Habit;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: habitKeys.all }),
  });
}

/**
 * Delete habit - works offline
 */
export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api(`/api/habits/${id}`, { method: "DELETE" });
        markSynced(id, "habit");
        setLastSyncTime();
      } catch {
        addToQueue({
          id: `offline-habit-delete-${id}-${Date.now()}`,
          type: "delete",
          entity: "habit",
          payload: { id },
          timestamp: Date.now(),
          retryCount: 0,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: habitKeys.all }),
  });
}

/**
 * Toggle habit - works offline
 */
export function useToggleHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date?: string }) => {
      try {
        const res = await api<{ habit: Habit }>(`/api/habits/${id}/toggle`, {
          method: "POST",
          body: date ? { date } : {},
        });
        markSynced(id, "habit");
        setLastSyncTime();
        return res.habit;
      } catch {
        // Optimistic toggle
        const current = qc.getQueryData<Habit[]>(habitKeys.all)?.find((h) => h.id === id);
        if (current) {
          qc.setQueryData<Habit[]>(habitKeys.all, (old) =>
            old?.map((h) =>
              h.id === id ? { ...h, doneToday: !h.doneToday } : h,
            ),
          );
        }
        addToQueue({
          id: `offline-habit-toggle-${id}-${Date.now()}`,
          type: "toggle",
          entity: "habit",
          payload: { id, date },
          timestamp: Date.now(),
          retryCount: 0,
        });
        return { ...current, doneToday: !current?.doneToday } as Habit;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: habitKeys.all }),
  });
}
