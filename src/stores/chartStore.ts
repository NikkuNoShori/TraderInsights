import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define chart size configurations for different sections
export const CHART_SIZES = {
  // Dashboard section
  dashboard: {
    small: 150,
    medium: 200,
    large: 250,
    default: 180,
    // Responsive sizes
    responsive: {
      xs: 150, // Extra small screens (< 640px)
      sm: 160, // Small screens (>= 640px)
      md: 180, // Medium screens (>= 768px)
      lg: 200, // Large screens (>= 1024px)
      xl: 220, // Extra large screens (>= 1280px)
      xxl: 250, // 2XL screens (>= 1536px)
    },
  },
  // Journal section
  journal: {
    small: 160,
    medium: 220,
    large: 300,
    default: 220,
    // Responsive sizes
    responsive: {
      xs: 160,
      sm: 180,
      md: 220,
      lg: 240,
      xl: 260,
      xxl: 300,
    },
  },
  // Performance section
  performance: {
    small: 180,
    medium: 240,
    large: 320,
    default: 240,
    // Responsive sizes
    responsive: {
      xs: 180,
      sm: 200,
      md: 240,
      lg: 260,
      xl: 280,
      xxl: 320,
    },
  },
  // Account section
  account: {
    small: 160,
    medium: 220,
    large: 300,
    default: 220,
    // Responsive sizes
    responsive: {
      xs: 160,
      sm: 180,
      md: 220,
      lg: 240,
      xl: 260,
      xxl: 300,
    },
  },
  // Default sizes (fallback)
  default: {
    small: 160,
    medium: 220,
    large: 300,
    default: 220,
    // Responsive sizes
    responsive: {
      xs: 160,
      sm: 180,
      md: 220,
      lg: 240,
      xl: 260,
      xxl: 300,
    },
  },
};

// Define text sizes for charts
export const CHART_TEXT_SIZES = {
  // Dashboard section
  dashboard: {
    title: {
      xs: 14,
      sm: 14,
      md: 16,
      lg: 16,
      xl: 18,
      xxl: 18,
    },
    axis: {
      xs: 8,
      sm: 9,
      md: 10,
      lg: 10,
      xl: 11,
      xxl: 12,
    },
    tooltip: {
      xs: 10,
      sm: 11,
      md: 12,
      lg: 12,
      xl: 13,
      xxl: 14,
    },
    legend: {
      xs: 9,
      sm: 10,
      md: 11,
      lg: 11,
      xl: 12,
      xxl: 12,
    },
  },
  // Journal section
  journal: {
    title: {
      xs: 14,
      sm: 14,
      md: 16,
      lg: 16,
      xl: 18,
      xxl: 18,
    },
    axis: {
      xs: 8,
      sm: 9,
      md: 10,
      lg: 10,
      xl: 11,
      xxl: 12,
    },
    tooltip: {
      xs: 10,
      sm: 11,
      md: 12,
      lg: 12,
      xl: 13,
      xxl: 14,
    },
    legend: {
      xs: 9,
      sm: 10,
      md: 11,
      lg: 11,
      xl: 12,
      xxl: 12,
    },
  },
  // Performance section
  performance: {
    title: {
      xs: 14,
      sm: 14,
      md: 16,
      lg: 16,
      xl: 18,
      xxl: 18,
    },
    axis: {
      xs: 8,
      sm: 9,
      md: 10,
      lg: 10,
      xl: 11,
      xxl: 12,
    },
    tooltip: {
      xs: 10,
      sm: 11,
      md: 12,
      lg: 12,
      xl: 13,
      xxl: 14,
    },
    legend: {
      xs: 9,
      sm: 10,
      md: 11,
      lg: 11,
      xl: 12,
      xxl: 12,
    },
  },
  // Account section
  account: {
    title: {
      xs: 14,
      sm: 14,
      md: 16,
      lg: 16,
      xl: 18,
      xxl: 18,
    },
    axis: {
      xs: 8,
      sm: 9,
      md: 10,
      lg: 10,
      xl: 11,
      xxl: 12,
    },
    tooltip: {
      xs: 10,
      sm: 11,
      md: 12,
      lg: 12,
      xl: 13,
      xxl: 14,
    },
    legend: {
      xs: 9,
      sm: 10,
      md: 11,
      lg: 11,
      xl: 12,
      xxl: 12,
    },
  },
  // Default sizes (fallback)
  default: {
    title: {
      xs: 14,
      sm: 14,
      md: 16,
      lg: 16,
      xl: 18,
      xxl: 18,
    },
    axis: {
      xs: 8,
      sm: 9,
      md: 10,
      lg: 10,
      xl: 11,
      xxl: 12,
    },
    tooltip: {
      xs: 10,
      sm: 11,
      md: 12,
      lg: 12,
      xl: 13,
      xxl: 14,
    },
    legend: {
      xs: 9,
      sm: 10,
      md: 11,
      lg: 11,
      xl: 12,
      xxl: 12,
    },
  },
};

