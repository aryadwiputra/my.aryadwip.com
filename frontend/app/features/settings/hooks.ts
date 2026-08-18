import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/api";

export interface ExportData {
  exportedAt: string;
  version: number;
  data: {
    journals: unknown[];
    tasks: unknown[];
    ideas: unknown[];
    notes: unknown[];
    sessions: unknown[];
  };
}

export function useExportData() {
  return useMutation({
    mutationFn: () => api<ExportData>("/api/settings/export"),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      api<{ message: string }>("/api/settings/change-password", {
        method: "POST",
        body: { currentPassword, newPassword },
      }),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api<{ message: string }>("/api/settings/account", { method: "DELETE" }),
  });
}

export function downloadJson(data: ExportData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const d = new Date().toISOString().slice(0, 10);
  a.download = `clarityflow-export-${d}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}