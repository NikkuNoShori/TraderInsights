import {
  webull,
  type WebullClient,
  type WebullOrder,
  type WebullCredentials,
  type WebullAuthResponse,
} from "@/lib/webull/client";

// Types for Webull data
export interface WebullTrade extends WebullOrder {
  exchange: string;
  orderId: string;
  symbol: string;
  action: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";
  timeInForce: "GTC" | "DAY" | "IOC";
  quantity: number;
  filledQuantity: number;
  price?: number;
  filledPrice?: number;
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED" | "PARTIAL_FILLED";
  createTime: string;
  updateTime: string;
  commission?: number;
  fees?: number;
}

// Local storage keys
const STORAGE_KEYS = {
  TRADES: "webull_trades",
  AUTH: "webull_auth",
  POSITIONS: "webull_positions",
  ORDERS: "webull_orders",
  LAST_SYNC: "webull_last_sync",
} as const;

class WebullService {
  private static instance: WebullService;
  private webullClient: WebullClient | null = null;
  private isInitialized = false;

  private constructor() {
    // Initialization will be done through init() method
  }

  public static getInstance(): WebullService {
    if (!WebullService.instance) {
      WebullService.instance = new WebullService();
    }
    return WebullService.instance;
  }

  // API Initialization and Authentication
  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const deviceId =
        localStorage.getItem("webull_device_id") || this.generateDeviceId();
      this.webullClient = new webull();

