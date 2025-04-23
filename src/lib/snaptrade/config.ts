/**
 * SnapTrade configuration
 * This file provides configuration for the SnapTrade service
 * 
 * Note: There is a naming discrepancy between SnapTrade's documentation and dashboard:
 * - Documentation uses: clientId and consumerKey
 * - Dashboard shows: "Client ID" and "Client Secret"
 * 
 * The mapping is:
 * - "Client ID" from dashboard → clientId in code
 * - "Client Secret" from dashboard → consumerKey in code
 * 
 * Example:
 * Dashboard "Client ID": TRADING-INSIGHTS-TEST-MJFEC → VITE_SNAPTRADE_CLIENT_ID
 * Dashboard "Client Secret": zdPiwYb3etVq3uyJMCacZboOLl7ucO9mREL2xdc6Snfat9nLkt → VITE_SNAPTRADE_CONSUMER_KEY
 */

import { SnapTradeConfig } from "./types";
import { createDebugLogger, DebugLogger } from "@/stores/debugStore";

// Create debug logger
const configLogger = createDebugLogger("config") as DebugLogger & {
  lastConfig?: SnapTradeConfig;
};

/**
 * Get the current environment
 */
const getEnvironment = (): "browser" | "node" => {
  return typeof window !== "undefined" ? "browser" : "node";
};

/**
 * Helper function to safely get environment variable
 * This handles both Vite-style client variables and server variables
 */
function getEnvVariable(key: string): string | undefined {
  const environment = getEnvironment();

  // For browser environment, look for import.meta.env variables (Vite style)
  if (environment === "browser") {
    // @ts-ignore - Vite specific
    if (import.meta?.env) {
      // @ts-ignore - Vite specific
      return import.meta.env[`VITE_${key}`] || undefined;
    }
    return undefined;
  }

  // For Node.js environment (server-side)
  return process.env[key] || undefined;
}

const getEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

/**
 * Get SnapTrade configuration
 * This function returns the configuration object for SnapTrade
 * The configuration is environment-specific (browser vs node)
 */
export function getSnapTradeConfig(): SnapTradeConfig {
  const environment = getEnvironment();
  const prefix = environment === "browser" ? "VITE_" : "";

  const clientId = getEnvVar(`${prefix}SNAPTRADE_CLIENT_ID`);
  const consumerKey = getEnvVar(`${prefix}SNAPTRADE_CONSUMER_KEY`);

  // Use fallback values in development mode
  if (
    (!clientId || !consumerKey) &&
    environment === "browser" &&
    typeof import.meta !== "undefined" &&
    (import.meta.env.DEV || import.meta.env.MODE === "development")
  ) {
    return {
      clientId: "TRADING-INSIGHTS-TEST-MJFEC",
      consumerKey: "zdPiwYb3etVq3uyJMCacZboOLl7ucO9mREL2xdc6Snfat9nLkt",
      isDemo: true,
    };
  }

  if (!clientId || !consumerKey) {
    throw new Error("Missing required SnapTrade configuration");
  }

  const config: SnapTradeConfig = {
    clientId,
    consumerKey,
    isDemo:
      environment === "browser" &&
      typeof import.meta !== "undefined" &&
      (import.meta.env.DEV || import.meta.env.MODE === "development"),
  };

  // Log the config (without sensitive data)
  configLogger.debug("SnapTrade config loaded", {
    hasClientId: !!config.clientId,
    hasConsumerKey: !!config.consumerKey,
    isDemo: config.isDemo,
  });

  // Store the last config for debugging
  configLogger.lastConfig = config;

  return config;
}

/**
 * Verify that the SnapTrade configuration is valid
 * This is a helper function to check if the configuration is properly set up
 */
export function verifySnapTradeConfig(): boolean {
  try {
    const config = getSnapTradeConfig();
    return !!config.clientId && !!config.consumerKey;
  } catch (error) {
    return false;
  }
} 