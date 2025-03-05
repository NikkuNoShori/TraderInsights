import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeWrapper({ children }: PropsWithChildren) {
  const { isDark } = useThemeStore();

  useEffect(() => {
    // Ensure dark mode class is applied on mount and update color scheme
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  return (
    <div className="min-h-screen w-full bg-background text-default transition-colors duration-200">
      {children}
    </div>
  );
}
