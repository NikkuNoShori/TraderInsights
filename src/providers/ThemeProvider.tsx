import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { ThemeContext } from "@/contexts/ThemeContext";
import type { Theme } from "@/stores/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  // Handle system theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => {
        document.documentElement.classList.toggle("dark", mediaQuery.matches);
      };
      
      mediaQuery.addEventListener("change", handler);
      handler(); // Initial check
      
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  const getThemeClass = () => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getThemeClass }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Re-export the hook for convenience
export const useTheme = useThemeStore;
