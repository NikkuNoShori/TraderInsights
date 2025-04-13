/**
 * SnapTrade service
 * This service provides methods for interacting with the SnapTrade API
 */

import { StorageHelpers } from "@/lib/snaptrade/storage";
import { RateLimiter } from "@/lib/snaptrade/rateLimiter";
import { getSnapTradeConfig } from "@/lib/snaptrade/config";
import {
  SnapTradeConfig,
  SnapTradeUser,
  SnapTradeConnection,
  SnapTradeAccount,
  SnapTradePosition,
  SnapTradeBalance,
  SnapTradeOrder,
  ConnectionStatus,
} from "@/lib/snaptrade/types";

/**
 * Convert an ArrayBuffer to a hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate HMAC SHA-256 signature using Web Crypto API
 */
async function generateSignature(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  return bufferToHex(signature);
}

class RateLimitError extends Error {
  constructor(resetAt: number) {
    super("Rate limit exceeded");
    this.name = "RateLimitError";
    this.resetAt = resetAt;
  }
  resetAt: number;
}

/**
 * SnapTrade service singleton
 */
export class SnapTradeServiceSingleton {
  private static instance: SnapTradeServiceSingleton;
  private config: SnapTradeConfig | null = null;
  private initialized = false;
  private rateLimiter: RateLimiter;

  private constructor() {
    this.rateLimiter = RateLimiter.getInstance();
  }

  /**
   * Get the singleton instance
   * @returns SnapTradeServiceSingleton instance
   */
  public static getInstance(): SnapTradeServiceSingleton {
    if (!SnapTradeServiceSingleton.instance) {
      SnapTradeServiceSingleton.instance = new SnapTradeServiceSingleton();
    }
    return SnapTradeServiceSingleton.instance;
  }

  /**
   * Initialize the service with configuration
   * @param config SnapTrade configuration
   */
  public initialize(config: SnapTradeConfig): void {
    if (this.initialized) {
      return;
    }

    if (!config.clientId || !config.consumerKey) {
      throw new Error(
        "Missing required SnapTrade configuration: clientId and consumerKey are required"
      );
    }

    this.config = {
      clientId: config.clientId.trim(),
      consumerKey: config.consumerKey.trim(),
      redirectUri: config.redirectUri,
    };

    console.log("SnapTrade service initialized with config:", {
      hasClientId: !!this.config.clientId,
      hasConsumerKey: !!this.config.consumerKey,
      redirectUri: this.config.redirectUri,
    });

    this.initialized = true;
  }

  /**
   * Check if the service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("SnapTrade service not initialized. Call init() first.");
    }
  }

  /**
   * Check rate limit and throw error if exceeded
   */
  private checkRateLimit(userId: string): void {
    const { allowed, resetAt } = this.rateLimiter.checkRateLimit(userId);
    if (!allowed) {
      throw new RateLimitError(resetAt);
    }
  }

  /**
   * Get the current configuration
   */
  public getConfig(): SnapTradeConfig {
    this.ensureInitialized();
    if (!this.config) {
      throw new Error("SnapTrade service not configured");
    }
    return this.config;
  }

  /**
   * Get user from storage
   */
  public getUser(): SnapTradeUser | null {
    return StorageHelpers.getUser();
  }

