export type Theme = "light" | "dark";
export type ColorScheme =
  | "default"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "none";
export type Contrast = "normal" | "high";

export interface FontSize {
  id: "sm" | "md" | "lg" | "xl";
  label: string;
  scale: number;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  colorBlindMode: boolean;
}

export interface ThemeContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  contrast: Contrast;
  setContrast: (contrast: Contrast) => void;
  colorBlindMode: ColorScheme;
  setColorBlindMode: (mode: ColorScheme) => void;
}
