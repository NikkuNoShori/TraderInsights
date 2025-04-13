/**
 * SnapTrade configuration
 * This file provides configuration for the SnapTrade service
 */

import type { SnapTradeConfig } from './types';

/**
 * Get SnapTrade configuration from environment variables
 * @returns SnapTrade configuration
 * @throws Error if required environment variables are missing or invalid
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
    clientId = import.meta.env.VITE_SNAPTRADE_CLIENT_ID?.trim();
    consumerKey = import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY?.trim();
    redirectUri = import.meta.env.VITE_SNAPTRADE_REDIRECT_URI?.trim();
  } else {
    // Server environment - use process.env
    clientId = process.env.SNAPTRADE_CLIENT_ID?.trim();
    consumerKey = process.env.SNAPTRADE_CONSUMER_KEY?.trim();
    redirectUri = process.env.SNAPTRADE_REDIRECT_URI?.trim();
  }

  // Set default redirect URI if not provided
  if (!redirectUri) {
    redirectUri = isBrowser
      ? `${window.location.origin}/broker-callback`
      : "http://localhost:5173/broker-callback";
  }

  // Validate required configuration
  if (!clientId) {
    throw new Error(
      isBrowser
        ? "VITE_SNAPTRADE_CLIENT_ID is required"
        : "SNAPTRADE_CLIENT_ID is required"
    );
  }

  if (!consumerKey) {
    throw new Error(
      isBrowser
        ? "VITE_SNAPTRADE_CONSUMER_KEY is required"
        : "SNAPTRADE_CONSUMER_KEY is required"
    );
  }

  // Log configuration (without sensitive values)
  console.log("SnapTrade configuration:", {
    clientId,
    hasConsumerKey: !!consumerKey,
    redirectUri,
    environment: isBrowser ? "browser" : "server",
  });

  return {
    clientId,
    consumerKey,
    redirectUri,
  };
} 