  /**
   * Register a new user with SnapTrade
   */
  public async registerUser(
    userId: string
  ): Promise<{ userId: string; userSecret: string }> {
    this.ensureInitialized();

    try {
      console.log("Registering user with SnapTrade:", { userId });

      if (!userId) {
        console.error("Missing userId");
        throw new Error("userId is required");
      }

      const response = await this.makeRequest("/snapTrade/registerUser", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      console.log("SnapTrade registration response:", data);

      if (!data?.userSecret) {
        throw new Error("No userSecret returned from SnapTrade");
      }

      // Save user credentials
      const user: SnapTradeUser = {
        userId: userId,
        userSecret: data.userSecret,
      };

      StorageHelpers.saveUser(user);
      console.log("User registered successfully:", { userId });

      return user;
    } catch (error) {
      console.error("Failed to register user with SnapTrade:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }
  }

  /**
   * Check if a user is registered
   */
  public isUserRegistered(): boolean {
    const user = StorageHelpers.getUser();
    return !!user;
  }

  /**
   * Delete a user from SnapTrade
   */
  public async deleteUser(userId: string): Promise<void> {
    this.ensureInitialized();

    try {
      console.log("Deleting user from SnapTrade:", { userId });
      const user = this.getUser();

      if (!user) {
        console.error("No user registered");
        throw new Error("No user registered");
      }

      if (!userId) {
        console.error("Missing userId");
        throw new Error("userId is required");
      }

      const response = await fetch("/api/snaptrade/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("SnapTrade API error:", errorData);
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      // If the deleted user is the current user, clear credentials
      if (user.userId === userId) {
        StorageHelpers.clearAll();
      }

      console.log("User deleted successfully:", { userId });
    } catch (error) {
      console.error("Failed to delete user with SnapTrade:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      throw error; // Re-throw to let caller handle it
    }
  }

  /**
   * Get a list of supported brokerages
   */
  public async getBrokerages(): Promise<any[]> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      if (!user) {
        throw new Error("No user registered");
      }

      this.checkRateLimit(user.userId);

      const response = await this.makeRequest("/api/snaptrade/brokerages");
      const data = await response.json();
      this.rateLimiter.incrementRequestCount(user.userId);

      return data || [];
    } catch (error) {
      console.error("Failed to get brokerages:", error);
      throw error;
    }
  }

  /**
   * Create a connection link for a user to connect their brokerage account
   */
  public async createConnectionLink(
    userId: string,
    userSecret: string
  ): Promise<string> {
    this.ensureInitialized();

    try {
      const response = await this.makeRequest(
        "/api/snaptrade/connection-link",
        {
          method: "POST",
          body: JSON.stringify({ userId, userSecret }),
        }
      );

      const data = await response.json();
      return data.redirectUri || data.url;
    } catch (error) {
      console.error("Failed to create connection link:", error);
      throw error;
    }
  }

  /**
   * Get a list of user connections
   */
  public async getUserConnections(): Promise<SnapTradeConnection[]> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      if (!user?.userId) {
        throw new Error("No user registered");
      }

      const response = await this.makeRequest("/api/snaptrade/connections");
      const data = await response.json();
      const connections: SnapTradeConnection[] = data.map((auth: any) => ({
        id: auth.id,
        brokerageId: auth.brokerageId,
        brokerageName: auth.brokerageName,
        status: auth.status as ConnectionStatus,
        createdAt: auth.createdAt,
        updatedAt: auth.updatedAt,
      }));

      StorageHelpers.saveConnections(connections);
      return connections;
    } catch (error) {
      console.error("[SnapTradeService] Failed to get user connections:", {
        error,
        userId: this.getUser()?.userId,
      });
      throw new Error(
        `Failed to get user connections: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Delete a connection
   */
  public async deleteConnection(connectionId: string): Promise<void> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      if (!user?.userId) {
        throw new Error("No user registered");
      }

      if (!connectionId) {
        throw new Error("Connection ID is required");
      }

      await this.makeRequest("/api/snaptrade/connection", {
        method: "DELETE",
        body: JSON.stringify({ userId: user.userId, connectionId }),
      });
    } catch (error) {
      console.error("[SnapTradeService] Failed to delete connection:", {
        error,
        connectionId,
        userId: this.getUser()?.userId,
      });
      throw new Error(
        `Failed to delete connection: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get a list of user accounts
   */
  public async getUserAccounts(): Promise<SnapTradeAccount[]> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      if (!user?.userId) {
        throw new Error("No user registered");
      }

      const response = await this.makeRequest("/api/snaptrade/accounts");
      const data = await response.json();
      StorageHelpers.saveAccounts(data);
      return data;
    } catch (error) {
      console.error("[SnapTradeService] Failed to get user accounts:", {
        error,
        userId: this.getUser()?.userId,
      });
      throw new Error(
        `Failed to get user accounts: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get account holdings
   */
  public async getAccountHoldings(
    accountId: string
  ): Promise<SnapTradePosition[]> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      if (!user?.userId) {
        throw new Error("No user registered");
      }

      if (!accountId) {
        throw new Error("Account ID is required");
      }

      this.checkRateLimit(user.userId);
      const response = await this.makeRequest("/api/snaptrade/holdings", {
        method: "POST",
        body: JSON.stringify({ userId: user.userId, accountId }),
      });

      const data = await response.json();
      this.rateLimiter.incrementRequestCount(user.userId);
      return data || [];
    } catch (error) {
      console.error("[SnapTradeService] Failed to get account holdings:", {
        error,
        accountId,
        userId: this.getUser()?.userId,
      });
      throw new Error(
        `Failed to get account holdings: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get account balances
   */
  public async getAccountBalances(
    accountId: string
  ): Promise<SnapTradeBalance[]> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      if (!user?.userId) {
        throw new Error("No user registered");
      }

      if (!accountId) {
        throw new Error("Account ID is required");
      }

      const response = await this.makeRequest("/api/snaptrade/balances", {
        method: "POST",
        body: JSON.stringify({ userId: user.userId, accountId }),
      });

      const data = await response.json();
      this.saveBalances(data);
      return data;
    } catch (error) {
      console.error("[SnapTradeService] Failed to get account balances:", {
        error,
        accountId,
        userId: this.getUser()?.userId,
      });
      throw new Error(
        `Failed to get account balances: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get account orders
   */
  public async getAccountOrders(accountId: string): Promise<SnapTradeOrder[]> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      if (!user?.userId) {
        throw new Error("No user registered");
      }

      if (!accountId) {
        throw new Error("Account ID is required");
      }

      this.checkRateLimit(user.userId);
      const response = await this.makeRequest("/api/snaptrade/orders", {
        method: "POST",
        body: JSON.stringify({ userId: user.userId, accountId }),
      });

      const data = await response.json();
      this.rateLimiter.incrementRequestCount(user.userId);
      return data || [];
    } catch (error) {
      console.error("[SnapTradeService] Failed to get account orders:", {
        error,
        accountId,
        userId: this.getUser()?.userId,
      });
      throw new Error(
        `Failed to get account orders: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Sync all user data (connections and accounts)
   */
  public async syncAllData(): Promise<{
    connections: SnapTradeConnection[];
    accounts: SnapTradeAccount[];
  }> {
    this.ensureInitialized();

    try {
      const connections = await this.getUserConnections();
      const accounts = await this.getUserAccounts();

      return { connections, accounts };
    } catch (error) {
      console.error("Failed to sync all data:", error);
      throw new Error(
        `Failed to sync all data: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Save account balances
   * @param balances Account balances
   */
  private saveBalances(balances: SnapTradeBalance[]): void {
    StorageHelpers.setItem("balances", JSON.stringify(balances));
  }

  /**
   * Clear all data
   */
  private clearAllData(): void {
    StorageHelpers.clearAll();
  }

  /**
   * Get rate limit info
   */
  public getRateLimitInfo(): {
    remaining: number;
    timeUntilReset: number;
  } | null {
    const user = this.getUser();
    if (!user) return null;

    const { remaining, resetAt } = this.rateLimiter.checkRateLimit(user.userId);
    return {
      remaining,
      timeUntilReset: Math.max(0, resetAt - Date.now()),
    };
  }

  /**
   * Make a request to the SnapTrade API
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const config = this.getConfig();

    // Ensure consumer key is trimmed
    const consumerKey = config.consumerKey.trim();

    // Generate timestamp and signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await generateSignature(
      consumerKey,
      `${config.clientId}${timestamp}`
    );

    // Construct the full SnapTrade API URL
    const url = new URL(`/snapTrade${endpoint}`, window.location.origin);

    // Add query parameters
    url.searchParams.append("clientId", config.clientId);
    url.searchParams.append("timestamp", timestamp);

    console.log("Making request to SnapTrade API:", {
      url: url.toString(),
      method: options.method || "GET",
      signature: signature.substring(0, 10) + "...", // Log only part of the signature for security
      timestamp,
    });

    try {
      const response = await fetch(url.toString(), {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Signature: signature,
          Timestamp: timestamp,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("SnapTrade API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      return response;
    } catch (error) {
      console.error("Failed to make request to SnapTrade API:", {
        error,
        url: url.toString(),
        method: options.method || "GET",
      });
      throw error;
    }
  }

  /**
   * Check the SnapTrade API status
   * @returns Promise<{ version: number; timestamp: string; online: boolean }>
   */
  public async checkApiStatus(): Promise<{
    version: number;
    timestamp: string;
    online: boolean;
  }> {
    this.ensureInitialized();
    const response = await this.makeRequest("/");
    return response.json();
  }
}

// Initialize the singleton instance with environment variables
const snapTradeService = SnapTradeServiceSingleton.getInstance();

// Initialize with environment variables
const config = {
  clientId: import.meta.env.VITE_SNAPTRADE_CLIENT_ID || "",
  consumerKey: import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY || "",
  redirectUri:
    import.meta.env.VITE_SNAPTRADE_REDIRECT_URI ||
    `${window.location.origin}/broker-callback`,
};

console.log("Initializing SnapTrade service with config:", {
  hasClientId: !!config.clientId,
  hasConsumerKey: !!config.consumerKey,
  redirectUri: config.redirectUri,
});

snapTradeService.initialize(config);

export { snapTradeService }; 
