import { createContext } from "@/lib/react";
import { useCreateContext } from "@/lib/utils/contextRegistry";
import type { Theme } from "@/stores/themeStore";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getThemeClass: () => Theme;
}

// Create the context with a default value that will be overridden by the provider
export const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  getThemeClass: () => "system",
});

// Register this as an allowed context
useCreateContext("ThemeContext");
