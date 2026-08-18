import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";
import type { Note, NotePayload } from "~/lib/types";

export const noteKeys = {
  all: ["notes"] as const,
  list: (query: string) => ["notes", "list", query] as const,
};

export interface NoteFilters {
  q?: string;
  tag?: string;
}

export function useNotes(filters: NoteFilters = {}) {
  const { q = "", tag } = filters;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return useQuery({
    queryKey: noteKeys.list(qs),
    queryFn: () => api<{ notes: Note[] }>(`/api/notes${qs ? `?${qs}` : ""}`).then((d) => d.notes),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotePayload) =>
      api<{ note: Note }>("/api/notes", { method: "POST", body: payload }).then((d) => d.note),
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.all }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: NotePayload & { id: string }) =>
      api<{ note: Note }>(`/api/notes/${id}`, { method: "PUT", body: payload }).then((d) => d.note),
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.all }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/notes/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.all }),
  });
}