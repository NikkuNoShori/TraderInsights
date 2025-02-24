import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

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

  return <>{children}</>;
}

// Re-export the hook for convenience
export const useTheme = useThemeStore;
