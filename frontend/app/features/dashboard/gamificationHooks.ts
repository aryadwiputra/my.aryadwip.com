import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api";
import type { GamificationData } from "~/lib/types";

export const gamificationKey = ["gamification"] as const;

export function useGamification() {
  return useQuery({
    queryKey: gamificationKey,
    queryFn: () => api<GamificationData>("/api/gamification"),
    staleTime: 1000 * 60 * 5,
  });
}
