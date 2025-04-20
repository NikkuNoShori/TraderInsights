/**
 * SnapTrade API types
 * This file defines types for the SnapTrade API integration
 */

import type {
  UserIDandSecret,
  Brokerage,
  BrokerageAuthorization,
  Account,
  Position,
  Balance,
  AccountOrderRecord,
  AccountHoldingsAccount,
} from "snaptrade-typescript-sdk";

/**
 * SnapTrade configuration
 */
export interface SnapTradeConfig {
  clientId: string;
  consumerKey: string; // Used for both frontend and backend authentication
  redirectUri?: string;
}

/**
 * SnapTrade user
 * Ensuring userId and userSecret are required
 */
export interface SnapTradeUser {
  userId: string;
  userSecret: string;
}

/**
 * SnapTrade connection status
 */
export type ConnectionStatus = "connected" | "disconnected" | "pending";

/**
 * SnapTrade connection
 */
export type SnapTradeConnection = BrokerageAuthorization;

/**
 * SnapTrade account
 */
export type SnapTradeAccount = Account;

/**
 * SnapTrade position
 */
export type SnapTradePosition = Position;

/**
 * SnapTrade balance
 */
export type SnapTradeBalance = Balance;

/**
 * SnapTrade order
 */
export type SnapTradeOrder = AccountOrderRecord;

/**
 * SnapTrade holdings
 */
export type SnapTradeHoldings = AccountHoldingsAccount;

/**
 * SnapTrade brokerage
 */
export interface SnaptradeBrokerage {
  id: string;
  name: string;
  slug: string;
  logo: string;
  url: string;
  status: 'ACTIVE' | 'BETA' | 'COMING_SOON' | 'INACTIVE';
  authTypes: ('OAUTH' | 'CREDENTIALS')[];
  isOAuthSupported: boolean;
  isCredentialsSupported: boolean;
} 