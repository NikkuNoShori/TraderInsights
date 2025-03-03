import { useThemeStore } from "@/stores/themeStore";
import { Moon, Sun, Monitor } from "lucide-react";
import { clsx } from "clsx";

export function AppearanceSettings() {
  const { theme, setTheme } = useThemeStore();

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
    <div className="max-w-3xl mx-auto bg-card dark:bg-dark-paper rounded-lg border border-border dark:border-dark-border">
      <div className="divide-y divide-border dark:divide-border">
        <div className="px-8 py-6">
          <h2 className="text-2xl font-semibold text-foreground dark:text-dark-text">
            Appearance
          </h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-dark-muted">
            Customize how Trading Insights looks on your device
          </p>
        </div>

        <div className="px-8 py-6">
          <div className="space-y-4">
            {themeOptions.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={clsx(
                  "w-full flex items-center px-4 py-3 rounded-lg",
                  "transition-colors duration-200",
                  theme === value
                    ? "bg-primary/10 dark:bg-primary-900/20 text-primary dark:text-primary-400"
                    : "hover:bg-muted dark:hover:bg-dark-muted text-foreground dark:text-dark-text",
                )}
              >
                <Icon
                  className={clsx(
                    "h-5 w-5 mr-4 flex-shrink-0",
                    theme === value
                      ? "text-primary dark:text-primary-400"
                      : "text-muted-foreground dark:text-dark-muted",
                  )}
                />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{label}</div>
                  <div
                    className={clsx(
                      "text-xs mt-0.5",
                      theme === value
                        ? "text-primary/70 dark:text-primary-400/70"
                        : "text-muted-foreground dark:text-dark-muted",
                    )}
                  >
                    {description}
                  </div>
                </div>
                {theme === value && (
                  <div className="w-2 h-2 rounded-full bg-primary dark:bg-primary-400 ml-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
