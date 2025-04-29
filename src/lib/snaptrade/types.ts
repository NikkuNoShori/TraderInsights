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
  Configuration,
  Snaptrade,
  AuthenticationApiDeleteSnapTradeUserRequest,
  AuthenticationApiLoginSnapTradeUserRequest,
  AuthenticationApiRegisterSnapTradeUserRequest,
  SymbolsQuotesInner,
  DeleteUserResponse,
} from "snaptrade-typescript-sdk";

/**
 * Configuration for SnapTrade client
 */
export interface SnapTradeConfig {
  clientId: string;
  consumerKey: string;
  baseUrl?: string;
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
  AuthenticationLoginSnapTradeUser200Response,
  AuthenticationApiRegisterSnapTradeUserRequest,
  AuthenticationApiLoginSnapTradeUserRequest,
  AuthenticationApiDeleteSnapTradeUserRequest,
  SymbolsQuotesInner,
  Configuration,
  Snaptrade,
  DeleteUserResponse,
};

/**
 * SnapTrade error codes
 */
export enum SnapTradeErrorCode {
  API_ERROR = "API_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

/**
 * SnapTrade error class
 */
export class SnapTradeError extends Error {
  code: SnapTradeErrorCode;
  originalError?: unknown;

  constructor({
    code,
    message,
    originalError,
  }: {
    code: SnapTradeErrorCode;
    message: string;
    originalError?: unknown;
  }) {
    super(message);
    this.code = code;
    this.originalError = originalError;
    this.name = "SnapTradeError";
  }
}

/**
 * User credentials for SnapTrade
 */
export interface SnapTradeUser {
  userId: string;
  userSecret: string;
}

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
export interface SnapTradeConnection extends BrokerageAuthorization {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  lastSyncedAt?: string;
}

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
 * List of brokerages
 */
export type BrokerageList = BrokerageAuthorization[];

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Connection Types
export interface BrokerConnection {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  lastSyncedAt?: string;
}

// Type Guards
export function isSnapTradeError(error: unknown): error is SnapTradeError {
  return error instanceof SnapTradeError;
}

export function isSnapTradeAccount(account: unknown): account is Account {
  return (
    typeof account === "object" &&
    account !== null &&
    "id" in account &&
    "name" in account &&
    "type" in account &&
    "status" in account
  );
}

export function isSnapTradePosition(position: unknown): position is Position {
  return (
    typeof position === "object" &&
    position !== null &&
    "symbol" in position &&
    "units" in position &&
    "price" in position
  );
}

export function isSnapTradeOrder(order: unknown): order is AccountOrderRecord {
  return (
    typeof order === "object" &&
    order !== null &&
    "symbol" in order &&
    "status" in order
  );
}

// Validation functions
export function validateUserId(userId: string): void {
  if (!userId) {
    throw new SnapTradeError({
      code: SnapTradeErrorCode.VALIDATION_ERROR,
      message: "User ID is required",
    });
  }
}

export function validateUserSecret(userSecret: string): void {
  if (!userSecret) {
    throw new SnapTradeError({
      code: SnapTradeErrorCode.VALIDATION_ERROR,
      message: "User secret is required",
    });
  }
}

export function validateConfig(config: SnapTradeConfig): void {
  if (!config.clientId || !config.consumerKey) {
    throw new SnapTradeError({
      code: SnapTradeErrorCode.VALIDATION_ERROR,
      message: "Missing required SnapTrade configuration parameters",
    });
  }
}

export type SnapTradeSDK = Snaptrade;
export type SnapTradeSDKConfig = Configuration;

// Webhook Types
export interface SnapTradeWebhookPayload {
  eventType: string;
  data: any;
  timestamp: string;
  signature: string;
}

// Component Props Types
export interface BrokerListProps {
  config: SnapTradeConfig;
  onSelect: (broker: Brokerage) => void;
}

export interface BrokerConnectionPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (authorizationId: string) => void;
  onError?: (error: {
    errorCode: string;
    statusCode: string;
    detail: string;
  }) => void;
  config: SnapTradeConfig;
  userId: string;
  userSecret: string;
}

export interface BrokerSessionState {
  userId?: string;
  userSecret?: string;
  lastSyncTime?: number;
  selectedAccountId?: string | null;
  expandedDescriptions?: Set<string>;
}

/**
 * Account information
 */
export interface AccountInfo {
  id: string;
  name: string;
  type: string;
  number: string;
  institution: string;
}

/**
 * Position information
 */
export interface PositionInfo {
  symbol: string;
  units: number;
  price: number;
  value: number;
}

/**
 * Balance information
 */
export interface BalanceInfo {
  currency: string;
  cash: number;
  marketValue: number;
  totalEquity: number;
}

/**
 * Order information
 */
export interface OrderInfo {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  status: string;
  createdAt: string;
}

/**
 * SnapTrade API response types that extend/correct SDK types
 */
export interface SnapTradeConnectionResponse {
  redirectURI: string;
  sessionId: string;
}

export interface SnapTradeUser {
  userId: string;
  userSecret: string;
} 