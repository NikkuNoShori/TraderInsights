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
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
}

/**
 * SnapTrade error class
 */
export class SnapTradeError extends Error {
  constructor(params: {
    code: SnapTradeErrorCode;
    message: string;
    originalError?: unknown;
  }) {
    super(params.message);
    this.code = params.code;
    this.originalError = params.originalError;
  }

  code: SnapTradeErrorCode;
  originalError?: unknown;
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
export function validateUserId(userId: string): ValidationResult {
  const errors: string[] = [];
  if (!userId) {
    errors.push("User ID is required");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateUserSecret(userSecret: string): ValidationResult {
  const errors: string[] = [];
  if (!userSecret) {
    errors.push("User secret is required");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateConfig(config: SnapTradeConfig): ValidationResult {
  const errors: string[] = [];
  if (!config.clientId) {
    errors.push("Client ID is required");
  }
  if (!config.consumerKey) {
    errors.push("Consumer key is required");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
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