import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "@/lib/react";
import { useCreateContext } from "@/lib/utils/contextRegistry";

export type ThemeName = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  getThemeClass: (theme: ThemeName) => string;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  getThemeClass: () => "light",
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Register the context
  useCreateContext("ThemeContext");

  const [theme, setTheme] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeName;
    return savedTheme || "system";
  });

  const getThemeClass = (currentTheme: ThemeName): string => {
    if (currentTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return currentTheme;
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(getThemeClass(theme));
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getThemeClass }}>
      {children}
    </ThemeContext.Provider>
  );
}
