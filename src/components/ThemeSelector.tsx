import { Palette } from "lucide-react";
import { useThemeStore, type Theme } from "@/stores/themeStore";
import { clsx } from "clsx";

const themes: Array<{ name: Theme; label: string; color: string }> = [
  { name: "light", label: "Light Mode", color: "bg-gray-100" },
  { name: "dark", label: "Dark Mode", color: "bg-gray-900" },
  { name: "system", label: "System", color: "bg-gradient-to-r from-gray-100 to-gray-900" }
];

export function ThemeSelector() {
  const { theme: currentTheme, setTheme } = useThemeStore();
  
  const getThemeClass = () => {
    if (currentTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return currentTheme;
  };

  return (
    <div className="relative group">
      <button
        className={clsx(
          "p-2 rounded-md transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-700",
          getThemeClass() === "dark" && "bg-gray-700",
          getThemeClass() === "light" && "bg-gray-100",
        )}
      >
        <Palette className="h-5 w-5" />
      </button>

      <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {themes.map(({ name, label, color }) => (
          <button
            key={name}
            onClick={() => setTheme(name)}
            className={clsx(
              "w-full px-4 py-2 text-left text-sm flex items-center space-x-3",
              "hover:bg-gray-50 dark:hover:bg-gray-700",
              currentTheme === name && "font-medium",
              getThemeClass() === "dark" && "bg-gray-700",
              getThemeClass() === "light" && "bg-gray-100",
            )}
          >
            <span className={clsx("w-4 h-4 rounded-full", color)} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
