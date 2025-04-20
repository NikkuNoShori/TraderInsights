/**
 * SnapTrade API client implementation
 * This file provides a client for interacting with the SnapTrade API
 */

import { Snaptrade } from "snaptrade-typescript-sdk";
import crypto from "crypto";
import { SnapTradeConfig } from "./types";

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
export class SnapTradeService {
  private client: Snaptrade | null = null;
  private userId: string | null = null;
  private userSecret: string | null = null;
  private config: SnapTradeConfig;

  constructor(config: SnapTradeConfig) {
    console.log("Initializing SnapTradeService with config:", {
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

  /**
   * Initializes the SnapTrade client
   */
  async initialize() {
    if (!this.client) {
      this.client = await createSnapTradeClient(this.config);
    }
    return this.client;
  }

  /**
   * Gets the SnapTrade client, initializing it if necessary
   */
  private async getClient(): Promise<Snaptrade> {
    if (!this.client) {
      this.client = await this.initialize();
    }
    return this.client;
  }

  /**
   * Registers a new user with SnapTrade
   * @param userId Unique identifier for the user
   * @returns User secret
   */
  async registerUser(userId: string): Promise<string> {
    try {
      console.log("Registering SnapTrade user:", { userId });

      // Generate timestamp and signature for this request
      const timestampNum = Math.floor(Date.now() / 1000);
      const timestamp = timestampNum.toString();
      const encoder = new TextEncoder();
      const key = encoder.encode(this.config.consumerKey);
      const message = encoder.encode(`${this.config.clientId}${timestamp}`);

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
      const signature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const response = await fetch(
        "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Signature: signature,
            Timestamp: timestamp,
            ClientId: this.config.clientId,
          },
          body: JSON.stringify({
            userId: userId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("SnapTrade API error:", errorData);
        throw new Error(
          `API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();
      console.log("SnapTrade registration response:", data);

      if (!data?.userSecret) {
        console.error(
          "Failed to register user - no userSecret in response:",
          data
        );
        throw new Error("Failed to register user with SnapTrade");
      }

      this.userId = userId;
      this.userSecret = data.userSecret;

      console.log("User registered successfully");
      return data.userSecret;
    } catch (error) {
      console.error("Error registering user with SnapTrade:", error);
      throw new Error(
        `Failed to register user with SnapTrade: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
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
      throw new Error(
        `Failed to delete user from SnapTrade: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Gets a list of supported brokerages
   * @returns List of brokerages
   */
  async getBrokerages() {
    try {
      console.log("Fetching brokerages with state:", {
        userId: this.userId,
        hasUserSecret: !!this.userSecret,
        clientInitialized: !!this.client,
      });

      const client = await this.getClient();
      const response = await client.referenceData.listAllBrokerages();
      console.log("Raw API response:", {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataLength: response.data?.length,
        data: response.data,
      });

      if (!response.data || response.data.length === 0) {
        console.warn("No brokers returned from API");
        return [];
      }

      // Log each broker for debugging
      response.data.forEach((broker, index) => {
        console.log(`Broker ${index + 1}:`, {
          id: broker.id,
          name: broker.name,
          status: broker.status,
          authTypes: broker.authTypes,
        });
      });

      return response.data;
    } catch (error) {
      console.error("Error getting brokerages from SnapTrade:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      throw new Error(
        `Failed to get brokerages from SnapTrade: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Creates a connection link for a broker
   * @param userId User ID
   * @param userSecret User secret
   * @returns Response data containing the login URL that can be used to open the connection portal
   */
  async createConnectionLink(userId: string, userSecret: string): Promise<any> {
    try {
      console.log("Creating connection link:", { userId });

      const client = await this.getClient();
      const loginResponse = await client.authentication.loginSnapTradeUser({
        userId,
        userSecret,
      });

      if (!loginResponse.data) {
        console.error(
          "Failed to get login link - no data in response:",
          loginResponse
        );
        throw new Error("Failed to get login link");
      }

      return loginResponse.data;
    } catch (error) {
      console.error("Error creating connection link:", error);
      throw new Error(
        `Failed to create connection link: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Gets a list of user's broker connections
   * @returns List of connections
   */
  async getUserConnections() {
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
      throw new Error(
        `Failed to get user connections: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Deletes a broker connection
   * @param authorizationId The authorization ID of the connection to delete
   */
  async deleteConnection(authorizationId: string) {
    try {
      if (!this.userId || !this.userSecret) {
        throw new Error("User not authenticated");
      }

      const client = await this.getClient();
      await client.connections.removeBrokerageAuthorization({
        userId: this.userId,
        userSecret: this.userSecret,
        authorizationId,
      });
    } catch (error) {
      console.error("Error deleting connection:", error);
      throw new Error(
        `Failed to delete connection: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
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
      throw new Error(
        `Failed to get account holdings: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Gets account balances
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @param accountId Account identifier
   * @returns Account balances
   */
  async getAccountBalances(
    userId: string,
    userSecret: string,
    accountId: string
  ) {
    try {
      const client = await this.getClient();
      const response = await client.accountInformation.getUserAccountBalance({
        userId,
        userSecret,
        accountId,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting account balances:", error);
      throw new Error(
        `Failed to get account balances: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Gets account orders
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @param accountId Account identifier
   * @returns Account orders
   */
  async getAccountOrders(
    userId: string,
    userSecret: string,
    accountId: string
  ) {
    try {
      const client = await this.getClient();
      const response = await client.accountInformation.getUserAccountOrders({
        userId,
        userSecret,
        accountId,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting account orders:", error);
      throw new Error(
        `Failed to get account orders: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
} 