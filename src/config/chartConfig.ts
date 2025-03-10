/**
 * Chart Configuration
 * 
 * This file contains standardized configuration for charts across the application.
 * Use these settings to maintain consistent chart sizes and styling.
 */

import {
  CHART_SIZES as SECTION_CHART_SIZES,
  CHART_ASPECT_RATIOS,
  ChartSection,
} from "@/stores/chartStore";

// Re-export chart sizes from the store for backward compatibility
export const CHART_SIZES = SECTION_CHART_SIZES.default;

// Export aspect ratios
export { CHART_ASPECT_RATIOS };

export const CHART_COLORS = {
  // Primary colors
  primary: "#6366f1", // Indigo
  secondary: "#0ea5e9", // Sky blue
  success: "#22c55e", // Green
  warning: "#f59e0b", // Amber
  danger: "#ef4444", // Red
  info: "#3b82f6", // Blue

  // Gradient stops
  primaryGradient: {
    start: "rgba(99, 102, 241, 0.8)",
    end: "rgba(99, 102, 241, 0.1)",
  },
  successGradient: {
    start: "rgba(34, 197, 94, 0.8)",
    end: "rgba(34, 197, 94, 0.1)",
  },
  dangerGradient: {
    start: "rgba(239, 68, 68, 0.8)",
    end: "rgba(239, 68, 68, 0.1)",
  },
};

export const CHART_MARGINS = {
  small: { top: 5, right: 5, bottom: 5, left: 5 },
  medium: { top: 10, right: 20, bottom: 20, left: 10 },
  large: { top: 20, right: 30, bottom: 30, left: 20 },
};

/**
 * Standard chart height for dashboard charts
 * @deprecated Use useChartStore().getChartHeight('dashboard') instead
 */
export const DASHBOARD_CHART_HEIGHT = SECTION_CHART_SIZES.dashboard.default;

/**
 * Standard chart configuration for Recharts components
 */
export const getRechartsConfig = (
  isDarkMode: boolean,
  section: ChartSection = "dashboard"
) => ({
  colors: CHART_COLORS,
  gridColor: isDarkMode ? "#2B2B43" : "#e1e3eb",
  textColor: isDarkMode ? "#d1d4dc" : "#131722",
  margins: CHART_MARGINS.medium,
  height: SECTION_CHART_SIZES[section].default,
});

/**
 * Standard chart configuration for TradingView components
 */
export const getTradingViewConfig = (
  isDarkMode: boolean,
  section: ChartSection = "dashboard"
) => ({
  height: SECTION_CHART_SIZES[section].default,
  theme: isDarkMode ? "dark" : "light",
  backgroundColor: isDarkMode ? "#1a1b1e" : "#ffffff",
  toolbarBgColor: isDarkMode ? "#1a1b1e" : "#f8f9fa",
  showToolbar: false,
  showSideToolbar: false,
}); 