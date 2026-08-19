import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";
import type { Habit, HabitPayload } from "~/lib/types";

export const habitKeys = {
  all: ["habits"] as const,
};

export function useHabits() {
  return useQuery({
    queryKey: habitKeys.all,
    queryFn: () => api<{ habits: Habit[] }>("/api/habits").then((d) => d.habits),
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: HabitPayload) =>
      api<{ habit: Habit }>("/api/habits", { method: "POST", body: payload }).then((d) => d.habit),
    onSuccess: () => qc.invalidateQueries({ queryKey: habitKeys.all }),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<HabitPayload>) =>
      api<{ habit: Habit }>(`/api/habits/${id}`, { method: "PUT", body: payload }).then((d) => d.habit),
    onSuccess: () => qc.invalidateQueries({ queryKey: habitKeys.all }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/habits/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: habitKeys.all }),
  });
}

export function useToggleHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date?: string }) =>
      api<{ habit: Habit }>(`/api/habits/${id}/toggle`, {
        method: "POST",
        body: date ? { date } : {},
      }).then((d) => d.habit),
    onSuccess: () => qc.invalidateQueries({ queryKey: habitKeys.all }),
  });
}