      // Store device ID for future use
      localStorage.setItem("webull_device_id", deviceId);
      console.log("Webull client initialized with device ID:", deviceId);

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Webull client:", error);
      throw new Error("Failed to initialize Webull client");
    }
  }

  public async login(
    credentials: WebullCredentials,
  ): Promise<WebullAuthResponse> {
    if (!this.webullClient) {
      await this.init();
    }

    try {
      console.log("Attempting to login to Webull...");
      const authResponse = await this.webullClient!.login(credentials);
      console.log("Successfully logged in to Webull");

      // Store auth data
      this.saveToStorage(STORAGE_KEYS.AUTH, {
        ...authResponse,
        timestamp: new Date().toISOString(),
      });

      return authResponse;
    } catch (error) {
      console.error("Failed to login to Webull:", error);
      throw new Error("Failed to login to Webull");
    }
  }

  public async logout(): Promise<void> {
    if (!this.webullClient) return;

    try {
      await this.webullClient.logout();
      this.clearAuthData();
    } catch (error) {
      console.error("Failed to logout from Webull:", error);
      throw new Error("Failed to logout from Webull");
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }

  private generateDeviceId(): string {
    return (
      "TI_" + Math.random().toString(36).substring(2) + Date.now().toString(36)
    );
  }

  // Local storage helpers
  private getFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // API Trade methods
  public async fetchTrades(): Promise<WebullTrade[]> {
    if (!this.webullClient) {
      throw new Error("Webull client not initialized");
    }

    try {
      console.log("Fetching trades from Webull...");
      const lastSync = this.getLastSyncTime();
      console.log("Last sync time:", lastSync);

      // In development, generate some mock trades
      if (process.env.NODE_ENV === "development") {
        console.log("Generating mock trades in development mode...");
        const mockTrades = await this.generateMockTrades(5);

        // Filter out trades that are older than the last sync
        const newTrades = lastSync
          ? mockTrades.filter(
              (trade) => new Date(trade.createTime) > new Date(lastSync),
            )
          : mockTrades;

        console.log(
          "Generated new trades since last sync:",
          JSON.stringify(newTrades, null, 2),
        );

        // Update last sync time
        this.updateLastSyncTime();

        return newTrades;
      }

      const orders = await this.webullClient.getOrders();
      const mappedOrders = orders.map((order) => ({
        ...order,
        exchange: "UNKNOWN",
      }));

      // Filter out trades that are older than the last sync
      const newOrders = lastSync
        ? mappedOrders.filter(
            (order) => new Date(order.createTime) > new Date(lastSync),
          )
        : mappedOrders;

      // Update last sync time
      this.updateLastSyncTime();

      return newOrders;
    } catch (error) {
      console.error("Failed to fetch trades from Webull:", error);
      throw new Error("Failed to fetch trades from Webull");
    }
  }

  private async generateMockTrades(count: number = 5): Promise<WebullTrade[]> {
    console.log(`Generating ${count} mock trade pairs...`);
    const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "META", "NVDA", "TSLA"];
    const exchanges = ["NASDAQ", "NYSE"];
    const trades: WebullTrade[] = [];

    // Generate pairs of trades (BUY and SELL) for each count
    for (let i = 0; i < count; i++) {
      console.log(`Generating trade pair ${i + 1}...`);
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const quantity = Math.floor(Math.random() * 100) + 1;

      // Set a reasonable entry price based on the stock
      let entryPrice = 0;
      switch (symbol) {
        case "AAPL":
          entryPrice = 150 + Math.random() * 30;
          break;
        case "GOOGL":
          entryPrice = 120 + Math.random() * 20;
          break;
        case "MSFT":
          entryPrice = 350 + Math.random() * 50;
          break;
        case "AMZN":
          entryPrice = 130 + Math.random() * 30;
          break;
        case "META":
          entryPrice = 400 + Math.random() * 50;
          break;
        case "NVDA":
          entryPrice = 800 + Math.random() * 100;
          break;
        case "TSLA":
          entryPrice = 180 + Math.random() * 40;
          break;
        default:
          entryPrice = 100 + Math.random() * 50;
      }

      // Always make it a winning trade with 95% probability
      const isWinner = Math.random() < 0.95;

      // Randomly decide if this is a Long or Short trade
      const isLongTrade = Math.random() > 0.2; // 80% chance of long trade

      // Calculate exit price based on trade direction - ensure it's profitable
      const exitPrice = isLongTrade
        ? isWinner
          ? entryPrice * (1 + Math.random() * 0.3 + 0.1) // Long winner: +10-40%
          : entryPrice * (1 - Math.random() * 0.02) // Long loser: -0-2%
        : isWinner
        ? entryPrice * (1 - Math.random() * 0.3 - 0.1) // Short winner: -10-40%
        : entryPrice * (1 + Math.random() * 0.02); // Short loser: +0-2%

      // Create dates for the trades - more recent trades for better visualization
      const daysAgo = Math.floor(Math.random() * 30); // Within the last 30 days
      const createTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const updateTime = new Date(createTime.getTime() + 1000 * 60 * 60 * 24); // 24 hours later

      if (isLongTrade) {
        // For Long trades: BUY first, then SELL
        const buyOrder: WebullTrade = {
          orderId: `mock-${Date.now()}-${i}-buy`,
          symbol,
          action: "BUY",
          orderType: "MARKET",
          timeInForce: "DAY",
          quantity,
          filledQuantity: quantity,
          price: entryPrice,
          filledPrice: entryPrice,
          status: "FILLED",
          createTime: createTime.toISOString(),
          updateTime: createTime.toISOString(),
          commission: Math.random() * 2, // Lower commission
          exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
        };
        trades.push(buyOrder);

        const sellOrder: WebullTrade = {
          orderId: `mock-${Date.now()}-${i}-sell`,
          symbol,
          action: "SELL",
          orderType: "MARKET",
          timeInForce: "DAY",
          quantity,
          filledQuantity: quantity,
          price: exitPrice,
          filledPrice: exitPrice,
          status: "FILLED",
          createTime: updateTime.toISOString(),
          updateTime: updateTime.toISOString(),
          commission: Math.random() * 2, // Lower commission
          exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
        };
        trades.push(sellOrder);
      } else {
        // For Short trades: SELL first, then BUY
        const sellOrder: WebullTrade = {
          orderId: `mock-${Date.now()}-${i}-sell`,
          symbol,
          action: "SELL",
          orderType: "MARKET",
          timeInForce: "DAY",
          quantity,
          filledQuantity: quantity,
          price: entryPrice,
          filledPrice: entryPrice,
          status: "FILLED",
          createTime: createTime.toISOString(),
          updateTime: createTime.toISOString(),
          commission: Math.random() * 2, // Lower commission
          exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
        };
        trades.push(sellOrder);

        const buyOrder: WebullTrade = {
          orderId: `mock-${Date.now()}-${i}-buy`,
          symbol,
          action: "BUY",
          orderType: "MARKET",
          timeInForce: "DAY",
          quantity,
          filledQuantity: quantity,
          price: exitPrice,
          filledPrice: exitPrice,
          status: "FILLED",
          createTime: updateTime.toISOString(),
          updateTime: updateTime.toISOString(),
          commission: Math.random() * 2, // Lower commission
          exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
        };
        trades.push(buyOrder);
      }
    }

    return trades;
  }

  // Sync state management
  private getLastSyncTime(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  }

  private updateLastSyncTime(): void {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }

  // Local storage trade methods
  public async saveTrade(trade: WebullTrade): Promise<void> {
    const trades = this.getFromStorage<WebullTrade>(STORAGE_KEYS.TRADES);
    trades.push(trade);
    this.saveToStorage(STORAGE_KEYS.TRADES, trades);
  }

  public async getTrades(): Promise<WebullTrade[]> {
    return this.getFromStorage<WebullTrade>(STORAGE_KEYS.TRADES);
  }

  public async getTradeById(orderId: string): Promise<WebullTrade | undefined> {
    const trades = await this.getTrades();
    return trades.find((trade) => trade.orderId === orderId);
  }

  public async getTradesBySymbol(symbol: string): Promise<WebullTrade[]> {
    const trades = await this.getTrades();
    return trades.filter((trade) => trade.symbol === symbol);
  }

  // Clear storage methods
  public clearTrades(): void {
    localStorage.removeItem(STORAGE_KEYS.TRADES);
  }

  public clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  // Mock methods for testing
  public async addMockTrade(mockTrade: Partial<WebullTrade>): Promise<void> {
    const defaultTrade: WebullTrade = {
      orderId: `mock-${Date.now()}`,
      symbol: "AAPL",
      action: "BUY",
      orderType: "MARKET",
      timeInForce: "DAY",
      quantity: 100,
      filledQuantity: 100,
      price: 150.0,
      filledPrice: 150.0,
      status: "FILLED",
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      commission: 0,
      exchange: "NASDAQ",
      ...mockTrade,
    };

    await this.saveTrade(defaultTrade);
  }

  public async addMockTrades(count: number = 10): Promise<void> {
    const mockTrades = await this.generateMockTrades(count);
    for (const trade of mockTrades) {
      await this.saveTrade(trade);
    }
    console.log(`Added ${mockTrades.length} mock trades`);
  }
}

export const webullService = WebullService.getInstance();
