/**
 * SnapTrade configuration
 * This file provides configuration for the SnapTrade service
 * 
 * Note: There is a naming discrepancy between SnapTrade's documentation and dashboard:
 * - Documentation uses: clientId and consumerKey
 * - Dashboard shows: "Client ID" and "Client Secret"
 * 
 * The mapping is:
 * - "Client ID" from dashboard → VITE_SNAPTRADE_CLIENT_ID
 * - "Client Secret" from dashboard → VITE_SNAPTRADE_CONSUMER_KEY
 */

import { SnapTradeConfig } from "./types";
import { createDebugLogger } from "@/stores/debugStore";

const configLogger = createDebugLogger("config");

/**
 * Get environment variable
 */
function getEnvVariable(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    configLogger.warn(`Environment variable ${name} not found`);
  }
  return value || '';
}

/**
 * Create SnapTrade configuration
 */
export const createConfig = (): SnapTradeConfig => {
  const clientId = getEnvVariable("VITE_SNAPTRADE_CLIENT_ID");
  const consumerKey = getEnvVariable("VITE_SNAPTRADE_CONSUMER_KEY");

  if (!clientId || !consumerKey) {
    throw new Error(
      "Missing required SnapTrade environment variables. Please check your .env file and ensure VITE_SNAPTRADE_CLIENT_ID and VITE_SNAPTRADE_CONSUMER_KEY are set."
    );
  }

  configLogger.debug('SnapTrade configuration created', {
    hasClientId: !!clientId,
    hasConsumerKey: !!consumerKey,
  });

  return {
    clientId,
    consumerKey,
  };
};

/**
 * Verify SnapTrade configuration
 */
export function verifySnapTradeConfig(): boolean {
  try {
    const config = createConfig();
    return !!config.clientId && !!config.consumerKey;
  } catch (error) {
    configLogger.error('Failed to verify SnapTrade configuration', { error });
    return false;
  }
} 