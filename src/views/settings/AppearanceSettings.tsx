import { useTheme } from "../../providers/ThemeProvider";
import { Moon, Sun, Monitor } from "lucide-react";
import { clsx } from "clsx";

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: "light",
      label: "Light",
      description: "Light mode for daytime use",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Dark mode for nighttime use",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      description: "Follow system preferences",
      icon: Monitor,
    },
  ] as const;

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="px-8 py-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Appearance
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Customize how Trading Insights looks on your device
          </p>
        </div>

        <div className="px-8 py-6">
          <div className="space-y-3">
            {themeOptions.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={clsx(
                  "w-full flex items-center px-3 py-2.5 rounded-lg",
                  "transition-colors duration-200",
                  theme === value
                    ? "bg-primary/10 dark:bg-primary-900/20 text-primary dark:text-primary-400"
                    : "hover:bg-muted dark:hover:bg-dark-muted text-foreground dark:text-dark-text",
                )}
              >
                <Icon
                  className={clsx(
                    "h-5 w-5 mr-3 flex-shrink-0",
                    theme === value
                      ? "text-primary dark:text-primary-400"
                      : "text-muted-foreground dark:text-dark-muted",
                  )}
                />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{label}</div>
                  <div
                    className={clsx(
                      "text-xs",
                      theme === value
                        ? "text-primary/70 dark:text-primary-400/70"
                        : "text-muted-foreground dark:text-dark-muted",
                    )}
                  >
                    {description}
                  </div>
                </div>
                {theme === value && (
                  <div className="w-2 h-2 rounded-full bg-primary dark:bg-primary-400 ml-3" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
