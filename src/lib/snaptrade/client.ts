/**
 * SnapTrade API client implementation
 * This file provides a client for interacting with the SnapTrade API
 */

import { 
  Configuration, 
  Snaptrade, 
  AccountInformationApi, 
  AuthenticationApi, 
  ReferenceDataApi,
  AuthenticationLoginSnapTradeUser200Response,
  Brokerage,
  AccountOrderRecord,
  Account,
  Balance,
  Position,
  UserIDandSecret
} from "snaptrade-typescript-sdk";
import {
  SnapTradeConfig,
  SnapTradeError,
  SnapTradeErrorCode,
  ConnectionLinkOptions,
  ConnectionLinkResponse,
  AccountBalance,
  UserResponse,
} from "./types";

/**
 * SnapTrade API client
 * Implements the official SnapTrade TypeScript SDK
 */
export class SnapTradeClient {
  private client: Snaptrade;
  private authApi: AuthenticationApi;
  private accountApi: AccountInformationApi;
  private referenceApi: ReferenceDataApi;
  private userId: string;
  private userSecret: string;

  constructor(config: SnapTradeConfig) {
    const configuration = new Configuration({
      clientId: config.clientId,
      consumerKey: config.consumerKey,
    });

    this.client = new Snaptrade(configuration);
    this.authApi = this.client.authentication;
    this.accountApi = this.client.accountInformation;
    this.referenceApi = this.client.referenceData;
    this.userId = "";
    this.userSecret = "";
  }

  // Helper function to validate userId format
  private validateUserId(userId: string): void {
    if (!userId) {
      throw new Error("userId is required for SnapTrade user registration");
    }

    // Check for email addresses
    if (userId.includes("@")) {
      throw new Error("userId cannot be an email address");
    }

    // Check length and format
    if (userId.length < 3) {
      throw new Error("userId must be at least 3 characters long");
    }

    if (userId.length > 100) {
      throw new Error("userId must not exceed 100 characters");
    }

    // Check for invalid characters
    const invalidChars = /[^a-zA-Z0-9_-]/;
    if (invalidChars.test(userId)) {
      throw new Error(
        "userId can only contain letters, numbers, underscores, and hyphens"
      );
    }
  }

  /**
   * Get the underlying Snaptrade client instance
   */
  getClient(): Snaptrade {
    return this.client;
  }

  /**
   * Register a new SnapTrade user
   */
  async registerUser(): Promise<UserIDandSecret> {
    try {
      const response = await this.authApi.registerSnapTradeUser({
        userId: crypto.randomUUID()
      });
      if (!response.data?.userId || !response.data?.userSecret) {
        throw new SnapTradeError("Failed to register user", SnapTradeErrorCode.UNKNOWN_ERROR);
      }
      this.userId = response.data.userId;
      this.userSecret = response.data.userSecret;
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a SnapTrade user
   */
  async deleteUser(): Promise<void> {
    this.ensureAuthenticated();
    try {
      await this.authApi.deleteSnapTradeUser({
        userId: this.userId
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a connection link for a user
   */
  async createConnectionLink(options: ConnectionLinkOptions): Promise<AuthenticationLoginSnapTradeUser200Response> {
    this.ensureAuthenticated();
    try {
      const response = await this.authApi.loginSnapTradeUser({
        userId: this.userId,
        userSecret: this.userSecret,
        broker: options.broker,
        immediateRedirect: options.immediateRedirect,
        customRedirect: options.customRedirect,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get list of supported brokerages
   */
  async getBrokerageList(): Promise<Brokerage[]> {
    try {
      const response = await this.referenceApi.listAllBrokerages();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's accounts
   */
  async getUserAccounts(): Promise<Account[]> {
    this.ensureAuthenticated();
    try {
      const response = await this.accountApi.listUserAccounts({
        userId: this.userId,
        userSecret: this.userSecret
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get account holdings
   */
  async getAccountHoldings(accountId: string): Promise<Position[]> {
    this.ensureAuthenticated();
    try {
      const response = await this.accountApi.getUserAccountPositions({
        userId: this.userId,
        userSecret: this.userSecret,
        accountId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<Balance[]> {
    this.ensureAuthenticated();
    try {
      const response = await this.accountApi.getUserAccountBalance({
        userId: this.userId,
        userSecret: this.userSecret,
        accountId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get account orders
   */
  async getUserAccountOrders(accountId: string): Promise<AccountOrderRecord[]> {
    this.ensureAuthenticated();
    try {
      const response = await this.accountApi.getUserAccountOrders({
        userId: this.userId,
        userSecret: this.userSecret,
        accountId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): SnapTradeError {
    if (error instanceof Error) {
      return new SnapTradeError(error.message, SnapTradeErrorCode.UNKNOWN_ERROR);
    }
    return new SnapTradeError("Unknown error occurred", SnapTradeErrorCode.UNKNOWN_ERROR);
  }

  /**
   * Check if user is authenticated
   */
  private ensureAuthenticated(): void {
    if (!this.userId || !this.userSecret) {
      throw new SnapTradeError("User not authenticated", SnapTradeErrorCode.NOT_AUTHENTICATED);
    }
  }
}

// Create singleton instance
const config: SnapTradeConfig = {
  clientId: import.meta.env.VITE_SNAPTRADE_CLIENT_ID,
  consumerKey: import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY,
};

export default new SnapTradeClient(config);

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
 * const { userSecret } = await snapTradeClient.registerUser();
 *
 * // Get user holdings
 * const holdings = await snapTradeClient.getHoldings("user123", userSecret);
 * ```
 */