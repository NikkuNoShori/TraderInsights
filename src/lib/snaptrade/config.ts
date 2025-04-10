/**
 * SnapTrade configuration
 * This file provides configuration for the SnapTrade service
 */

import type { SnapTradeConfig } from './types';

/**
 * Get SnapTrade configuration from environment variables
 * @returns SnapTrade configuration
 * @throws Error if required environment variables are missing
 */
export function getSnapTradeConfig(): SnapTradeConfig {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  // Get environment variables based on the environment
  let clientId: string | undefined;
  let consumerKey: string | undefined;
  let redirectUri: string | undefined;

  if (isBrowser) {
    // Browser environment - use import.meta.env
    clientId = import.meta.env.VITE_SNAPTRADE_CLIENT_ID;
    consumerKey = import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY;
    redirectUri = import.meta.env.VITE_SNAPTRADE_REDIRECT_URI;
  } else {
    // Server environment - use process.env
    clientId = process.env.VITE_SNAPTRADE_CLIENT_ID;
    consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY;
    redirectUri = process.env.VITE_SNAPTRADE_REDIRECT_URI;
  }

  // Set default redirect URI if not provided
  if (!redirectUri) {
    redirectUri = isBrowser
      ? `${window.location.origin}/broker-callback`
      : "http://localhost:5173/broker-callback";
  }

  // Log configuration (without sensitive values)
  console.log("SnapTrade configuration:", {
    hasClientId: !!clientId,
    hasConsumerKey: !!consumerKey,
    redirectUri,
    environment: isBrowser ? "browser" : "server",
  });

  // Validate required configuration
  if (!clientId) {
    throw new Error("VITE_SNAPTRADE_CLIENT_ID is required");
  }

  if (!consumerKey) {
    throw new Error("VITE_SNAPTRADE_CONSUMER_KEY is required");
  }

  return {
    clientId,
    consumerKey,
    redirectUri,
  };
} 