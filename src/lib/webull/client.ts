import WebullApi from 'webull-api-ts';
import type {
  WebullCredentials,
  WebullAuthResponse,
  WebullOrder,
  WebullPosition,
  WebullAccount,
} from './types';

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
  refreshToken(refreshToken: string): Promise<WebullAuthResponse>;
  getOrders(params?: {
    status?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<WebullOrder[]>;
  getPositions(): Promise<WebullPosition[]>;
  getAccount(): Promise<WebullAccount>;
}

/**
 * WebUll API client implementation using the webull-api-ts package.
 */
export class WebullApiClient implements WebullClient {
  private api: WebullApi;
  private isAuthenticated: boolean = false;
  private deviceId: string;

  constructor(deviceId?: string) {
    this.api = new WebullApi();
    this.deviceId = deviceId || this.generateDeviceId();
  }

  /**
   * Generate a random device ID if not provided.
   */
  private generateDeviceId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Login to WebUll.
   * @param credentials WebUll credentials
   * @returns Authentication response
   */
  async login(credentials: WebullCredentials): Promise<WebullAuthResponse> {
    try {
      // Set the device ID
      this.api.deviceId = credentials.deviceId || this.deviceId;
      
      // Login with credentials
      const loginResponse = await this.api.login(
        credentials.username,
        credentials.password,
        credentials.deviceName || 'TraderInsights',
        credentials.mfaCode
      );
      
      this.isAuthenticated = true;
      
      return {
        accessToken: loginResponse.accessToken || '',
        refreshToken: loginResponse.refreshToken || '',
        tokenExpiry: loginResponse.tokenExpiry || Date.now() + 24 * 60 * 60 * 1000,
        uuid: loginResponse.uuid || '',
      };
    } catch (error) {
      console.error('WebUll login error:', error);
      throw new Error(`Failed to login to WebUll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Refresh the authentication token.
   * @param refreshToken The refresh token
   * @returns New authentication response
   */
  async refreshToken(refreshToken: string): Promise<WebullAuthResponse> {
    try {
      // Refresh the token
      const refreshResponse = await this.api.refreshToken(refreshToken);
      
      this.isAuthenticated = true;
      
      return {
        accessToken: refreshResponse.accessToken || '',
        refreshToken: refreshResponse.refreshToken || '',
        tokenExpiry: refreshResponse.tokenExpiry || Date.now() + 24 * 60 * 60 * 1000,
        uuid: refreshResponse.uuid || '',
      };
    } catch (error) {
      console.error('WebUll refresh token error:', error);
      throw new Error(`Failed to refresh WebUll token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Logout from WebUll.
   */
  async logout(): Promise<void> {
    try {
      if (this.isAuthenticated) {
        await this.api.logout();
        this.isAuthenticated = false;
      }
    } catch (error) {
      console.error('WebUll logout error:', error);
      throw new Error(`Failed to logout from WebUll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get orders from WebUll.
   * @param params Optional parameters for filtering orders
   * @returns List of orders
   */
  async getOrders(params?: {
    status?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<WebullOrder[]> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Not authenticated. Please login first.');
      }
      
      // Get orders from WebUll
      const orders = await this.api.getOrders(
        params?.status,
        params?.startTime,
        params?.endTime
      );
      
      // Map WebUll orders to our WebullOrder interface
      return orders.map(order => ({
        orderId: order.orderId || '',
        symbol: order.symbol || '',
        action: (order.action as "BUY" | "SELL") || 'BUY',
        orderType: (order.orderType as "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT") || 'MARKET',
        timeInForce: (order.timeInForce as "GTC" | "DAY" | "IOC") || 'DAY',
        quantity: order.quantity || 0,
        filledQuantity: order.filledQuantity || 0,
        price: order.price,
        filledPrice: order.filledPrice,
        status: (order.status as "PENDING" | "FILLED" | "CANCELLED" | "REJECTED" | "PARTIAL_FILLED") || 'PENDING',
        createTime: order.createTime || new Date().toISOString(),
        updateTime: order.updateTime || new Date().toISOString(),
        commission: order.commission,
      }));
    } catch (error) {
      console.error('WebUll getOrders error:', error);
      throw new Error(`Failed to get orders from WebUll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get positions from WebUll.
   * @returns List of positions
   */
  async getPositions(): Promise<WebullPosition[]> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Not authenticated. Please login first.');
      }
      
      // Get positions from WebUll
      const positions = await this.api.getPositions();
      
      // Map WebUll positions to our WebullPosition interface
      return positions.map(position => ({
        symbol: position.symbol || '',
        quantity: position.quantity || 0,
        avgCost: position.avgCost || 0,
        marketValue: position.marketValue || 0,
        lastPrice: position.lastPrice || 0,
        unrealizedPnl: position.unrealizedPnl || 0,
        unrealizedPnlRate: position.unrealizedPnlRate || 0,
        lastUpdated: position.lastUpdated || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('WebUll getPositions error:', error);
      throw new Error(`Failed to get positions from WebUll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get account information from WebUll.
   * @returns Account information
   */
  async getAccount(): Promise<WebullAccount> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Not authenticated. Please login first.');
      }
      
      // Get account information from WebUll
      const account = await this.api.getAccount();
      
      return {
        accountId: account.accountId || '',
        accountType: account.accountType || '',
        currency: account.currency || 'USD',
        dayTrader: account.dayTrader || false,
        netLiquidation: account.netLiquidation || 0,
        totalCash: account.totalCash || 0,
        buyingPower: account.buyingPower || 0,
        totalPositionValue: account.totalPositionValue || 0,
      };
    } catch (error) {
      console.error('WebUll getAccount error:', error);
      throw new Error(`Failed to get account information from WebUll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Mock WebUll API client for development and testing.
 */
export class MockWebullClient implements WebullClient {
  private isAuthenticated: boolean = false;

  async login(): Promise<WebullAuthResponse> {
    this.isAuthenticated = true;
    return {
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
      tokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
      uuid: "mock_uuid",
    };
  }

  async logout(): Promise<void> {
    this.isAuthenticated = false;
  }

  async getOrders(): Promise<WebullOrder[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please login first.');
    }
    
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

  async getPositions(): Promise<WebullPosition[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please login first.');
    }
    
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
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please login first.');
    }
    
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

  async refreshToken(refreshToken: string): Promise<WebullAuthResponse> {
    this.isAuthenticated = true;
    return {
      accessToken: "mock_access_token_refreshed",
      refreshToken: "mock_refresh_token_refreshed",
      tokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
      uuid: "mock_uuid",
    };
  }
}

// Export the WebUll client factory
export const createWebullClient = (useMock: boolean = false, deviceId?: string): WebullClient => {
  return useMock ? new MockWebullClient() : new WebullApiClient(deviceId);
};

// For backward compatibility
export const webull = MockWebullClient;
