import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/stores/themeStore";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    setTheme(theme);
  }, []);

  return <>{children}</>;
} 