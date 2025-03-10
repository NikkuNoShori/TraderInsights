import { SCREEN_BREAKPOINTS, ScreenSize } from "@/stores/chartStore";

/**
 * Get the current screen size based on window width
 * @returns The current screen size
 */
export function getCurrentScreenSize(): ScreenSize {
  // Only run this on the client
  if (typeof window === "undefined") return "md";

  const width = window.innerWidth;

  if (width >= SCREEN_BREAKPOINTS.xxl) return "xxl";
  if (width >= SCREEN_BREAKPOINTS.xl) return "xl";
  if (width >= SCREEN_BREAKPOINTS.lg) return "lg";
  if (width >= SCREEN_BREAKPOINTS.md) return "md";
  if (width >= SCREEN_BREAKPOINTS.sm) return "sm";
  return "xs";
}

/**
 * Check if the current screen is smaller than a given breakpoint
 * @param breakpoint The breakpoint to check against
 * @returns True if the screen is smaller than the breakpoint
 */
export function isSmallerThan(breakpoint: ScreenSize): boolean {
  if (typeof window === "undefined") return false;

  const width = window.innerWidth;
  return width < SCREEN_BREAKPOINTS[breakpoint];
}

/**
 * Check if the current screen is larger than a given breakpoint
 * @param breakpoint The breakpoint to check against
 * @returns True if the screen is larger than the breakpoint
 */
export function isLargerThan(breakpoint: ScreenSize): boolean {
  if (typeof window === "undefined") return false;

  const width = window.innerWidth;
  return width >= SCREEN_BREAKPOINTS[breakpoint];
}

/**
 * Get a value based on the current screen size
 * @param values Object with values for different screen sizes
 * @param defaultValue Default value if no match is found
 * @returns The value for the current screen size
 */
export function getResponsiveValue<T>(
  values: Partial<Record<ScreenSize, T>>,
  defaultValue: T
): T {
  const currentSize = getCurrentScreenSize();

  // Try to find a value for the current size
  if (values[currentSize] !== undefined) {
    return values[currentSize] as T;
  }

  // If not found, try to find the closest smaller size
  const sizes: ScreenSize[] = ["xs", "sm", "md", "lg", "xl", "xxl"];
  const currentIndex = sizes.indexOf(currentSize);

  // Look for smaller sizes
  for (let i = currentIndex - 1; i >= 0; i--) {
    const size = sizes[i];
    if (values[size] !== undefined) {
      return values[size] as T;
    }
  }

  // If still not found, try larger sizes
  for (let i = currentIndex + 1; i < sizes.length; i++) {
    const size = sizes[i];
    if (values[size] !== undefined) {
      return values[size] as T;
    }
  }

  // Return default if no match found
  return defaultValue;
}
