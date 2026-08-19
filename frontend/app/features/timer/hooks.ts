import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";
import type { FocusSession, SessionStats, TodaySummary } from "~/lib/types";

export const sessionKeys = {
  all: ["sessions"] as const,
  list: ["sessions", "list"] as const,
  today: ["sessions", "today"] as const,
  stats: ["sessions", "stats"] as const,
};

export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.list,
    queryFn: () => api<{ sessions: FocusSession[] }>("/api/sessions").then((d) => d.sessions),
  });
}

export function useTodaySessions() {
  return useQuery({
    queryKey: sessionKeys.today,
    queryFn: () => api<TodaySummary>("/api/sessions/today"),
  });
}

export function useSessionStats() {
  return useQuery({
    queryKey: sessionKeys.stats,
    queryFn: () => api<SessionStats>("/api/sessions/stats"),
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ duration, taskId }: { duration: number; taskId?: string }) =>
      api<{ session: FocusSession }>("/api/sessions", {
        method: "POST",
        body: { duration, taskId },
      }).then((d) => d.session),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

export function useEndSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "completed" | "cancelled" }) =>
      api<{ session: FocusSession }>(`/api/sessions/${id}`, {
        method: "PATCH",
        body: { status },
      }).then((d) => d.session),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ success: boolean }>(`/api/sessions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

export function useDeleteAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<{ success: boolean }>(`/api/sessions`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

/**
 * Find an active session from the backend and restore it into the timer store.
 * Used on mount so refresh / cross-device resumes the countdown.
 * Returns the active session if found, else null.
 */
export async function fetchActiveSession(): Promise<FocusSession | null> {
  try {
    const res = await api<TodaySummary>("/api/sessions/today");
    const active = res.sessions.find((s) => s.status === "active");
    return active ?? null;
  } catch {
    return null;
  }
}