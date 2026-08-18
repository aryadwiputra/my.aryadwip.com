import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";
import type { Journal, JournalPayload, JournalStreaks } from "~/lib/types";

export const journalKeys = {
  all: ["journals"] as const,
  streaks: ["journals", "streaks"] as const,
};

export function useJournals() {
  return useQuery({
    queryKey: journalKeys.all,
    queryFn: () =>
      api<{ journals: Journal[] }>("/api/journals").then((d) => d.journals),
  });
}

export function useJournalStreaks() {
  return useQuery({
    queryKey: journalKeys.streaks,
    queryFn: () => api<JournalStreaks>("/api/journals/streaks"),
  });
}

export function useCreateJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: JournalPayload & { date: string }) =>
      api<{ journal: Journal }>("/api/journals", { method: "POST", body: payload }).then(
        (d) => d.journal,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: journalKeys.all });
      qc.invalidateQueries({ queryKey: journalKeys.streaks });
    },
  });
}

export function useUpdateJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: JournalPayload & { id: string }) =>
      api<{ journal: Journal }>(`/api/journals/${id}`, { method: "PUT", body: payload }).then(
        (d) => d.journal,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: journalKeys.all });
      qc.invalidateQueries({ queryKey: journalKeys.streaks });
    },
  });
}

export function useDeleteJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/journals/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: journalKeys.all });
      qc.invalidateQueries({ queryKey: journalKeys.streaks });
    },
  });
}