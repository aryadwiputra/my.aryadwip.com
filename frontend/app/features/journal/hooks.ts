import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";
import {
  addToQueue,
  getOfflineData,
  markSynced,
  setLastSyncTime,
  storeOfflineData,
} from "~/lib/offlineStorage";
import type { Journal, JournalPayload } from "~/lib/types";

export const journalKeys = {
  all: ["journals"] as const,
  list: ["journals", "list"] as const,
  streaks: ["journals", "streaks"] as const,
};

export function useJournals() {
  return useQuery({
    queryKey: journalKeys.list,
    queryFn: () =>
      api<{ journals: Journal[] }>("/api/journals").then((d) => d.journals),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useJournalStreaks() {
  return useQuery({
    queryKey: journalKeys.streaks,
    queryFn: () => api<{ current: number; longest: number }>("/api/journals/streaks"),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Create journal - works offline
 */
export function useCreateJournal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: JournalPayload & { date: string }) => {
      // Try API first
      try {
        const res = await api<{ journal: Journal }>("/api/journals", {
          method: "POST",
          body: payload,
        });
        setLastSyncTime();
        return res.journal;
      } catch {
        // API failed - queue for offline
        const offlineId = `offline-journal-${Date.now()}-${Math.random()}`;
        addToQueue({
          id: offlineId,
          type: "create",
          entity: "journal",
          payload,
          timestamp: Date.now(),
          retryCount: 0,
        });
        storeOfflineData("journal", payload);
        // Return optimistic data
        return {
          id: offlineId,
          date: payload.date,
          mood: payload.mood ?? null,
          energy: payload.energy ?? null,
          prompts: payload.prompts ?? {},
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as Journal;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: journalKeys.all });
      qc.invalidateQueries({ queryKey: journalKeys.streaks });
    },
  });
}

/**
 * Update journal - works offline
 */
export function useUpdateJournal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
    } & Partial<JournalPayload>) => {
      try {
        const res = await api<{ journal: Journal }>(`/api/journals/${id}`, {
          method: "PUT",
          body: payload,
        });
        markSynced(id, "journal");
        setLastSyncTime();
        return res.journal;
      } catch {
        // Queue for offline
        const offlineId = `offline-journal-update-${id}-${Date.now()}`;
        addToQueue({
          id: offlineId,
          type: "update",
          entity: "journal",
          payload: { id, ...payload },
          timestamp: Date.now(),
          retryCount: 0,
        });
        storeOfflineData(`journal-${id}`, payload);
        // Return optimistic update
        return { id, ...payload, updatedAt: Date.now() } as Journal;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: journalKeys.all });
    },
  });
}

/**
 * Delete journal - works offline
 */
export function useDeleteJournal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api(`/api/journals/${id}`, { method: "DELETE" });
        markSynced(id, "journal");
        setLastSyncTime();
      } catch {
        // Queue for offline
        const offlineId = `offline-journal-delete-${id}-${Date.now()}`;
        addToQueue({
          id: offlineId,
          type: "delete",
          entity: "journal",
          payload: { id },
          timestamp: Date.now(),
          retryCount: 0,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: journalKeys.all });
    },
  });
}