// Define chart aspect ratios
export const CHART_ASPECT_RATIOS = {
  square: 1,
  widescreen: 16 / 9,
  ultrawide: 21 / 9,
  portrait: 3 / 4,
};

// Define screen breakpoints (matching Tailwind's defaults)
export const SCREEN_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};

// Define chart section types
export type ChartSection = keyof typeof CHART_SIZES;
export type ChartSize = "small" | "medium" | "large" | "default";
export type ScreenSize = keyof typeof SCREEN_BREAKPOINTS;
export type TextType = "title" | "axis" | "tooltip" | "legend";

interface ChartState {
  // Current section and size preferences
  currentSection: ChartSection;
  sectionSizes: Record<ChartSection, ChartSize>;
  useResponsiveSizing: boolean;

  // Actions
  setCurrentSection: (section: ChartSection) => void;
  setSectionSize: (section: ChartSection, size: ChartSize) => void;
  setUseResponsiveSizing: (useResponsive: boolean) => void;

  // Getters
  getChartHeight: (section?: ChartSection, size?: ChartSize) => number;
  getResponsiveHeight: (section?: ChartSection) => number;
  getCurrentScreenSize: () => ScreenSize;
  getTextSize: (textType: TextType, section?: ChartSection) => number;

  // Component spacing
  getComponentSpacing: (section?: ChartSection) => {
    padding: string;
    margin: string;
    gap: string;
  };
}

export const useChartStore = create<ChartState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSection: "dashboard",
      sectionSizes: {
        dashboard: "default",
        journal: "default",
        performance: "default",
        account: "default",
        default: "default",
      },
      useResponsiveSizing: true,

      // Actions
      setCurrentSection: (section) => set({ currentSection: section }),

      setSectionSize: (section, size) =>
        set((state) => ({
          sectionSizes: {
            ...state.sectionSizes,
            [section]: size,
          },
        })),

      setUseResponsiveSizing: (useResponsive) =>
        set({ useResponsiveSizing: useResponsive }),

      // Getters
      getChartHeight: (section, size) => {
        const state = get();
        if (state.useResponsiveSizing) {
          return state.getResponsiveHeight(section);
        }

        const targetSection = section || state.currentSection;
        const targetSize = size || state.sectionSizes[targetSection];
        return CHART_SIZES[targetSection][targetSize];
      },

      getResponsiveHeight: (section) => {
        const targetSection = section || get().currentSection;
        const screenSize = get().getCurrentScreenSize();
        return CHART_SIZES[targetSection].responsive[screenSize];
      },

      getCurrentScreenSize: () => {
        // Only run this on the client
        if (typeof window === "undefined") return "md";

        const width = window.innerWidth;

        if (width >= SCREEN_BREAKPOINTS.xxl) return "xxl";
        if (width >= SCREEN_BREAKPOINTS.xl) return "xl";
        if (width >= SCREEN_BREAKPOINTS.lg) return "lg";
        if (width >= SCREEN_BREAKPOINTS.md) return "md";
        if (width >= SCREEN_BREAKPOINTS.sm) return "sm";
        return "xs";
      },

      getTextSize: (textType, section) => {
        const targetSection = section || get().currentSection;
        const screenSize = get().getCurrentScreenSize();

        // Use the specified section or fall back to default
        const sectionTextSizes =
          CHART_TEXT_SIZES[targetSection] || CHART_TEXT_SIZES.default;

        return sectionTextSizes[textType][screenSize];
      },

      getComponentSpacing: (section) => {
        const screenSize = get().getCurrentScreenSize();
        const targetSection = section || get().currentSection;

        // Define spacing based on screen size and section
        switch (screenSize) {
          case "xs":
          case "sm":
            return {
              padding: targetSection === "dashboard" ? "p-2" : "p-3",
              margin: targetSection === "dashboard" ? "mb-2" : "mb-3",
              gap: targetSection === "dashboard" ? "gap-2" : "gap-3",
            };
          case "md":
            return {
              padding: targetSection === "dashboard" ? "p-3" : "p-4",
              margin: targetSection === "dashboard" ? "mb-3" : "mb-4",
              gap: targetSection === "dashboard" ? "gap-3" : "gap-4",
            };
          default:
            return {
              padding: targetSection === "dashboard" ? "p-4" : "p-5",
              margin: targetSection === "dashboard" ? "mb-4" : "mb-5",
              gap: targetSection === "dashboard" ? "gap-4" : "gap-5",
            };
        }
      },
    }),
    {
      name: "trader-insights-chart-store",
    }
  )
);
