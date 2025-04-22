import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { ThemeWrapper } from "@/components/ThemeWrapper";

interface ThemeProviderProps extends PropsWithChildren {}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { setTheme } = useThemeStore();

  // Initialize theme from storage
  useEffect(() => {
    setTheme("system");
  }, [setTheme]);

  return <ThemeWrapper>{children}</ThemeWrapper>;
} 