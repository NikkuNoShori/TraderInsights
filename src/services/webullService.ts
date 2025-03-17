import {
  createWebullClient,
  type WebullClient,
  type WebullOrder,
  type WebullCredentials,
  type WebullAuthResponse,
} from "@/lib/webull/client";
import { StorageHelpers, STORAGE_KEYS } from "@/lib/webull/storage";

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
  public async init(useMock: boolean = process.env.NODE_ENV === "development"): Promise<void> {
    if (this.isInitialized) return;

    try {
      const deviceId =
        StorageHelpers.getDeviceId() || this.generateDeviceId();
      this.webullClient = createWebullClient(useMock, deviceId);

      // Store device ID for future use
      StorageHelpers.saveDeviceId(deviceId);
      console.log("Webull client initialized with device ID:", deviceId);

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Webull client:", error);
      throw new Error("Failed to initialize Webull client");
    }
  }

  /**
   * Test the WebUll API connection by attempting to login with the provided credentials.
   * @param credentials WebUll credentials
   * @returns True if the connection is successful, false otherwise
   */
  public async testConnection(credentials: WebullCredentials): Promise<boolean> {
    try {
      // Initialize the client with production mode (no mocks)
      await this.init(false);
      
      // Attempt to login
      await this.login(credentials);
      
      // If login succeeds, logout and return true
      await this.logout();
      return true;
    } catch (error) {
      console.error("WebUll connection test failed:", error);
      return false;
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
      StorageHelpers.saveAuth({
        ...authResponse,
        timestamp: new Date().toISOString(),
      });

      return authResponse;
    } catch (error) {
      console.error("Failed to login to Webull:", error);
      throw new Error("Failed to login to Webull");
    }
  }

  /**
   * Check if the user is authenticated with WebUll.
   * @returns True if authenticated, false otherwise
   */
  public isAuthenticated(): boolean {
    const authData = StorageHelpers.getAuth();
    if (!authData) return false;
    
    try {
      const tokenExpiry = new Date(authData.tokenExpiry).getTime();
      const now = Date.now();
      
      // Check if token is expired
      if (tokenExpiry < now) {
        console.log("WebUll authentication token expired");
        this.clearAuthData();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking WebUll authentication:", error);
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Refresh the authentication token if needed.
   * @returns True if token was refreshed successfully, false otherwise
   */
  public async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.webullClient) {
      await this.init();
    }

    const authData = StorageHelpers.getAuth();
    if (!authData) return false;
    
    try {
      const tokenExpiry = new Date(authData.tokenExpiry).getTime();
      const now = Date.now();
      
      // Check if token is about to expire (within 1 hour)
      if (tokenExpiry - now < 60 * 60 * 1000) {
        console.log("WebUll authentication token is about to expire, refreshing...");
        
        // Refresh the token
        const refreshResponse = await this.webullClient!.refreshToken(authData.refreshToken);
        
        // Store auth data
        StorageHelpers.saveAuth({
          ...refreshResponse,
          timestamp: new Date().toISOString(),
        });
        
        console.log("WebUll authentication token refreshed successfully");
        return true;
      }
      
      return true; // Token is still valid
    } catch (error) {
      console.error("Error refreshing WebUll authentication token:", error);
      return false;
    }
  }

  /**
   * Ensure the user is authenticated before making API calls.
   * This method will initialize the client and refresh the token if needed.
   * @throws Error if not authenticated
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.webullClient) {
      await this.init();
    }
    
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated with WebUll. Please login first.");
    }
    
    // Refresh token if needed
    const refreshed = await this.refreshTokenIfNeeded();
    if (!refreshed) {
      throw new Error("Failed to refresh WebUll authentication token.");
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
    StorageHelpers.clearAuth();
  }

  private generateDeviceId(): string {
    return (
      "TI_" + Math.random().toString(36).substring(2) + Date.now().toString(36)
    );
  }

  // API Trade methods
  public async fetchTrades(): Promise<WebullTrade[]> {
    if (!this.webullClient) {
      throw new Error("Webull client not initialized");
    }

    try {
      // Ensure authenticated before making API calls
      await this.ensureAuthenticated();
      
      console.log("Fetching trades from WebUll...");
      const lastSync = StorageHelpers.getLastSyncTime();
      console.log("Last sync time:", lastSync);

      // Get orders from WebUll API
      const orders = await this.webullClient.getOrders({
        startTime: lastSync || undefined,
      });
      
      // Map orders to WebullTrade format
      const mappedOrders = orders.map((order) => ({
        ...order,
        exchange: "UNKNOWN", // WebUll API doesn't provide exchange info
      }));

      console.log(`Fetched ${mappedOrders.length} trades from WebUll`);

      // Update last sync time
      StorageHelpers.updateLastSyncTime();

      return mappedOrders;
    } catch (error) {
      console.error("Failed to fetch trades from WebUll:", error);
      throw new Error(`Failed to fetch trades from WebUll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Fetch account information from WebUll.
   * @returns Account information
   */
  public async fetchAccount(): Promise<WebullAccount> {
    if (!this.webullClient) {
      throw new Error("Webull client not initialized");
    }

    try {
      // Ensure authenticated before making API calls
      await this.ensureAuthenticated();
      
      console.log("Fetching account information from WebUll...");
      const account = await this.webullClient.getAccount();
      console.log("Account information fetched successfully");
      return account;
    } catch (error) {
      console.error("Failed to fetch account information from WebUll:", error);
      throw new Error(`Failed to fetch account information from WebUll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Fetch positions from WebUll.
   * @returns List of positions
   */
  public async fetchPositions(): Promise<WebullPosition[]> {
    if (!this.webullClient) {
      throw new Error("Webull client not initialized");
    }

    try {
      // Ensure authenticated before making API calls
      await this.ensureAuthenticated();
      
      console.log("Fetching positions from WebUll...");
      const positions = await this.webullClient.getPositions();
      console.log(`Fetched ${positions.length} positions from WebUll`);
      return positions;
    } catch (error) {
      console.error("Failed to fetch positions from WebUll:", error);
      throw new Error(`Failed to fetch positions from WebUll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Sync all data from WebUll.
   * This method fetches trades, positions, and account information.
   * @returns Object containing the fetched data
   */
  public async syncAllData(): Promise<{
    trades: WebullTrade[];
    positions: WebullPosition[];
    account: WebullAccount;
  }> {
    if (!this.webullClient) {
      throw new Error("Webull client not initialized");
    }

    try {
      // Ensure authenticated before making API calls
      await this.ensureAuthenticated();
      
      console.log("Syncing all data from WebUll...");
      
      // Fetch all data in parallel
      const [trades, positions, account] = await Promise.all([
        this.fetchTrades(),
        this.fetchPositions(),
        this.fetchAccount(),
      ]);
      
      // Save data to storage
      for (const trade of trades) {
        StorageHelpers.saveTrade(trade);
      }
      StorageHelpers.savePositions(positions);
      StorageHelpers.saveAccount(account);
      
      console.log("All data synced successfully from WebUll");
      
      return {
        trades,
        positions,
        account,
      };
    } catch (error) {
      console.error("Failed to sync all data from WebUll:", error);
      throw new Error(`Failed to sync all data from WebUll: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generates mock trades for testing purposes.
   * This is only used in development or testing environments.
   */
  private async generateMockTrades(count: number = 5): Promise<WebullTrade[]> {
    console.log(`Generating ${count} mock trade pairs...`);
    const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "META"];
    const exchanges = ["NASDAQ", "NYSE"];
    const trades: WebullTrade[] = [];

    // Get existing trades to calculate current win rate
    const existingTrades = await this.getTrades();
    const existingWinRate =
      existingTrades.length > 0
        ? existingTrades.filter((trade) => {
            const buyOrder = existingTrades.find(
              (t) =>
                t.symbol === trade.symbol &&
                t.action === "BUY" &&
                t.orderId.split("-")[2] === trade.orderId.split("-")[2],
            );
            const sellOrder = existingTrades.find(
              (t) =>
                t.symbol === trade.symbol &&
                t.action === "SELL" &&
                t.orderId.split("-")[2] === trade.orderId.split("-")[2],
            );

            if (!buyOrder || !sellOrder || trade.action !== "SELL")
              return false;

            // For Long trades: sell price should be higher than buy price
            // For Short trades: sell price should be lower than buy price
            const isLongTrade = buyOrder.createTime < sellOrder.createTime;
            const buyPrice = buyOrder.filledPrice || buyOrder.price || 0;
            const sellPrice = sellOrder.filledPrice || sellOrder.price || 0;

            return isLongTrade
              ? sellPrice > buyPrice // Long trade is profitable if sell > buy
              : sellPrice < buyPrice; // Short trade is profitable if sell < buy
          }).length /
          (existingTrades.length / 2)
        : 0.5; // Default to 50% if no existing trades

    console.log(`Current win rate: ${existingWinRate * 100}%`);

    // Generate pairs of trades (BUY and SELL) for each count
    for (let i = 0; i < count; i++) {
      console.log(`Generating trade pair ${i + 1}...`);
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const quantity = Math.floor(Math.random() * 100) + 1;
      const entryPrice = Math.random() * 1000 + 10;

      // Determine if this should be a winning trade based on current win rate
      const targetWinRate = 0.6; // We want to maintain around 60% win rate
      const winProbability = existingWinRate < targetWinRate ? 0.7 : 0.5;
      const isWinner = Math.random() < winProbability;

      // Randomly decide if this is a Long or Short trade
      const isLongTrade = Math.random() > 0.3; // 70% chance of long trade

      // Calculate exit price based on trade direction and win/loss status
      const exitPrice = isLongTrade
        ? isWinner
          ? entryPrice * (1 + Math.random() * 0.2) // Long winner: +0-20%
          : entryPrice * (1 - Math.random() * 0.05) // Long loser: -0-5%
        : isWinner
          ? entryPrice * (1 - Math.random() * 0.2) // Short winner: -0-20%
          : entryPrice * (1 + Math.random() * 0.05); // Short loser: +0-5%

      const createTime = new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      );
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
          commission: Math.random() * 5,
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
          commission: Math.random() * 5,
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
          commission: Math.random() * 5,
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
          commission: Math.random() * 5,
          exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
        };
        trades.push(buyOrder);
      }
    }

    console.log(`Generated ${trades.length} total trades`);
    return trades;
  }

  // Sync state management
  private getLastSyncTime(): string | null {
    return StorageHelpers.getLastSyncTime();
  }

  private updateLastSyncTime(): void {
    StorageHelpers.updateLastSyncTime();
  }

  // Storage trade methods
  public async saveTrade(trade: WebullTrade): Promise<void> {
    StorageHelpers.saveTrade(trade);
  }

  public async getTrades(): Promise<WebullTrade[]> {
    return StorageHelpers.getTrades();
  }

  /**
   * Save account information to storage.
   * @param account Account information
   */
  public saveAccount(account: WebullAccount): void {
    StorageHelpers.saveAccount({
      ...account,
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Get account information from storage.
   * @returns Account information or null if not found
   */
  public getAccount(): WebullAccount | null {
    return StorageHelpers.getAccount();
  }

  /**
   * Save positions to storage.
   * @param positions List of positions
   */
  public savePositions(positions: WebullPosition[]): void {
    StorageHelpers.savePositions(positions);
  }

  /**
   * Get positions from storage.
   * @returns List of positions
   */
  public getPositions(): WebullPosition[] {
    return StorageHelpers.getPositions();
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
    StorageHelpers.clearTrades();
  }

  public clearAllData(): void {
    StorageHelpers.clearAllData();
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

  /**
   * Generate and fetch mock trades for testing.
   * This method should only be used in development or testing environments.
   * @param count Number of trade pairs to generate
   * @returns Generated mock trades
   */
  public async generateAndFetchMockTrades(count: number = 5): Promise<WebullTrade[]> {
    console.log(`Generating and fetching ${count} mock trade pairs...`);
    const mockTrades = await this.generateMockTrades(count);
    
    // Save the mock trades to storage
    for (const trade of mockTrades) {
      await this.saveTrade(trade);
    }
    
    // Update last sync time
    this.updateLastSyncTime();
    
    return mockTrades;
  }

  /**
   * Generate mock data for testing.
   * This method generates mock trades, positions, and account information.
   * @param tradeCount Number of trade pairs to generate
   * @returns Object containing the generated mock data
   */
  public async generateMockData(tradeCount: number = 5): Promise<{
    trades: WebullTrade[];
    positions: WebullPosition[];
    account: WebullAccount;
  }> {
    console.log("Generating mock data for testing...");
    
    // Generate mock trades
    const mockTrades = await this.generateMockTrades(tradeCount);
    
    // Generate mock positions based on the trades
    const symbols = [...new Set(mockTrades.map(trade => trade.symbol))];
    const mockPositions: WebullPosition[] = symbols.map(symbol => {
      const trades = mockTrades.filter(trade => trade.symbol === symbol);
      const buyTrades = trades.filter(trade => trade.action === "BUY");
      const sellTrades = trades.filter(trade => trade.action === "SELL");
      
      const totalBuyQuantity = buyTrades.reduce((sum, trade) => sum + trade.quantity, 0);
      const totalSellQuantity = sellTrades.reduce((sum, trade) => sum + trade.quantity, 0);
      const quantity = totalBuyQuantity - totalSellQuantity;
      
      // Only include positions with positive quantity
      if (quantity <= 0) return null;
      
      const totalCost = buyTrades.reduce((sum, trade) => sum + (trade.filledPrice || trade.price || 0) * trade.quantity, 0);
      const avgCost = totalCost / totalBuyQuantity;
      const lastPrice = (buyTrades[buyTrades.length - 1]?.filledPrice || buyTrades[buyTrades.length - 1]?.price || 0) * 1.05;
      const marketValue = quantity * lastPrice;
      const unrealizedPnl = marketValue - (avgCost * quantity);
      const unrealizedPnlRate = unrealizedPnl / (avgCost * quantity);
      
      return {
        symbol,
        quantity,
        avgCost,
        marketValue,
        lastPrice,
        unrealizedPnl,
        unrealizedPnlRate,
        lastUpdated: new Date().toISOString(),
      };
    }).filter(Boolean) as WebullPosition[];
    
    // Generate mock account
    const totalPositionValue = mockPositions.reduce((sum, position) => sum + position.marketValue, 0);
    const mockAccount: WebullAccount = {
      accountId: "mock_account",
      accountType: "MARGIN",
      currency: "USD",
      dayTrader: false,
      netLiquidation: totalPositionValue + 50000,
      totalCash: 50000,
      buyingPower: (totalPositionValue + 50000) * 2,
      totalPositionValue,
    };
    
    // Save mock data to storage
    for (const trade of mockTrades) {
      await this.saveTrade(trade);
    }
    this.savePositions(mockPositions);
    this.saveAccount(mockAccount);
    
    // Update last sync time
    this.updateLastSyncTime();
    
    console.log("Mock data generated successfully");
    
    return {
      trades: mockTrades,
      positions: mockPositions,
      account: mockAccount,
    };
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
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
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
          createTime.getTime() + Math.random() * 60 * 60 * 1000,
        ).toISOString(),
        commission: Math.random() * 10,
        exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
      };

      await this.saveTrade(mockTrade);
    }
  }
}

export const webullService = WebullService.getInstance();
