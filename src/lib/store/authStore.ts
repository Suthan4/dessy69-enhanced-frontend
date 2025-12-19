import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: (user) => set({ user, isAuthenticated: true }),

      clearAuth: () => set({ user: null, isAuthenticated: false }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      setHasHydrated(state) {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const useHasHydrated = () => {
  return useAuthStore((state) => state._hasHydrated);
};
