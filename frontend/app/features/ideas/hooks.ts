import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";
import type { Idea, IdeaStatus, Note, Task } from "~/lib/types";
import { noteKeys } from "~/features/notes/hooks";
import { taskKeys } from "~/features/tasks/hooks";

export const ideaKeys = {
  all: ["ideas"] as const,
  list: (status: IdeaStatus) => ["ideas", "list", status] as const,
};

export function useIdeas(status: IdeaStatus = "inbox") {
  const params = status === "inbox" ? "" : `?status=${status}`;
  return useQuery({
    queryKey: ideaKeys.list(status),
    queryFn: () => api<{ ideas: Idea[] }>(`/api/ideas${params}`).then((d) => d.ideas),
  });
}

export function useCaptureIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api<{ idea: Idea }>("/api/ideas", { method: "POST", body: { content } }).then((d) => d.idea),
    onSuccess: () => qc.invalidateQueries({ queryKey: ideaKeys.all }),
  });
}

export function useUpdateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api<{ idea: Idea }>(`/api/ideas/${id}`, { method: "PUT", body: { content } }).then((d) => d.idea),
    onSuccess: () => qc.invalidateQueries({ queryKey: ideaKeys.all }),
  });
}

export function useDeleteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/ideas/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ideaKeys.all }),
  });
}

export function useConvertToTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ task: Task }>(`/api/ideas/${id}/convert-to-task`, { method: "POST" }).then((d) => d.task),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ideaKeys.all });
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useConvertToNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ note: Note }>(`/api/ideas/${id}/convert-to-note`, { method: "POST" }).then((d) => d.note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ideaKeys.all });
      qc.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}