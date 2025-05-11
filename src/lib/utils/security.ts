/**
 * Security utility functions for safe logging and handling sensitive data
 */

/**
 * Masks a sensitive string for safe logging
 * @param value The string to mask
 * @param showChars Number of characters to show at start and end
 * @returns A masked version of the string
 */
export function maskSensitiveData(
  value: string | null | undefined,
  showChars = 3
): string {
  if (!value) return "NOT_SET";
  if (value.length <= showChars * 2) return "***";

  return `${value.substring(0, showChars)}...${value.substring(
    value.length - showChars
  )}`;
}

/**
 * Prepares an object for logging by masking sensitive fields
 * @param obj The object to prepare
 * @param sensitiveKeys Array of key patterns to treat as sensitive
 * @param seen Set of already processed objects to prevent circular reference issues
 * @returns A new object with sensitive data masked
 */
export function prepareForLogging<T extends Record<string, any>>(
  obj: T,
  sensitiveKeys: string[] = [
    "key",
    "secret",
    "password",
    "token",
    "id",
    "Key",
    "Secret",
    "Password",
    "Token",
    "Id",
  ],
  seen = new Set()
): Record<string, any> {
  // Handle null or undefined
  if (!obj) return obj;

  // Check for circular references
  if (seen.has(obj)) {
    return { value: "[Circular Reference]" };
  }

  // Add this object to the seen set
  seen.add(obj);

  try {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      // Check if this key should be masked based on patterns
      const isSensitive = sensitiveKeys.some(
        (pattern) =>
          key.includes(pattern) ||
          (typeof key === "string" &&
            key.toLowerCase().includes(pattern.toLowerCase()))
      );

      if (isSensitive && typeof value === "string") {
        // Mask sensitive string values
        acc[key] = maskSensitiveData(value);
      } else if (value && typeof value === "object") {
        if (Array.isArray(value)) {
          // Handle arrays safely
          acc[key] = value.map((item) =>
            typeof item === "object" && item !== null
              ? prepareForLogging(item, sensitiveKeys, seen)
              : item
          );
        } else {
          // Recursively process nested objects with the same seen set
          try {
            acc[key] = prepareForLogging(value, sensitiveKeys, seen);
          } catch (e) {
            // If we can't process this object safely, mask it
            acc[key] = "[Complex Object]";
          }
        }
      } else {
        // Pass through non-sensitive values
        acc[key] = value;
      }

      return acc;
    }, {} as Record<string, any>);
  } catch (e) {
    // If anything goes wrong, return a safe placeholder
    return { error: "Error preparing object for logging" };
  }
}

/**
 * Safe logger that automatically masks sensitive data
 */
export const safeLogger = {
  log: (message: string, data?: Record<string, any>) => {
    console.log(message, data ? prepareForLogging(data) : "");
  },

  error: (message: string, data?: Record<string, any>) => {
    console.error(message, data ? prepareForLogging(data) : "");
  },

  warn: (message: string, data?: Record<string, any>) => {
    console.warn(message, data ? prepareForLogging(data) : "");
  },

  info: (message: string, data?: Record<string, any>) => {
    console.info(message, data ? prepareForLogging(data) : "");
  },
};
