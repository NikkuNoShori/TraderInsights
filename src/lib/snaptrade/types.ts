/**
 * SnapTrade integration types
 */

// Configuration for SnapTrade client
export interface SnapTradeConfig {
  clientId: string;
  consumerKey: string;
}

// Error codes for SnapTrade operations
export enum SnapTradeErrorCode {
  INITIALIZATION_ERROR = "INITIALIZATION_ERROR",
  REGISTRATION_ERROR = "REGISTRATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  ACCOUNTS_ERROR = "ACCOUNTS_ERROR",
  POSITIONS_ERROR = "POSITIONS_ERROR",
  BALANCES_ERROR = "BALANCES_ERROR",
  ORDERS_ERROR = "ORDERS_ERROR",
  API_ERROR = "API_ERROR",
}

// Custom error class for SnapTrade operations
export class SnapTradeError extends Error {
  code: SnapTradeErrorCode;
  details?: unknown;

  constructor(
    message: string,
    code: SnapTradeErrorCode = SnapTradeErrorCode.API_ERROR,
    details?: unknown
  ) {
    super(message);
    this.name = "SnapTradeError";
    this.code = code;
    this.details = details;
  }
}
