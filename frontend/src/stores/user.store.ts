import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  name: string;
  username?: string;
  ownerApplicationStatus?: string;
  email: string;
  password: string;
  token: string;
  photo: string;
  role: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  role: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRole: (role: string | null) => void;
  logout: () => void;
}

export const useUserStore = create(
  persist<UserState>(
    (set) => ({
      user: null,
      token: null,
      role: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
      logout: () => set({ user: null, token: null, role: null }),
    }),
    {
      name: "user-storage",
    }
  )
);
