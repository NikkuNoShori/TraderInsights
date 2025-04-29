/**
 * SnapTrade API client implementation
 * This file provides a client for interacting with the SnapTrade API
 */

import {
  Snaptrade,
  Configuration,
  AuthenticationApi,
  AccountInformationApi,
  ReferenceDataApi,
  TradingApi,
  AuthenticationLoginSnapTradeUser200Response,
  AccountInformationApiListUserAccountsRequest,
  AuthenticationApiLoginSnapTradeUserRequest,
  AccountOrderRecord,
  Account,
  Position,
  Balance,
  BrokerageAuthorization,
  SymbolsQuotesInner,
  UserIDandSecret,
} from "snaptrade-typescript-sdk";
import { configManager, configHelpers } from "./config";
import {
  SnapTradeError,
  SnapTradeErrorCode,
  SnapTradeConfig,
  ConnectionLinkResponse,
  ConnectionLinkOptions,
  BrokerageList,
  SnapTradeUser,
  SnapTradeConnectionResponse,
} from "./types";
import { v4 as uuidv4 } from 'uuid';

/**
 * SnapTrade API client
 * Handles all interactions with the SnapTrade API
 */
export class SnapTradeClient {
  private client: Snaptrade;
  private authApi: AuthenticationApi;
  private accountApi: AccountInformationApi;
  private referenceApi: ReferenceDataApi;
  private tradingApi: TradingApi;
  private _userId?: string;
  private _userSecret?: string;

  constructor(config: SnapTradeConfig) {
    const sdkConfig = new Configuration({
      clientId: config.clientId,
      consumerKey: config.consumerKey,
      basePath: config.baseUrl,
    });

    this.client = new Snaptrade(sdkConfig);
    this.authApi = new AuthenticationApi(sdkConfig);
    this.accountApi = new AccountInformationApi(sdkConfig);
    this.referenceApi = new ReferenceDataApi(sdkConfig);
    this.tradingApi = new TradingApi(sdkConfig);
  }

  // Helper method for tests
  getClient(): Snaptrade {
    return this.client;
  }

  private get userId(): string {
    if (!this._userId) throw new Error("Client not initialized");
    return this._userId;
  }

  private get userSecret(): string {
    if (!this._userSecret) throw new Error("Client not initialized");
    return this._userSecret;
  }

  /**
   * Initialize the client with user credentials
   */
  async initialize(userId: string): Promise<Account[]> {
    try {
      const loginResponse = await this.authApi.loginSnapTradeUser({
        userId,
        userSecret: "", // Will be updated after registration if needed
      });

      if (!loginResponse.data) {
        throw new Error("Failed to initialize user");
      }

      // Store credentials for subsequent requests
      this._userId = userId;
      const userData = loginResponse.data as unknown as SnapTradeUser;
      this._userSecret = userData.userSecret;

      if (!this._userSecret) {
        throw new Error("Failed to get user secret");
      }

      const accountRequest: AccountInformationApiListUserAccountsRequest = {
        userId: this.userId,
        userSecret: this.userSecret,
      };

      const accountResponse = await this.accountApi.listUserAccounts(
        accountRequest
      );
      return accountResponse.data || [];
    } catch (error) {
      throw new Error("Failed to initialize SnapTrade client");
    }
  }

  /**
   * Check if a user is registered
   */
  async isUserRegistered(userId: string): Promise<boolean> {
    try {
      const response = await this.authApi.loginSnapTradeUser({
        userId,
        userSecret: "",
      });
      return !!response.data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Register a new user with SnapTrade
   */
  async registerUser(userId: string = uuidv4()): Promise<SnapTradeUser> {
    try {
      const response = await this.authApi.registerSnapTradeUser({
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
  async loginUser(
    userId: string,
    userSecret: string
  ): Promise<AuthenticationLoginSnapTradeUser200Response> {
    try {
      const response = await this.authApi.loginSnapTradeUser({
        userId,
        userSecret,
      });
      return response.data as AuthenticationLoginSnapTradeUser200Response;
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
  async deleteUser(userId?: string): Promise<void> {
    try {
      await this.authApi.deleteSnapTradeUser({
        userId: userId || this.userId,
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
  async getBrokerageList(): Promise<BrokerageAuthorization[]> {
    try {
      const response = await this.referenceApi.listAllBrokerages();
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
  async createConnectionLink(options: ConnectionLinkOptions): Promise<string> {
    try {
      const response = await this.authApi.loginSnapTradeUser({
        userId: this.userId,
        userSecret: this.userSecret,
        broker: options.broker,
        immediateRedirect: options.immediateRedirect,
        customRedirect: options.customRedirect,
      });

      const data = response.data as unknown as SnapTradeConnectionResponse;
      if (!data.redirectURI) {
        throw new Error("No authorization URL returned");
      }

      return data.redirectURI;
    } catch (error) {
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
      const response =
        await this.client.connections.listBrokerageAuthorizations({
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
      const response = await this.accountApi.listUserAccounts({
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
      const response = await this.accountApi.getUserAccountPositions({
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
      const response = await this.accountApi.getUserAccountBalance({
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
   * Get account orders
   */
  async getUserAccountOrders(accountId: string): Promise<AccountOrderRecord[]> {
    try {
      const response = await this.accountApi.getUserAccountOrders({
        userId: this.userId,
        userSecret: this.userSecret,
        accountId,
        state: "all",
      });
      return response.data || [];
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to get account orders",
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
      const response = await this.tradingApi.getUserAccountQuotes({
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

  /**
   * Sync all user data
   */
  async syncAllData(userId: string, userSecret: string): Promise<void> {
    try {
      await Promise.all([
        this.getAccounts(userId, userSecret),
        this.getConnections(userId, userSecret),
      ]);
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to sync all data",
        originalError: error,
      });
    }
  }

  /**
   * Get user accounts
   */
  async getUserAccounts(): Promise<Account[]> {
    try {
      const response = await this.accountApi.listUserAccounts({
        userId: this.userId,
        userSecret: this.userSecret,
      });
      return response.data || [];
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to get user accounts",
        originalError: error,
      });
    }
  }

  /**
   * Get account holdings
   */
  async getAccountHoldings(accountId: string): Promise<Position[]> {
    try {
      const response = await this.accountApi.getUserAccountPositions({
        userId: this.userId,
        userSecret: this.userSecret,
        accountId,
      });
      return response.data || [];
    } catch (error) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message: "Failed to get account holdings",
        originalError: error,
      });
    }
  }

  // Add method to set user credentials
  setUserCredentials(userId: string, userSecret: string) {
    this._userId = userId;
    this._userSecret = userSecret;
  }
}

/**
 * Create a new SnapTrade client instance
 */
export function createSnapTradeClient(
  config: SnapTradeConfig
): SnapTradeClient {
  return new SnapTradeClient(config);
}

/**
 * Get or create a SnapTrade client instance
 */
let clientInstance: SnapTradeClient | null = null;

export function getSnapTradeClient(): SnapTradeClient {
  if (!clientInstance) {
    // Initialize config from environment variables if not already initialized
    if (!configManager.isInitialized()) {
      configHelpers.initializeFromEnv();
    }
    clientInstance = createSnapTradeClient(configManager.getConfig());
  }
  return clientInstance;
}

// Export a lazy-initialized client instance
export const snapTradeClient = getSnapTradeClient();
export default snapTradeClient;

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