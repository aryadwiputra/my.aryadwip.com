import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api";

export const searchKey = ["search"] as const;

export function useSearch(query: string) {
  return useQuery({
    queryKey: [...searchKey, query],
    queryFn: async () => {
      if (query.length < 2) return { tasks: [], journals: [], ideas: [], notes: [], habits: [] };
      const res = await api<{
        tasks: { id: string; title: string; status: string; type: string }[];
        journals: { id: string; date: string; mood: string | null; type: string }[];
        ideas: { id: string; content: string; type: string }[];
        notes: { id: string; title: string; type: string }[];
        habits: { id: string; name: string; type: string }[];
      }>(`/api/search?q=${encodeURIComponent(query)}`);
      return res;
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}
