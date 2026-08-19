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
    // Always refetch fresh when the page mounts.
    staleTime: 0,
    refetchOnMount: true,
  });
}

/** Optimistically upsert an idea in all idea list caches. */
function upsertIdeaInCache(qc: ReturnType<typeof useQueryClient>, idea: Idea) {
  qc.setQueriesData({ queryKey: ideaKeys.all }, (old: Idea[] | undefined) => {
    const list = old ?? [];
    const idx = list.findIndex((i) => i.id === idea.id);
    if (idx >= 0) {
      const next = [...list];
      next[idx] = idea;
      return next;
    }
    return [idea, ...list];
  });
}

function removeIdeaFromCache(qc: ReturnType<typeof useQueryClient>, id: string) {
  qc.setQueriesData({ queryKey: ideaKeys.all }, (old: Idea[] | undefined) =>
    (old ?? []).filter((i) => i.id !== id),
  );
}

export function useCaptureIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api<{ idea: Idea }>("/api/ideas", { method: "POST", body: { content } }).then((d) => d.idea),
    onSuccess: (idea) => {
      upsertIdeaInCache(qc, idea);
      qc.invalidateQueries({ queryKey: ideaKeys.all });
    },
  });
}

export function useUpdateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api<{ idea: Idea }>(`/api/ideas/${id}`, { method: "PUT", body: { content } }).then((d) => d.idea),
    onSuccess: (idea) => {
      upsertIdeaInCache(qc, idea);
      qc.invalidateQueries({ queryKey: ideaKeys.all });
    },
  });
}

export function useDeleteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/ideas/${id}`, { method: "DELETE" }),
    onSuccess: (_data, id) => {
      removeIdeaFromCache(qc, id);
      qc.invalidateQueries({ queryKey: ideaKeys.all });
    },
  });
}

export function useConvertToTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ task: Task }>(`/api/ideas/${id}/convert-to-task`, { method: "POST" }).then((d) => d.task),
    onSuccess: (_data, id) => {
      removeIdeaFromCache(qc, id);
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
    onSuccess: (_data, id) => {
      removeIdeaFromCache(qc, id);
      qc.invalidateQueries({ queryKey: ideaKeys.all });
      qc.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}
