import { create } from "zustand";

type Theme = "light" | "dark";

export const useThemeStore = create<{
  theme: Theme;
  toggle: () => void;
}>((set) => ({
  theme: "light",
  toggle: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
}));
