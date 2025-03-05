import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { ThemeWrapper } from "@/components/ThemeWrapper";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { setTheme } = useThemeStore();

  // Initialize theme
  useEffect(() => {
    // Force dark mode
    setTheme("dark");
  }, []);

  return <ThemeWrapper>{children}</ThemeWrapper>;
} 