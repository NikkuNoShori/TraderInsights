/**
 * SnapTrade API types
 * This file defines types for the SnapTrade API integration
 */

/**
 * SnapTrade configuration
 */
export interface SnapTradeConfig {
  clientId: string;
  consumerSecret: string;
  redirectUri?: string;
}

/**
 * SnapTrade user
 */
export interface SnapTradeUser {
  userId: string;
  userSecret: string;
}

/**
 * SnapTrade connection status
 */
export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR',
}

/**
 * SnapTrade connection
 */
export interface SnapTradeConnection {
  id: string;
  brokerageId: string;
  brokerageName: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * SnapTrade account
 */
export interface SnapTradeAccount {
  id: string;
  connectionId: string;
  brokerageId: string;
  name: string;
  number: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * SnapTrade position
 */
export interface SnapTradePosition {
  id: string;
  accountId: string;
  symbol: string;
  symbolId: string;
  quantity: number;
  price: number;
  averageEntryPrice: number;
  marketValue: number;
  openPnl: number;
  dayPnl: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * SnapTrade balance
 */
export interface SnapTradeBalance {
  currency: string;
  cash: number;
  marketValue: number;
  totalValue: number;
  buyingPower: number;
  maintenanceExcess: number;
}

/**
 * SnapTrade order status
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
  PARTIAL = 'PARTIAL',
}

/**
 * SnapTrade order
 */
export interface SnapTradeOrder {
  id: string;
  accountId: string;
  symbol: string;
  symbolId: string;
  quantity: number;
  price: number;
  status: OrderStatus;
  action: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  timeInForce: 'DAY' | 'GTC' | 'FOK' | 'IOC';
  createdAt: string;
  updatedAt: string;
  filledAt?: string;
  filledQuantity?: number;
  filledPrice?: number;
}

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