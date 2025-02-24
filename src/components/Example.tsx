import { useThemeChange } from "../hooks/useThemeChange";
import { themePresets } from "../lib/theme/constants";

export function Example() {
  const { requestThemeChange } = useThemeChange();

  const updateTheme = () => {
    const success = requestThemeChange(
      "Example",
      { background: "bg-white" },
      { background: themePresets.card },
    );

    if (!success) {
      console.error("Theme change not authorized");
    }
  };

  return <div className={themePresets.card}>{/* Component content */}</div>;
}
