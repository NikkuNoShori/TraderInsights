import { Palette } from "lucide-react";
import { useTheme, type ThemeName } from "@/providers/ThemeProvider";
import { clsx } from "clsx";

const themes: Array<{ name: ThemeName; label: string; color: string }> = [
  { name: "coolBlue", label: "Cool Blue", color: "bg-blue-500" },
  { name: "gunpowderGrey", label: "Gunpowder Grey", color: "bg-gray-500" },
  { name: "highContrast", label: "High Contrast", color: "bg-black" },
  { name: "mintGreen", label: "Mint Green", color: "bg-emerald-500" },
  { name: "autumnOrange", label: "Autumn Orange", color: "bg-orange-500" },
];

export function ThemeSelector() {
  const { theme: currentTheme, setTheme, getThemeClass } = useTheme();

  return (
    <div className="relative group">
      <button
        className={clsx(
          "p-2 rounded-md transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-700",
          getThemeClass("accent"),
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
              getThemeClass("text"),
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
