import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";
import type { DashboardData } from "~/lib/types";

export const dashboardKey = ["dashboard"] as const;

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: () => api<DashboardData>("/api/dashboard"),
  });
}

export function useRefreshDashboard() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: dashboardKey });
}