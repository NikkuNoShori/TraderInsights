import type {
  WebullCredentials,
  WebullAuthResponse,
  WebullOrder,
  WebullPosition,
  WebullAccount,
} from "webull-api-node";

export type {
  WebullCredentials,
  WebullAuthResponse,
  WebullOrder,
  WebullPosition,
  WebullAccount,
};

export interface WebullClient {
  login(credentials: WebullCredentials): Promise<WebullAuthResponse>;
  logout(): Promise<void>;
  getOrders(params?: {
    status?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<WebullOrder[]>;
  getPositions(): Promise<WebullPosition[]>;
  getAccount(): Promise<WebullAccount>;
}

export class WebullClient {
  constructor() {}

  async login(): Promise<WebullAuthResponse> {
    return {
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
      tokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
      uuid: "mock_uuid",
    };
  }

  async getOrders(): Promise<WebullOrder[]> {
    return [
      {
        orderId: `mock-${Date.now()}-1`,
        symbol: "AAPL",
        action: "BUY",
        orderType: "MARKET",
        timeInForce: "DAY",
        quantity: 100,
        filledQuantity: 100,
        price: 150.0,
        filledPrice: 150.0,
        status: "FILLED",
        createTime: new Date(Date.now() - 86400000).toISOString(),
        updateTime: new Date().toISOString(),
        commission: 0,
      },
    ];
  }

  async logout(): Promise<void> {
    // Implementation
  }

  async getPositions(): Promise<WebullPosition[]> {
    return [
      {
        symbol: "AAPL",
        quantity: 100,
        avgCost: 150.0,
        marketValue: 16000.0,
        lastPrice: 160.0,
        unrealizedPnl: 1000.0,
        unrealizedPnlRate: 0.0625,
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  async getAccount(): Promise<WebullAccount> {
    return {
      accountId: "mock_account",
      accountType: "MARGIN",
      currency: "USD",
      dayTrader: false,
      netLiquidation: 100000.0,
      totalCash: 50000.0,
      buyingPower: 150000.0,
      totalPositionValue: 50000.0,
    };
  }
}

export const webull = WebullClient;
