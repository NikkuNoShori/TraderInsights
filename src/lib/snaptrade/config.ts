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
  return process.env[key] || process.env[`VITE_${key}`] || undefined;
}

/**
 * Get SnapTrade configuration
 */
export function getSnapTradeConfig(): SnapTradeConfig {
  const clientId = import.meta.env.VITE_SNAPTRADE_CLIENT_ID;
  const consumerKey = import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY;
  const redirectUri = import.meta.env.VITE_SNAPTRADE_REDIRECT_URI;
  const isDemo = import.meta.env.VITE_APP_ENV === "development";

  if (!clientId || !consumerKey || !redirectUri) {
    throw new Error("Missing required SnapTrade configuration");
  }

  return {
    clientId,
    consumerKey,
    redirectUri,
    isDemo,
  };
}

/**
 * Verify SnapTrade configuration
 * @returns boolean indicating if configuration is valid
 */
export function verifySnapTradeConfig(): boolean {
  try {
    const config = getSnapTradeConfig();
    const isBrowser = typeof window !== "undefined";
    return (
      !!config.clientId &&
      !!config.redirectUri &&
      (isBrowser ? !!config.consumerKey : !!config.consumerKey)
    );
  } catch (error) {
    console.error("SnapTrade configuration verification failed:", error);
    return false;
  }
} 