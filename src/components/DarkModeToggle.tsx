import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { clsx } from "clsx";

export interface DarkModeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function DarkModeToggle({ showLabel, className }: DarkModeToggleProps) {
  const { setTheme, isDark } = useThemeStore();

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={clsx(
        "flex items-center space-x-2 p-2 text-sm",
        "text-muted hover:text-default",
        "transition-colors duration-150",
        className,
      )}
    >
      {isDark ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      {showLabel && (
        <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
      )}
    </button>
  );
}
