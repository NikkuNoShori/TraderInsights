/**
 * SnapTrade API client implementation
 * This file provides a client for interacting with the SnapTrade API
 */

import { SnapTradeClient, Configuration } from 'snaptrade-typescript-sdk';
import { SnapTradeConfig } from './types';

/**
 * Creates a SnapTrade API client
 * @param config SnapTrade configuration
 * @returns SnapTrade client instance
 */
export function createSnapTradeClient(config: SnapTradeConfig): SnapTradeClient {
  const configuration = new Configuration({
    clientId: config.clientId,
    consumerSecret: config.consumerSecret,
  });

  return new SnapTradeClient(configuration);
}

/**
 * SnapTrade service class
 * Provides methods for interacting with the SnapTrade API
 */
export class SnapTradeService {
  private client: SnapTradeClient;
  private userId: string | null = null;
  private userSecret: string | null = null;

  constructor(config: SnapTradeConfig) {
    this.client = createSnapTradeClient(config);
  }

  /**
   * Registers a new user with SnapTrade
   * @param userId Unique identifier for the user
   * @returns User secret
   */
  async registerUser(userId: string): Promise<string> {
    try {
      const response = await this.client.authentication.registerSnapTradeUser({
        userId,
      });

      if (!response.userSecret) {
        throw new Error('Failed to register user with SnapTrade');
      }

      this.userId = userId;
      this.userSecret = response.userSecret;

      return response.userSecret;
    } catch (error) {
      console.error('Error registering user with SnapTrade:', error);
      throw new Error(`Failed to register user with SnapTrade: ${error instanceof Error ? error.message : String(error)}`);
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
      console.error('Error deleting user from SnapTrade:', error);
      throw new Error(`Failed to delete user from SnapTrade: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets a list of supported brokerages
   * @returns List of brokerages
   */
  async getBrokerages() {
    try {
      return await this.client.brokerageInformation.listBrokerages();
    } catch (error) {
      console.error('Error getting brokerages from SnapTrade:', error);
      throw new Error(`Failed to get brokerages from SnapTrade: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a connection link for a user to connect their brokerage account
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @param brokerageId Brokerage identifier
   * @param redirectUri Redirect URI after authentication
   * @returns Connection URL
   */
  async createConnectionLink(
    userId: string,
    userSecret: string,
    brokerageId: string,
    redirectUri: string
  ): Promise<string> {
    try {
      const response = await this.client.authentication.loginSnapTradeUser({
        userId,
        userSecret,
      });

      if (!response.redirectUri) {
        throw new Error('Failed to login user with SnapTrade');
      }

      const authLink = await this.client.authentication.authorizeBrokerage({
        userId,
        userSecret,
        brokerageId,
        redirectUri,
      });

      if (!authLink.authorizationUrl) {
        throw new Error('Failed to create connection link');
      }

      return authLink.authorizationUrl;
    } catch (error) {
      console.error('Error creating connection link:', error);
      throw new Error(`Failed to create connection link: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets a list of user connections
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @returns List of connections
   */
  async getUserConnections(userId: string, userSecret: string) {
    try {
      return await this.client.connections.listUserConnections({
        userId,
        userSecret,
      });
    } catch (error) {
      console.error('Error getting user connections:', error);
      throw new Error(`Failed to get user connections: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Deletes a connection
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @param connectionId Connection identifier
   * @returns True if successful
   */
  async deleteConnection(userId: string, userSecret: string, connectionId: string): Promise<boolean> {
    try {
      await this.client.connections.removeConnection({
        userId,
        userSecret,
        connectionId,
      });

      return true;
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw new Error(`Failed to delete connection: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets account holdings for a connection
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @param accountId Account identifier
   * @returns Account holdings
   */
  async getAccountHoldings(userId: string, userSecret: string, accountId: string) {
    try {
      return await this.client.account.getAccountHoldings({
        userId,
        userSecret,
        accountId,
      });
    } catch (error) {
      console.error('Error getting account holdings:', error);
      throw new Error(`Failed to get account holdings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets account balances
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @param accountId Account identifier
   * @returns Account balances
   */
  async getAccountBalances(userId: string, userSecret: string, accountId: string) {
    try {
      return await this.client.account.getAccountBalances({
        userId,
        userSecret,
        accountId,
      });
    } catch (error) {
      console.error('Error getting account balances:', error);
      throw new Error(`Failed to get account balances: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets account orders
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @param accountId Account identifier
   * @param status Order status
   * @returns Account orders
   */
  async getAccountOrders(
    userId: string,
    userSecret: string,
    accountId: string,
    status?: string
  ) {
    try {
      return await this.client.trading.getOrdersForAccount({
        userId,
        userSecret,
        accountId,
        status,
      });
    } catch (error) {
      console.error('Error getting account orders:', error);
      throw new Error(`Failed to get account orders: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets user accounts
   * @param userId Unique identifier for the user
   * @param userSecret User secret
   * @returns User accounts
   */
  async getUserAccounts(userId: string, userSecret: string) {
    try {
      return await this.client.account.listUserAccounts({
        userId,
        userSecret,
      });
    } catch (error) {
      console.error('Error getting user accounts:', error);
      throw new Error(`Failed to get user accounts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 