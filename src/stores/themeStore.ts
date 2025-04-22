import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const getSystemTheme = (): boolean => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const updateThemeClass = (isDark: boolean) => {
  // Force update of dark mode class
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(isDark ? "dark" : "light");
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      isDark: getSystemTheme(),
      setTheme: (theme) => {
        set({ theme });
        let isDark = theme === "dark";

        if (theme === "system") {
          isDark = getSystemTheme();

          // Listen for system theme changes
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const handler = (e: MediaQueryListEvent) => {
            const systemIsDark = e.matches;
            set({ isDark: systemIsDark });
            updateThemeClass(systemIsDark);
          };

          mediaQuery.addEventListener("change", handler);
          return () => mediaQuery.removeEventListener("change", handler);
        }

        set({ isDark });
        updateThemeClass(isDark);
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
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
