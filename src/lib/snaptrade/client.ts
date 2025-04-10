/**
 * SnapTrade API client implementation
 * This file provides a client for interacting with the SnapTrade API
 */

import { Snaptrade } from 'snaptrade-typescript-sdk';
import { SnapTradeConfig } from './types';

/**
 * Creates a SnapTrade API client
 * @param config SnapTrade configuration
 * @returns SnapTrade client instance
 */
export function createSnapTradeClient(config: SnapTradeConfig): Snaptrade {
  console.log("Creating SnapTrade client with config:", {
    hasClientId: !!config.clientId,
    hasConsumerKey: !!config.consumerKey,
    hasRedirectUri: !!config.redirectUri,
    clientId: config.clientId,
    redirectUri: config.redirectUri,
  });

  if (!config.clientId || !config.consumerKey) {
    console.error("Missing required SnapTrade configuration:", {
      hasClientId: !!config.clientId,
      hasConsumerKey: !!config.consumerKey,
    });
    throw new Error("Missing required SnapTrade configuration");
  }

  const client = new Snaptrade({
    clientId: config.clientId,
    consumerKey: config.consumerKey,
  });

  console.log("SnapTrade client created successfully");
  return client;
}

/**
 * SnapTrade service class
 * Provides methods for interacting with the SnapTrade API
 */
export class SnapTradeService {
  private client: Snaptrade;
  private userId: string | null = null;
  private userSecret: string | null = null;

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

    this.client = createSnapTradeClient(config);
  }

  /**
   * Registers a new user with SnapTrade
   * @param userId Unique identifier for the user
   * @returns User secret
   */
  async registerUser(userId: string): Promise<string> {
    try {
      console.log("Registering user:", { userId });
      const response = await this.client.authentication.registerSnapTradeUser({
        userId,
      });

      if (!response.data?.userSecret) {
        console.error(
          "Failed to register user - no userSecret in response:",
          response
        );
        throw new Error("Failed to register user with SnapTrade");
      }

      this.userId = userId;
      this.userSecret = response.data.userSecret;

      console.log("User registered successfully");
      return response.data.userSecret;
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
      await this.client.authentication.deleteSnapTradeUser({
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

      if (!this.client) {
        throw new Error("SnapTrade client not initialized");
      }

      const response = await this.client.referenceData.listAllBrokerages();
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

      // Get the login link for the connection portal
      const loginResponse = await this.client.authentication.loginSnapTradeUser(
        {
          userId,
          userSecret,
        }
      );

      if (!loginResponse.data) {
        console.error(
          "Failed to get login link - no data in response:",
          loginResponse
        );
        throw new Error("Failed to get login link");
      }

      // Return the entire response data which will contain the redirect URL
      // This can be used in an iframe, new window, or with the React SDK
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

      const response =
        await this.client.connections.listBrokerageAuthorizations({
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

      await this.client.connections.removeBrokerageAuthorization({
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
      const response = await this.client.accountInformation.getUserHoldings({
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
      const response =
        await this.client.accountInformation.getUserAccountBalance({
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
      const response =
        await this.client.accountInformation.getUserAccountOrders({
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