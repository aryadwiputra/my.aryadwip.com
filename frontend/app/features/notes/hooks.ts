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
    // Always refetch fresh when the page mounts (fix: stale list after create).
    staleTime: 0,
    refetchOnMount: true,
  });
}

/** Optimistically prepend/update a note in all list caches. */
function upsertNoteInCache(qc: ReturnType<typeof useQueryClient>, note: Note) {
  qc.setQueriesData({ queryKey: noteKeys.all }, (old: Note[] | undefined) => {
    const list = old ?? [];
    const idx = list.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      const next = [...list];
      next[idx] = note;
      return next;
    }
    return [note, ...list];
  });
}

/** Optimistically remove a note from all list caches. */
function removeNoteFromCache(qc: ReturnType<typeof useQueryClient>, id: string) {
  qc.setQueriesData({ queryKey: noteKeys.all }, (old: Note[] | undefined) =>
    (old ?? []).filter((n) => n.id !== id),
  );
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotePayload) =>
      api<{ note: Note }>("/api/notes", { method: "POST", body: payload }).then((d) => d.note),
    onSuccess: (note) => {
      // Immediately show the new note (no waiting for refetch).
      upsertNoteInCache(qc, note);
      qc.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: NotePayload & { id: string }) =>
      api<{ note: Note }>(`/api/notes/${id}`, { method: "PUT", body: payload }).then((d) => d.note),
    onSuccess: (note) => {
      upsertNoteInCache(qc, note);
      qc.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/notes/${id}`, { method: "DELETE" }),
    onSuccess: (_data, id) => {
      removeNoteFromCache(qc, id);
      qc.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}
