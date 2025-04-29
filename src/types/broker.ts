import {
  Account,
  AccountBalance,
  Position,
  Brokerage,
} from "snaptrade-typescript-sdk";

// Re-export SnapTrade types with our naming convention
export type BrokerAccount = Account;
export type BrokerBalance = AccountBalance;
export type BrokerPosition = Position;
export type BrokerOrder = any; // TODO: Update with correct SnapTrade type when available

// Supported broker types through SnapTrade
export type BrokerType =
  | "td_ameritrade"
  | "etrade"
  | "robinhood"
  | "webull"
  | "interactive_brokers";

// Core broker interface
export interface Broker extends Brokerage {
  logo?: string;
}

// Broker configuration type
export interface BrokerConfig {
  defaultRefreshInterval: number; // Default interval for data refresh
  maxRefreshInterval: number; // Maximum allowed refresh interval
  minRefreshInterval: number; // Minimum allowed refresh interval
  connectionTimeout: number; // Timeout for connection attempts
  retryAttempts: number; // Number of retry attempts for failed operations
  retryDelay: number; // Delay between retry attempts
}

// Connection status for a broker
export interface BrokerConnection {
  id: string;
  broker: BrokerType;
  userId: string;
  status: "connected" | "disconnected";
  lastSynced?: string;
  createdAt: string;
  updatedAt: string;
}

// Charles Schwab CSV format (kept for historical data import)
export interface SchwabTradeImport {
  Date: string;
  Symbol: string;
  Action: string;
  Quantity: number;
  Price: number;
  Fees: number;
  Amount: number;
  Description: string;
}

// Map broker types to display names
export const brokerNames: Record<BrokerType, string> = {
  td_ameritrade: "TD Ameritrade",
  etrade: "E*TRADE",
  robinhood: "Robinhood",
  webull: "Webull",
  interactive_brokers: "Interactive Brokers",
};

export const BROKER_DISPLAY_NAMES: Record<BrokerType, string> = {
  td_ameritrade: "TD Ameritrade",
  etrade: "E*TRADE",
  robinhood: "Robinhood",
  webull: "Webull",
  interactive_brokers: "Interactive Brokers",
};
