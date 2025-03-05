import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const updateThemeClass = (isDark: boolean) => {
  document.documentElement.classList.toggle("dark", isDark);
};

const getSystemTheme = (): boolean => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      isDark: getSystemTheme(),
      setTheme: (theme) => {
        set({ theme });

        if (theme === "system") {
          const isDark = getSystemTheme();
          set({ isDark });
          updateThemeClass(isDark);

          // Listen for system theme changes
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const handler = (e: MediaQueryListEvent) => {
            const isDark = e.matches;
            set({ isDark });
            updateThemeClass(isDark);
          };

          mediaQuery.addEventListener("change", handler);
          return () => mediaQuery.removeEventListener("change", handler);
        } else {
          const isDark = theme === "dark";
          set({ isDark });
          updateThemeClass(isDark);
        }
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        // When store is rehydrated, ensure theme class is applied
        if (state) {
          const isDark =
            state.theme === "system"
              ? getSystemTheme()
              : state.theme === "dark";
          updateThemeClass(isDark);
          state.isDark = isDark;
        }
      },
    }
  )
);
