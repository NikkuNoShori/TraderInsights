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
  const clientId = import.meta.env.VITE_SNAPTRADE_CLIENT_ID;
  const consumerSecret = import.meta.env.VITE_SNAPTRADE_CONSUMER_SECRET;
  const redirectUri = import.meta.env.VITE_SNAPTRADE_REDIRECT_URI;

  if (!clientId) {
    throw new Error('VITE_SNAPTRADE_CLIENT_ID is required');
  }

  if (!consumerSecret) {
    throw new Error('VITE_SNAPTRADE_CONSUMER_SECRET is required');
  }

  if (!redirectUri) {
    throw new Error('VITE_SNAPTRADE_REDIRECT_URI is required');
  }

  return {
    clientId,
    consumerSecret,
    redirectUri,
  };
} 