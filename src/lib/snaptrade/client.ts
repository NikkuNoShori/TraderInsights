/**
 * SnapTrade API client implementation
 * This file provides a client for interacting with the SnapTrade API
 */

import {
  Configuration,
  Snaptrade,
  Account,
  Position,
  Balance,
  BrokerageAuthorization,
  SymbolsQuotesInner,
  UserIDandSecret,
} from "snaptrade-typescript-sdk";
import { configManager } from "./config";
import {
  SnapTradeError,
  SnapTradeErrorCode,
  SnapTradeConfig,
  SnapTradeUser,
  ConnectionLinkResponse,
  ConnectionLinkOptions,
  BrokerageList,
} from "./types";

/**
 * SnapTrade API client
 * Handles all interactions with the SnapTrade API
 */
export class SnapTradeClient {
  private client: Snaptrade;

  constructor(config: SnapTradeConfig) {
    if (!config.clientId || !config.consumerKey) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Missing required SnapTrade configuration parameters",
      });
    }

    const configuration = new Configuration({
      clientId: config.clientId,
      consumerKey: config.consumerKey,
      basePath: "https://api.snaptrade.com/api/v1",
    });

    this.client = new Snaptrade(configuration);
  }

  /**
   * Register a new user with SnapTrade
   */
  async registerUser(userId: string): Promise<SnapTradeUser> {
    try {
      const response = await this.client.authentication.registerSnapTradeUser({
        userId,
      });
      const data = response.data as UserIDandSecret;
      return {
        userId: data.userId!,
        userSecret: data.userSecret!,
      };
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to register user",
        originalError: error,
      });
    }
  }

  /**
   * Login an existing user
   */
  async loginUser(userId: string, userSecret: string): Promise<SnapTradeUser> {
    try {
      const response = await this.client.authentication.loginSnapTradeUser({
        userId,
        userSecret,
      });
      const data = response.data as UserIDandSecret;
      return {
        userId: data.userId!,
        userSecret: data.userSecret!,
      };
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to login user",
        originalError: error,
      });
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await this.client.authentication.deleteSnapTradeUser({
        userId,
      });
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to delete user",
        originalError: error,
      });
    }
  }

  /**
   * Get list of available brokerages
   */
  async getBrokerageList(): Promise<BrokerageList> {
    try {
      const response = await this.client.referenceData.listAllBrokerages();
      return response.data;
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to get brokerage list",
        originalError: error,
      });
    }
  }

  /**
   * Create a connection link for a brokerage
   */
  async createConnectionLink(
    userId: string,
    userSecret: string,
    options: ConnectionLinkOptions
  ): Promise<ConnectionLinkResponse> {
    try {
      const response = await this.client.authentication.loginSnapTradeUser({
        userId,
        userSecret,
        broker: options.broker,
      });

      const data = response.data as { redirectURI: string };
      if (!data.redirectURI) {
        throw new SnapTradeError({
          code: SnapTradeErrorCode.API_ERROR,
          message: "Failed to get authorization URL",
        });
      }

      return {
        redirectURI: data.redirectURI,
      };
    } catch (error) {
      if (error instanceof SnapTradeError) {
        throw error;
      }
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to create connection link",
        originalError: error,
      });
    }
  }

  /**
   * Get user's connections
   */
  async getConnections(
    userId: string,
    userSecret: string
  ): Promise<BrokerageAuthorization[]> {
    try {
      const response = await this.client.connections.listBrokerageAuthorizations({
        userId,
        userSecret,
      });
      return response.data;
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to get connections",
        originalError: error,
      });
    }
  }

  /**
   * Get user's accounts
   */
  async getAccounts(userId: string, userSecret: string): Promise<Account[]> {
    try {
      const response = await this.client.accountInformation.listUserAccounts({
        userId,
        userSecret,
      });
      return response.data;
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to get accounts",
        originalError: error,
      });
    }
  }

  /**
   * Get account positions
   */
  async getAccountPositions(
    userId: string,
    userSecret: string,
    accountId: string
  ): Promise<Position[]> {
    try {
      const response = await this.client.accountInformation.getUserAccountPositions({
        userId,
        userSecret,
        accountId,
      });
      return response.data;
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to get account positions",
        originalError: error,
      });
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(
    userId: string,
    userSecret: string,
    accountId: string
  ): Promise<Balance> {
    try {
      const response = await this.client.accountInformation.getUserAccountBalance({
        userId,
        userSecret,
        accountId,
      });
      return response.data;
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to get account balance",
        originalError: error,
      });
    }
  }

  /**
   * Get account quotes
   */
  async getAccountQuotes(
    userId: string,
    userSecret: string,
    accountId: string,
    symbols: string[]
  ): Promise<SymbolsQuotesInner[]> {
    try {
      const response = await this.client.trading.getUserAccountQuotes({
        userId,
        userSecret,
        accountId,
        symbols: symbols.join(","),
      });
      return response.data;
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to get account quotes",
        originalError: error,
      });
    }
  }
}

/**
 * Create a new SnapTrade client instance
 */
export function createSnapTradeClient(): SnapTradeClient {
  return new SnapTradeClient(configManager.getConfig());
}

export const snapTradeClient = createSnapTradeClient();

/**
 * Example usage:
 *
 * ```typescript
 * import { snapTradeClient } from "./client";
 *
 * // Check API status
 * const status = await snapTradeClient.getClient().apiStatus.check();
 * console.log(status.data);
 *
 * // Register a user
 * const { userSecret } = await snapTradeClient.registerUser("user123");
 *
 * // Get user holdings
 * const holdings = await snapTradeClient.getHoldings("user123", userSecret);
 * ```
 */