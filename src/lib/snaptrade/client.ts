/**
 * SnapTrade API client implementation
 * This file provides a client for interacting with the SnapTrade API
 */

import { Snaptrade } from "snaptrade-typescript-sdk";
import crypto from "crypto";
import {
  SnapTradeConfig,
  SnapTradeUser,
  ConnectionLinkResponse,
  ConnectionOptions,
  BrokerageList,
  BrokerageAuthorizationList,
  SnapTradeError,
  SnapTradeConnection,
  Account,
  Position,
  Balance,
  Order,
} from "./types";
import { createDebugLogger } from "@/stores/debugStore";
import { getSnapTradeConfig } from "./config";

const logger = createDebugLogger("snaptrade" as any); // TODO: Add 'snaptrade' to DebugCategory type

/**
 * Generate authentication credentials for SnapTrade
 * @param config SnapTrade configuration
 * @returns Authentication object with clientId, timestamp, and signature
 */
export async function generateSnapTradeAuth(config: SnapTradeConfig) {
  try {
    if (!config.clientId || !config.consumerKey) {
      throw new Error("Missing required SnapTrade configuration");
    }

    // Generate timestamp for signature
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Create signature
    let signature;

    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.subtle
    ) {
      // Browser environment: Use Web Crypto API
      const encoder = new TextEncoder();
      const key = encoder.encode(config.consumerKey);
      const message = encoder.encode(`${config.clientId}${timestamp}`);

      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signatureBuffer = await window.crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        message
      );

      signature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } else {
      // Node.js environment: Use crypto
      signature = crypto
        .createHmac("sha256", config.consumerKey)
        .update(`${config.clientId}${timestamp}`)
        .digest("hex");
    }

    return {
      clientId: config.clientId,
      timestamp,
      signature,
    };
  } catch (error) {
    console.error("Error generating SnapTrade authentication:", error);
    throw new Error(
      `Failed to generate SnapTrade auth: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Create a SnapTrade client instance with proper authentication
 * @param config SnapTrade configuration
 * @returns SnapTrade client instance
 */
export async function createSnapTradeClient(
  config: SnapTradeConfig
): Promise<Snaptrade> {
  try {
    // Generate authentication parameters
    const auth = await generateSnapTradeAuth(config);

    // Log authentication parameters (without sensitive info)
    console.log("Creating SnapTrade client:", {
      clientId: auth.clientId,
      timestamp: auth.timestamp,
      signatureLength: auth.signature.length,
    });

    // Create and return client instance
    return new Snaptrade({
      clientId: auth.clientId,
      consumerKey: config.consumerKey,
      timestamp: auth.timestamp,
      signature: auth.signature,
    });
  } catch (error) {
    console.error("Error creating SnapTrade client:", error);
    throw new Error(
      `Failed to create SnapTrade client: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * SnapTrade service class
 * Provides methods for interacting with the SnapTrade API
 */
export class SnapTradeClient {
  private client: Snaptrade | null = null;
  private userId: string | null = null;
  private userSecret: string | null = null;
  private config: SnapTradeConfig;

  constructor(config: SnapTradeConfig) {
    console.log("Initializing SnapTradeClient with config:", {
      hasClientId: !!config.clientId,
      hasConsumerKey: !!config.consumerKey,
      redirectUri: config.redirectUri,
    });

    if (!config.clientId || !config.consumerKey) {
      console.error("Missing required SnapTrade configuration:", {
        hasClientId: !!config.clientId,
        hasConsumerKey: !!config.consumerKey,
      });
      throw new Error("Missing required SnapTrade configuration");
    }

    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      const auth = await generateSnapTradeAuth(this.config);
      this.client = new Snaptrade({
        clientId: auth.clientId,
        consumerKey: this.config.consumerKey,
        timestamp: auth.timestamp,
        signature: auth.signature,
      });
    } catch (error) {
      console.error("Error initializing SnapTrade client:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Gets the SnapTrade client, initializing it if necessary
   */
  private async getClient(): Promise<Snaptrade> {
    if (!this.client) {
      await this.initialize();
      if (!this.client) {
        throw new Error("Failed to initialize SnapTrade client");
      }
    }
    return this.client;
  }

  /**
   * Sets the current user
   */
  setUser(user: SnapTradeUser) {
    this.userId = user.userId;
    this.userSecret = user.userSecret;
  }

  /**
   * Registers a new user with SnapTrade
   * @param userId Unique identifier for the user
   * @returns User secret
   */
  async registerUser(userId: string): Promise<string> {
    try {
      logger.debug("Registering user:", { userId });

      const client = await this.getClient();
      const response = await client.authentication.registerSnapTradeUser({
        userId,
      });

      if (!response.data.userSecret) {
        throw new Error("No userSecret in response");
      }

      this.userId = userId;
      this.userSecret = response.data.userSecret;

      logger.debug("User registered successfully");
      return response.data.userSecret;
    } catch (error) {
      logger.error("Error registering user:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Deletes a user from SnapTrade
   * @param userId Unique identifier for the user
   * @returns True if successful
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      await client.authentication.deleteSnapTradeUser({
        userId,
      });

      if (this.userId === userId) {
        this.userId = null;
        this.userSecret = null;
      }

      return true;
    } catch (error) {
      console.error("Error deleting user from SnapTrade:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Gets a list of supported brokerages
   * @returns List of brokerages
   */
  async getBrokerages(): Promise<BrokerageList> {
    try {
      logger.debug("Fetching brokerages");
      const client = await this.getClient();
      const response = await client.referenceData.listAllBrokerages();
      return response.data;
    } catch (error) {
      logger.error("Error fetching brokerages:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Creates a connection link for a broker
   * @param userId User ID
   * @param userSecret User secret
   * @returns Response data containing the login URL that can be used to open the connection portal
   */
  async createConnectionLink(
    userId: string,
    userSecret: string,
    broker: string,
    options: ConnectionOptions = {}
  ): Promise<ConnectionLinkResponse> {
    try {
      logger.debug("Creating connection link:", {
        userId,
        broker,
        ...options,
      });

      const client = await this.getClient();
      const response = await client.authentication.loginSnapTradeUser({
        userId,
        userSecret,
        broker,
        immediateRedirect: true,
        connectionType: options.connectionType || "read",
        connectionPortalVersion: options.connectionPortalVersion || "v4",
        reconnect: options.reconnect,
      });

      const data = response.data as ConnectionLinkResponse;
      if (!data.redirectURI) {
        throw new Error("No redirectURI in response");
      }

      return data;
    } catch (error) {
      logger.error("Error creating connection link:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Gets a list of user's broker connections
   * @returns List of connections
   */
  async getConnections(): Promise<SnapTradeConnection[]> {
    try {
      if (!this.userId || !this.userSecret) {
        throw new Error("User not authenticated");
      }

      const client = await this.getClient();
      const response = await client.connections.listBrokerageAuthorizations({
        userId: this.userId,
        userSecret: this.userSecret,
      });

      return response.data || [];
    } catch (error) {
      console.error("Error getting user connections:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Deletes a broker connection
   * @param authorizationId The authorization ID of the connection to delete
   */
  async deleteConnection(authorizationId: string): Promise<void> {
    try {
      if (!this.userId || !this.userSecret) {
        throw new Error("User not authenticated");
      }

      const client = await this.getClient();
      await client.connections.removeBrokerageAuthorization({
        authorizationId,
        userId: this.userId,
        userSecret: this.userSecret,
      });
    } catch (error) {
      console.error("Error deleting connection:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Gets account holdings for a connection
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @param accountId Account identifier
   * @returns Account holdings
   */
  async getAccountHoldings(
    userId: string,
    userSecret: string,
    accountId: string
  ) {
    try {
      const client = await this.getClient();
      const response = await client.accountInformation.getUserHoldings({
        userId,
        userSecret,
        accountId,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting account holdings:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Gets account balances
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @param accountId Account identifier
   * @returns Account balances
   */
  async getAccountBalances(params: {
    userId: string;
    userSecret: string;
    accountId: string;
  }): Promise<Balance[]> {
    try {
      const client = await this.getClient();
      const response = await client.accountInformation.getUserAccountBalance({
        userId: params.userId,
        userSecret: params.userSecret,
        accountId: params.accountId,
      });
      return response.data.map((balance: any) => ({
        id: balance.id,
        amount: balance.amount || 0,
        currency:
          typeof balance.currency === "string"
            ? balance.currency
            : balance.currency?.code || "",
        accountId: balance.account_id,
        createdAt: balance.created_at || new Date().toISOString(),
        updatedAt: balance.updated_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error getting account balances:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Gets account orders
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @param accountId Account identifier
   * @returns Account orders
   */
  async getAccountOrders(params: {
    userId: string;
    userSecret: string;
    accountId: string;
  }): Promise<Order[]> {
    try {
      const client = await this.getClient();
      const response = await client.accountInformation.getUserAccountOrders({
        userId: params.userId,
        userSecret: params.userSecret,
        accountId: params.accountId,
      });
      return response.data.map((order: any) => ({
        id: order.id,
        quantity: order.quantity || 0,
        price: order.price || 0,
        type: order.type || "",
        status: order.status || "",
        symbol: order.symbol || "",
        accountId: order.account_id,
        createdAt: order.created_at || new Date().toISOString(),
        updatedAt: order.updated_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error getting account orders:", error);
      throw this.handleError(error);
    }
  }

  isUserRegistered(): boolean {
    return !!this.userId && !!this.userSecret;
  }

  getUser(): { userId: string; userSecret: string } | null {
    if (!this.userId || !this.userSecret) {
      return null;
    }
    return {
      userId: this.userId,
      userSecret: this.userSecret,
    };
  }

  getRateLimitInfo(): { remaining: number; timeUntilReset: number } {
    // TODO: Implement rate limit tracking
    return {
      remaining: 100,
      timeUntilReset: 60,
    };
  }

  private handleError(error: unknown): SnapTradeError {
    if (error instanceof Error) {
      return {
        name: "SnapTradeError",
        message: error.message,
        code: "UNKNOWN_ERROR",
        details: error.stack,
      };
    }
    return {
      name: "SnapTradeError",
      message: String(error),
      code: "UNKNOWN_ERROR",
    };
  }

  async syncAllData(): Promise<void> {
    try {
      if (!this.userId || !this.userSecret) {
        throw new Error("User not registered");
      }

      const client = await this.getClient();
      // Get connections
      await this.getConnections();

      // Get accounts
      await this.getAccounts({
        userId: this.userId,
        userSecret: this.userSecret,
      });

      // Get positions
      const accounts = await this.getAccounts({
        userId: this.userId,
        userSecret: this.userSecret,
      });
      if (accounts.length > 0) {
        await this.getAccountPositions({
          userId: this.userId,
          userSecret: this.userSecret,
          accountId: accounts[0].id,
        });
      }

      // Get balances
      if (accounts.length > 0) {
        await this.getAccountBalances({
          userId: this.userId,
          userSecret: this.userSecret,
          accountId: accounts[0].id,
        });
      }

      // Get orders
      if (accounts.length > 0) {
        await this.getAccountOrders({
          userId: this.userId,
          userSecret: this.userSecret,
          accountId: accounts[0].id,
        });
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      throw this.handleError(error);
    }
  }

  async getAccounts(params: {
    userId: string;
    userSecret: string;
  }): Promise<Account[]> {
    try {
      const client = await this.getClient();
      const response = await client.accountInformation.listUserAccounts({
        userId: params.userId,
        userSecret: params.userSecret,
      });
      return response.data.map((account: any) => ({
        id: account.id,
        name: account.name || "",
        type: account.type || "",
        number: account.number || "",
        institution: account.institution || "",
        status: account.status || "active",
        createdAt: account.created_at || new Date().toISOString(),
        updatedAt: account.updated_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error getting accounts:", error);
      throw this.handleError(error);
    }
  }

  async getAccountDetails(params: {
    userId: string;
    userSecret: string;
    accountId: string;
  }): Promise<Account> {
    try {
      const client = await this.getClient();
      const response = await client.accountInformation.getUserAccountDetails({
        userId: params.userId,
        userSecret: params.userSecret,
        accountId: params.accountId,
      });
      const account = response.data;
      return {
        id: account.id,
        name: account.name || "",
        type: account.type || "",
        number: account.number || "",
        institution: account.institution || "",
        status: account.status || "active",
        createdAt: account.created_at || new Date().toISOString(),
        updatedAt: account.updated_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting account details:", error);
      throw this.handleError(error);
    }
  }

  async getAccountPositions(params: {
    userId: string;
    userSecret: string;
    accountId: string;
  }): Promise<Position[]> {
    try {
      const client = await this.getClient();
      const response = await client.accountInformation.getUserAccountPositions({
        userId: params.userId,
        userSecret: params.userSecret,
        accountId: params.accountId,
      });
      return response.data.map((position: any) => ({
        id: position.id,
        quantity: position.quantity || 0,
        value: position.value || 0,
        currency: position.currency || "",
        symbol:
          typeof position.symbol === "string"
            ? position.symbol
            : position.symbol?.symbol || "",
        price: position.price || 0,
        accountId: position.account_id,
        createdAt: position.created_at || new Date().toISOString(),
        updatedAt: position.updated_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error getting account positions:", error);
      throw this.handleError(error);
    }
  }
} 