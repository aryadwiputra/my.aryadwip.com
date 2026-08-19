import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "~/lib/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  hydrated: boolean;
  setTokens: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hydrated: false,
      setTokens: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "clarityflow-auth",
      onRehydrateStorage: () => (state) => {
        // Called after localStorage is loaded into the store (client only).
        state?.setHydrated(true);
      },
    },
  ),
);