import { api } from "~/lib/api";
import { useAuthStore } from "~/stores/auth";
import type { AuthResponse, User } from "~/lib/types";

export async function login(email: string, password: string): Promise<User> {
  const data = await api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.user);
  return data.user;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const data = await api<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
  useAuthStore.getState().setTokens(data.accessToken, data.refreshToken, data.user);
  return data.user;
}

export async function logout(): Promise<void> {
  const { refreshToken, logout: clear } = useAuthStore.getState();
  if (refreshToken) {
    try {
      await api("/api/auth/logout", { method: "POST", body: { refreshToken } });
    } catch {
      /* ignore network errors on logout */
    }
  }
  clear();
}