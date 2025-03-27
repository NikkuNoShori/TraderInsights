/**
 * Chart Configuration
 * 
 * This file contains standardized configuration for charts across the application.
 * Use these settings to maintain consistent chart sizes and styling.
 */

export const CHART_SIZES = {
  small: 200,
  medium: 300,
  large: 400,
  extraLarge: 500,
  fullWidth: '100%',
};

export const CHART_ASPECT_RATIOS = {
  square: 1,
  widescreen: 16/9,
  ultrawide: 21/9,
  portrait: 3/4,
};

export const CHART_COLORS = {
  // Primary colors
  primary: '#6366f1', // Indigo
  secondary: '#0ea5e9', // Sky blue
  success: '#22c55e', // Green
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Red
  info: '#3b82f6', // Blue
  
  // Gradient stops
  primaryGradient: {
    start: 'rgba(99, 102, 241, 0.8)',
    end: 'rgba(99, 102, 241, 0.1)',
  },
  successGradient: {
    start: 'rgba(34, 197, 94, 0.8)',
    end: 'rgba(34, 197, 94, 0.1)',
  },
  dangerGradient: {
    start: 'rgba(239, 68, 68, 0.8)',
    end: 'rgba(239, 68, 68, 0.1)',
  },
};

export const CHART_MARGINS = {
  small: { top: 5, right: 5, bottom: 5, left: 5 },
  medium: { top: 10, right: 20, bottom: 20, left: 10 },
  large: { top: 20, right: 30, bottom: 30, left: 20 },
};

/**
 * Standard chart height for dashboard charts
 */
export const DASHBOARD_CHART_HEIGHT = 300;

/**
 * Standard chart configuration for Recharts components
 */
export const getRechartsConfig = (isDarkMode: boolean) => ({
  colors: CHART_COLORS,
  gridColor: isDarkMode ? "#2B2B43" : "#e1e3eb",
  textColor: isDarkMode ? "#d1d4dc" : "#131722",
  margins: CHART_MARGINS.medium,
  height: DASHBOARD_CHART_HEIGHT,
});

/**
 * Standard chart configuration for TradingView components
 */
export const getTradingViewConfig = (isDarkMode: boolean) => ({
  height: DASHBOARD_CHART_HEIGHT,
  theme: isDarkMode ? "dark" : "light",
  backgroundColor: isDarkMode ? "#1a1b1e" : "#ffffff",
  toolbarBgColor: isDarkMode ? "#1a1b1e" : "#f8f9fa",
  showToolbar: false,
  showSideToolbar: false,
}); 
/**
 * Chart Configuration
 * 
 * This file contains standardized configuration for charts across the application.
 * Use these settings to maintain consistent chart sizes and styling.
 */

export const CHART_SIZES = {
  small: 200,
  medium: 300,
  large: 400,
  extraLarge: 500,
  fullWidth: '100%',
};

export const CHART_ASPECT_RATIOS = {
  square: 1,
  widescreen: 16/9,
  ultrawide: 21/9,
  portrait: 3/4,
};

export const CHART_COLORS = {
  // Primary colors
  primary: '#6366f1', // Indigo
  secondary: '#0ea5e9', // Sky blue
  success: '#22c55e', // Green
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Red
  info: '#3b82f6', // Blue
  
  // Gradient stops
  primaryGradient: {
    start: 'rgba(99, 102, 241, 0.8)',
    end: 'rgba(99, 102, 241, 0.1)',
  },
  successGradient: {
    start: 'rgba(34, 197, 94, 0.8)',
    end: 'rgba(34, 197, 94, 0.1)',
  },
  dangerGradient: {
    start: 'rgba(239, 68, 68, 0.8)',
    end: 'rgba(239, 68, 68, 0.1)',
  },
};

export const CHART_MARGINS = {
  small: { top: 5, right: 5, bottom: 5, left: 5 },
  medium: { top: 10, right: 20, bottom: 20, left: 10 },
  large: { top: 20, right: 30, bottom: 30, left: 20 },
};

/**
 * Standard chart height for dashboard charts
 */
export const DASHBOARD_CHART_HEIGHT = 300;

/**
 * Standard chart configuration for Recharts components
 */
export const getRechartsConfig = (isDarkMode: boolean) => ({
  colors: CHART_COLORS,
  gridColor: isDarkMode ? "#2B2B43" : "#e1e3eb",
  textColor: isDarkMode ? "#d1d4dc" : "#131722",
  margins: CHART_MARGINS.medium,
  height: DASHBOARD_CHART_HEIGHT,
});

/**
 * Standard chart configuration for TradingView components
 */
export const getTradingViewConfig = (isDarkMode: boolean) => ({
  height: DASHBOARD_CHART_HEIGHT,
  theme: isDarkMode ? "dark" : "light",
  backgroundColor: isDarkMode ? "#1a1b1e" : "#ffffff",
  toolbarBgColor: isDarkMode ? "#1a1b1e" : "#f8f9fa",
  showToolbar: false,
  showSideToolbar: false,
}); 