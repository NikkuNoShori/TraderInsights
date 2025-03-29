import { useSnapTradeStore } from "@/stores/snapTradeStore";

const SNAPTRADE_API_URL = "https://api.snaptrade.com/api/v1";

interface SnapTradeError {
  message: string;
  code?: string;
  status?: number;
}

interface Broker {
  id: string;
  name: string;
  display_name: string;
  description: string;
  url: string;
  logo_url: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  number: string;
  institution_name: string;
  balance: number;
  currency: string;
}

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  average_price: number;
  current_price: number;
  market_value: number;
  currency: string;
}

interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  average_price: number;
  current_price: number;
  market_value: number;
  currency: string;
}

interface Activity {
  id: string;
  date: string;
  type: string;
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  currency: string;
}

interface Balance {
  id: string;
  type: string;
  amount: number;
  currency: string;
}

interface Order {
  id: string;
  symbol: string;
  type: string;
  side: string;
  quantity: number;
  price: number;
  status: string;
  created_at: string;
}

class SnapTradeAPI {
  private static instance: SnapTradeAPI;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = SNAPTRADE_API_URL;
  }

  public static getInstance(): SnapTradeAPI {
    if (!SnapTradeAPI.instance) {
      SnapTradeAPI.instance = new SnapTradeAPI();
    }
    return SnapTradeAPI.instance;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { userData } = useSnapTradeStore.getState();

    if (!userData?.snapTradeUserId || !userData?.snapTradeUserSecret) {
      throw new Error("SnapTrade credentials not found");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData.snapTradeUserSecret}`,
      "X-User-ID": userData.snapTradeUserId,
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: SnapTradeError = await response.json();
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  public async getBrokers(): Promise<Broker[]> {
    return this.request("/brokers");
  }

  public async getUserAccounts(): Promise<Account[]> {
    return this.request("/accounts");
  }

  public async getPositions(accountId: string): Promise<Position[]> {
    return this.request(`/accounts/${accountId}/positions`);
  }

  public async getHoldings(accountId: string): Promise<Holding[]> {
    return this.request(`/accounts/${accountId}/holdings`);
  }

  public async getActivities(accountId: string): Promise<Activity[]> {
    return this.request(`/accounts/${accountId}/activities`);
  }

  public async getBalances(accountId: string): Promise<Balance[]> {
    return this.request(`/accounts/${accountId}/balances`);
  }

  public async getOrders(accountId: string): Promise<Order[]> {
    return this.request(`/accounts/${accountId}/orders`);
  }

  public async exchangeCodeForTokens(
    code: string,
    state: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.request("/auth/token", {
      method: "POST",
      body: JSON.stringify({ code, state }),
    });
  }
}

export const snapTradeAPI = SnapTradeAPI.getInstance();
