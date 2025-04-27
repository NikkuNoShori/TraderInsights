/**
 * SnapTrade API types
 * This file defines types for the SnapTrade API integration
 */

import {
  Account,
  AccountOrderRecord,
  Balance,
  Brokerage,
  BrokerageAuthorization,
  Position,
  UserIDandSecret,
  AuthenticationLoginSnapTradeUser200Response,
  BrokerageType,
  EncryptedResponse,
} from "snaptrade-typescript-sdk";

/**
 * Configuration for SnapTrade client
 */
export interface SnapTradeConfig {
  clientId: string;
  consumerKey: string;
}

/**
 * Re-export SDK types
 */
export type {
  Account,
  AccountOrderRecord,
  Balance,
  Brokerage,
  BrokerageAuthorization,
  Position,
  UserIDandSecret,
};

/**
 * Extended error type for SnapTrade operations
 */
export class SnapTradeError extends Error {
  code: SnapTradeErrorCode;

  constructor(message: string, code: SnapTradeErrorCode) {
    super(message);
    this.code = code;
  }
}

/**
 * Error codes for SnapTrade operations
 */
export enum SnapTradeErrorCode {
  NOT_AUTHENTICATED = "NOT_AUTHENTICATED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  API_ERROR = "API_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * User credentials for SnapTrade
 */
export type SnapTradeCredentials = UserIDandSecret;

/**
 * Account information from SnapTrade
 */
export type SnapTradeAccount = Account;

/**
 * Position information from SnapTrade
 */
export type SnapTradePosition = Position;

/**
 * Balance information from SnapTrade
 */
export type SnapTradeBalance = Balance;

/**
 * Order information from SnapTrade
 */
export type SnapTradeOrder = AccountOrderRecord;

/**
 * Brokerage connection information
 */
export type SnapTradeConnection = BrokerageAuthorization;

/**
 * Brokerage information
 */
export type SnapTradeBrokerage = Brokerage;

/**
 * Response type for connection link creation
 */
export interface ConnectionLinkResponse {
  redirectURI: string;
}

/**
 * Options for creating a connection link
 */
export interface ConnectionLinkOptions {
  broker: string;
  immediateRedirect?: boolean;
  customRedirect?: string;
}

/**
 * SnapTrade user information
 */
export interface SnapTradeUser {
  userId: string;
  userSecret: string;
}

/**
 * Connection session information
 */
export interface ConnectionSession {
  sessionId: string;
  userId: string;
  userSecret: string;
  brokerId: string;
  redirectUrl: string;
  createdAt: string;
  status: "pending" | "completed" | "failed";
  error?: string;
  connectionType?: "read" | "trade";
}

export type BrokerageList = BrokerageType[];

// Type aliases for SDK types
export type AccountBalance = Balance;
export type UserResponse = SnapTradeUser; 