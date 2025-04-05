/**
 * Format a number as currency
 * @param value The number to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = "USD"): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as a percentage
 * @param value The number to format (0-100)
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0%";
  }

  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a date as a readable string
 * @param date The date to format
 * @param format The format to use (default: short)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: "short" | "medium" | "long" = "short"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: format === "short" ? "2-digit" : format === "medium" ? "short" : "long",
    day: "2-digit",
  };

  return new Intl.DateTimeFormat("en-US", options).format(dateObj);
}

/**
 * Format a number with commas for thousands
 * @param value The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Format a large number with K, M, B suffixes
 * @param value The number to format
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted number string
 */
export function formatLargeNumber(value: number, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  const absValue = Math.abs(value);
  
  if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  }
  
  if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  }
  
  if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }
  
  return value.toFixed(decimals);
}

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return `${formatDate(d)} ${formatTime(d)}`;
};

export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
};
