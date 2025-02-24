import { type ReactNode } from "@/lib/react";
import { useEffect } from "@/lib/hooks";
import { useThemeStore } from "@/stores/themeStore";

export type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return children;
}

// Re-export the store hook for convenience
export const useTheme = useThemeStore;
