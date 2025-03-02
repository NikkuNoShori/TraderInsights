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
      this.webullClient = new webull({
        deviceId,
        deviceName: "TraderInsights Web",
      });

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
    credentials: WebullCredentials
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
      // In development, generate some mock trades
      if (process.env.NODE_ENV === "development") {
        console.log("Generating mock trades in development mode...");
        const mockTrades = await this.generateMockTrades(5);
        console.log(
          "Generated mock trades:",
          JSON.stringify(mockTrades, null, 2)
        );
        return mockTrades;
      }

      const orders = await this.webullClient.getOrders();
      return orders.map((order) => ({
        ...order,
        exchange: "UNKNOWN",
      }));
    } catch (error) {
      console.error("Failed to fetch trades from Webull:", error);
      throw new Error("Failed to fetch trades from Webull");
    }
  }

  private async generateMockTrades(count: number = 5): Promise<WebullTrade[]> {
    console.log(`Generating ${count} mock trade pairs...`);
    const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "META"];
    const exchanges = ["NASDAQ", "NYSE"];
    const trades: WebullTrade[] = [];

    // Generate pairs of trades (BUY and SELL) for each count
    for (let i = 0; i < count; i++) {
      console.log(`Generating trade pair ${i + 1}...`);
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const quantity = Math.floor(Math.random() * 100) + 1;
      const entryPrice = Math.random() * 1000 + 10;
      const exitPrice = entryPrice * (1 + (Math.random() * 0.2 - 0.1)); // +/- 10% from entry price
      const createTime = new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      );
      const updateTime = new Date(createTime.getTime() + 1000 * 60 * 60 * 24); // 24 hours later

      // Generate BUY order
      const buyOrder: WebullTrade = {
        orderId: `mock-${Date.now()}-${i}-buy`,
        symbol,
        action: "BUY" as const,
        orderType: "MARKET",
        timeInForce: "DAY",
        quantity,
        filledQuantity: quantity,
        price: entryPrice,
        filledPrice: entryPrice,
        status: "FILLED",
        createTime: createTime.toISOString(),
        updateTime: createTime.toISOString(), // Same as create time for entry
        commission: Math.random() * 5,
        exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
      };
      console.log(`Generated BUY order:`, buyOrder);
      trades.push(buyOrder);

      // Generate matching SELL order
      const sellOrder: WebullTrade = {
        orderId: `mock-${Date.now()}-${i}-sell`,
        symbol,
        action: "SELL" as const,
        orderType: "MARKET",
        timeInForce: "DAY",
        quantity,
        filledQuantity: quantity,
        price: exitPrice,
        filledPrice: exitPrice,
        status: "FILLED",
        createTime: updateTime.toISOString(), // Use update time as create time for exit
        updateTime: updateTime.toISOString(),
        commission: Math.random() * 5,
        exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
      };
      console.log(`Generated SELL order:`, sellOrder);
      trades.push(sellOrder);
    }

    console.log(`Generated ${trades.length} total trades`);
    return trades;
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

  public async addMockTrades(count: number): Promise<void> {
    const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "META"];
    const actions: Array<"BUY" | "SELL"> = ["BUY", "SELL"];
    const orderTypes: Array<"MARKET" | "LIMIT"> = ["MARKET", "LIMIT"];
    const timeInForce: Array<"GTC" | "DAY" | "IOC"> = ["GTC", "DAY", "IOC"];
    const exchanges = ["NASDAQ", "NYSE", "ARCA", "IEX"];

    for (let i = 0; i < count; i++) {
      const price = Math.random() * 1000 + 10;
      const quantity = Math.floor(Math.random() * 1000) + 1;
      const action = actions[Math.floor(Math.random() * actions.length)];
      const orderType =
        orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const createTime = new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      );

      const mockTrade: WebullTrade = {
        orderId: `mock-${Date.now()}-${i}`,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        action,
        orderType,
        timeInForce:
          timeInForce[Math.floor(Math.random() * timeInForce.length)],
        quantity,
        filledQuantity: action === "BUY" ? quantity : 0,
        price,
        filledPrice: action === "BUY" ? price : undefined,
        status: action === "BUY" ? "FILLED" : "PENDING",
        createTime: createTime.toISOString(),
        updateTime: new Date(
          createTime.getTime() + Math.random() * 60 * 60 * 1000
        ).toISOString(),
        commission: Math.random() * 10,
        exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
      };

      await this.saveTrade(mockTrade);
    }
  }
}

export const webullService = WebullService.getInstance();
