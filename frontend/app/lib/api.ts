import { useAuthStore } from "~/stores/auth";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.user);
    return true;
  } catch {
    return false;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body } = options;
  const isAuthEndpoint = path.startsWith("/api/auth/");

  const doFetch = async (): Promise<T> => {
    const { accessToken } = useAuthStore.getState();
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Handle expiring access token with a single refresh retry.
    if (res.status === 401 && !isAuthEndpoint) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return doFetch();
      useAuthStore.getState().logout();
      throw new ApiError(401, "Sesi Anda berakhir. Silakan login kembali.");
    }

    if (!res.ok) {
      let message = "Terjadi kesalahan";
      try {
        const data = await res.json();
        message = (data as { message?: string; error?: string }).message ?? message;
      } catch {
        /* ignore non-JSON error bodies */
      }
      throw new ApiError(res.status, message);
    }

    return res.json() as Promise<T>;
  };

  return doFetch();
}