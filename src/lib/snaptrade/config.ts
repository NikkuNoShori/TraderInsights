/**
 * SnapTrade configuration
 * This file provides configuration for the SnapTrade service
 */

import { SnapTradeConfig } from "./types";

/**
 * Get SnapTrade configuration from environment variables
 * @returns SnapTrade configuration
 * @throws Error if required environment variables are missing
 */
export function getSnapTradeConfig(): SnapTradeConfig {
  const clientId = import.meta.env.VITE_SNAPTRADE_CLIENT_ID;
  const consumerSecret = import.meta.env.VITE_SNAPTRADE_CONSUMER_SECRET;
  const redirectUri = import.meta.env.VITE_SNAPTRADE_REDIRECT_URI;

  if (!clientId || !consumerSecret || !redirectUri) {
    console.error("Missing required SnapTrade environment variables:", {
      hasClientId: !!clientId,
      hasConsumerSecret: !!consumerSecret,
      hasRedirectUri: !!redirectUri,
    });
    throw new Error("Missing required SnapTrade configuration");
  }

  return {
    clientId,
    consumerSecret,
    redirectUri,
  };
} 