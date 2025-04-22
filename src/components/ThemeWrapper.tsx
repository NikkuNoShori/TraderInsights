import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeWrapper({ children }: PropsWithChildren) {
  const { isDark } = useThemeStore();

  useEffect(() => {
    // Theme class is handled by themeStore's updateThemeClass
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  return (
    <div className="min-h-screen w-full bg-background text-default transition-colors duration-200">
      {children}
    </div>
  );
}
