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

class WebullApiClient implements WebullClient {
  private baseUrl = "https://api.webull.com/api";
  private deviceId: string;
  private deviceName: string;
  private accessToken: string | null = null;

  constructor(options?: { deviceId?: string; deviceName?: string }) {
    this.deviceId = options?.deviceId || this.generateDeviceId();
    this.deviceName = options?.deviceName || "TraderInsights Web";
  }

  private generateDeviceId(): string {
    return `TI_${Math.random().toString(36).substring(2)}${Date.now().toString(
      36,
    )}`;
  }

  // For development/testing, we'll use mock data
  async login(credentials: WebullCredentials): Promise<WebullAuthResponse> {
    // In development, we'll just return a mock auth response
    const mockAuth: WebullAuthResponse = {
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
      tokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      uuid: "mock_uuid",
    };

    this.accessToken = mockAuth.accessToken;
    return mockAuth;
  }

  async logout(): Promise<void> {
    this.accessToken = null;
  }

  async getOrders(params?: {
    status?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<WebullOrder[]> {
    // Return mock orders for development
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
      {
        orderId: `mock-${Date.now()}-2`,
        symbol: "GOOGL",
        action: "SELL",
        orderType: "LIMIT",
        timeInForce: "GTC",
        quantity: 50,
        filledQuantity: 50,
        price: 2800.0,
        filledPrice: 2800.0,
        status: "FILLED",
        createTime: new Date(Date.now() - 172800000).toISOString(),
        updateTime: new Date(Date.now() - 86400000).toISOString(),
        commission: 0,
      },
    ];
  }

  async getPositions(): Promise<WebullPosition[]> {
    // Return mock positions for development
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
    // Return mock account data for development
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

export const webull = WebullApiClient;
