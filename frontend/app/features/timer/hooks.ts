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
 * Auto-complete any active session whose planned duration has already elapsed.
 * Returns the first still-valid (in-progress) active session, or null.
 */
export async function fetchActiveSession(): Promise<FocusSession | null> {
  try {
    const res = await api<TodaySummary>("/api/sessions/today");
    const now = Date.now();
    let restored: FocusSession | null = null;

    for (const s of res.sessions) {
      if (s.status !== "active") continue;
      const endsAt = s.startedAt + s.duration * 60_000;
      if (endsAt <= now) {
        // Expired while away — mark completed so it doesn't linger as "active".
        try {
          await api(`/api/sessions/${s.id}`, { method: "PATCH", body: { status: "completed" } });
        } catch {
          /* ignore */
        }
      } else if (!restored) {
        restored = s;
      }
    }
    return restored;
  } catch {
    return null;
  }
}

/**
 * Restore a specific active session by id (used by the "Lanjutkan" button in history).
 * Returns the session if still valid, else null (after completing it if expired).
 */
export async function resumeSessionById(id: string): Promise<FocusSession | null> {
  try {
    const res = await api<{ sessions: FocusSession[] }>("/api/sessions");
    const s = res.sessions.find((x) => x.id === id && x.status === "active");
    if (!s) return null;
    const endsAt = s.startedAt + s.duration * 60_000;
    if (endsAt <= Date.now()) {
      await api(`/api/sessions/${id}`, { method: "PATCH", body: { status: "completed" } });
      return null;
    }
    return s;
  } catch {
    return null;
  }
}