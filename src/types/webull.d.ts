declare module "webull-api-node" {
  export interface WebullCredentials {
    username: string;
    password: string;
    deviceId?: string;
    deviceName?: string;
    accountType?: string;
  }

  export interface WebullAuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenExpiry: number;
    uuid: string;
  }

  export interface WebullPosition {
    symbol: string;
    quantity: number;
    avgCost: number;
    marketValue: number;
    lastPrice: number;
    unrealizedPnl: number;
    unrealizedPnlRate: number;
    lastUpdated: string;
  }

  export interface WebullOrder {
    orderId: string;
    symbol: string;
    action: "BUY" | "SELL";
    orderType: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";
    timeInForce: "GTC" | "DAY" | "IOC";
    quantity: number;
    filledQuantity: number;
    price?: number;
    stopPrice?: number;
    limitPrice?: number;
    filledPrice?: number;
    status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED" | "PARTIAL_FILLED";
    createTime: string;
    updateTime: string;
    commission?: number;
    fees?: number;
  }

  export interface WebullAccount {
    accountId: string;
    accountType: string;
    currency: string;
    dayTrader: boolean;
    netLiquidation: number;
    totalCash: number;
    buyingPower: number;
    totalPositionValue: number;
  }

  export interface WebullClient {
    // Authentication
    login(credentials: WebullCredentials): Promise<WebullAuthResponse>;
    logout(): Promise<void>;
    refreshToken(refreshToken: string): Promise<WebullAuthResponse>;

    // Account
    getAccount(): Promise<WebullAccount>;
    getPositions(): Promise<WebullPosition[]>;

    // Orders
    getOrders(params?: {
      status?: string;
      startTime?: string;
      endTime?: string;
    }): Promise<WebullOrder[]>;
    placeOrder(order: Partial<WebullOrder>): Promise<string>;
    cancelOrder(orderId: string): Promise<void>;
    getOrder(orderId: string): Promise<WebullOrder>;

    // Market Data
    getQuote(symbol: string): Promise<{
      symbol: string;
      price: number;
      timestamp: string;
      volume: number;
      change: number;
      changeRatio: number;
    }>;
  }

  export class webull implements WebullClient {
    constructor(options?: { deviceId?: string; deviceName?: string });

    // Authentication
    login(credentials: WebullCredentials): Promise<WebullAuthResponse>;
    logout(): Promise<void>;
    refreshToken(refreshToken: string): Promise<WebullAuthResponse>;

    // Account
    getAccount(): Promise<WebullAccount>;
    getPositions(): Promise<WebullPosition[]>;

    // Orders
    getOrders(params?: {
      status?: string;
      startTime?: string;
      endTime?: string;
    }): Promise<WebullOrder[]>;
    placeOrder(order: Partial<WebullOrder>): Promise<string>;
    cancelOrder(orderId: string): Promise<void>;
    getOrder(orderId: string): Promise<WebullOrder>;

    // Market Data
    getQuote(symbol: string): Promise<{
      symbol: string;
      price: number;
      timestamp: string;
      volume: number;
      change: number;
      changeRatio: number;
    }>;
  }
}
