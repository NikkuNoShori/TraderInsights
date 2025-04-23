import { Palette } from "lucide-react";
import { useThemeStore, type Theme } from "@/stores/themeStore";
import { clsx } from "clsx";

const themes: Array<{ name: Theme; label: string }> = [
  { name: "light", label: "Light Mode" },
  { name: "dark", label: "Dark Mode" },
  { name: "system", label: "System" },
];

export function ThemeSelector() {
  const { theme: currentTheme, setTheme } = useThemeStore();

  return (
    <div className="relative group">
      <button
        className={clsx(
          "p-2 rounded-md transition-colors",
          "hover:bg-muted text-muted hover:text-default",
        )}
      >
        <Palette className="h-5 w-5" />
      </button>

      <div className="absolute right-0 mt-2 w-48 rounded-md bg-card border border-border shadow-lg">
        {themes.map(({ name, label }) => (
          <button
            key={name}
            onClick={() => setTheme(name)}
            className={clsx(
              "w-full px-4 py-2 text-left text-sm flex items-center space-x-3",
              "hover:bg-muted text-default",
              currentTheme === name && "font-medium text-primary",
            )}
          >
            <span className="w-4 h-4 rounded-full bg-primary/20" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
