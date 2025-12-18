import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user) => {
        set({ user, isAuthenticated: true });
        if (typeof window !== "undefined") {
          // localStorage.setItem("token", token);
        }
      },

      clearAuth: () => {
        set({ user: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          // localStorage.removeItem("token");
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
