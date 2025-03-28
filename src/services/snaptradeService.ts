/**
 * SnapTrade service
 * This service provides methods for interacting with the SnapTrade API
 */

import { createSnapTradeClient } from '@/lib/snaptrade/client';
import { StorageHelpers, STORAGE_KEYS } from '@/lib/snaptrade/storage';
import { RateLimiter } from '@/lib/snaptrade/rateLimiter';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { 
  SnapTradeConfig, 
  SnapTradeUser, 
  SnapTradeConnection, 
  SnapTradeAccount, 
  SnapTradePosition, 
  SnapTradeBalance, 
  SnapTradeOrder 
} from '@/lib/snaptrade/types';

class RateLimitError extends Error {
  constructor(resetAt: number) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
    this.resetAt = resetAt;
  }
  resetAt: number;
}

/**
 * SnapTrade service singleton
 */
class SnapTradeServiceSingleton {
  private static instance: SnapTradeServiceSingleton;
  private client: ReturnType<typeof createSnapTradeClient> | null = null;
  private config: SnapTradeConfig | null = null;
  private initialized = false;
  private rateLimiter: RateLimiter;

  private constructor() {
    // Private constructor to enforce singleton pattern
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

    this.config = {
      clientId: config.clientId,
      consumerSecret: config.consumerSecret,
      redirectUri: config.redirectUri,
    };

    this.client = createSnapTradeClient(this.config);
    this.initialized = true;
  }

  /**
   * Check if the service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.client) {
      throw new Error('SnapTrade service not initialized. Call init() first.');
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
   * Register a new user with SnapTrade
   */
  public async registerUser(userId: string): Promise<void> {
    this.ensureInitialized();

    try {
      const userSecret = await this.client!.registerUser(userId);
      
      // Save user credentials
      const user: SnapTradeUser = {
        userId,
        userSecret
      };
      
      StorageHelpers.saveUser(user);
      console.log('User registered successfully:', userId);
    } catch (error) {
      console.error('Failed to register user:', error);
      throw new Error(`Failed to register user: ${error instanceof Error ? error.message : String(error)}`);
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
   * Get user from storage
   */
  private getUser(): SnapTradeUser | null {
    return StorageHelpers.getUser();
  }

  /**
   * Delete a user from SnapTrade
   */
  public async deleteUser(userId: string): Promise<void> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      
      if (!user) {
        throw new Error('No user registered');
      }
      
      await this.client!.deleteUser(userId, user.userSecret);
      
      // If the deleted user is the current user, clear credentials
      if (user.userId === userId) {
        StorageHelpers.clearAll();
      }
      
      console.log('User deleted successfully:', userId);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : String(error)}`);
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
        throw new Error('No user registered');
      }

      this.checkRateLimit(user.userId);
      const brokerages = await this.client!.getBrokerages();
      this.rateLimiter.incrementRequestCount(user.userId);
      return brokerages;
    } catch (error) {
      console.error('Failed to get brokerages:', error);
      throw error;
    }
  }

  /**
   * Create a connection link for a user to connect their brokerage account
   */
  public async createConnectionLink(brokerageId: string): Promise<string> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      
      if (!user) {
        throw new Error('No user registered');
      }
      
      const redirectUri = this.config?.redirectUri;
      
      if (!redirectUri) {
        throw new Error('Redirect URI not configured');
      }

      this.checkRateLimit(user.userId);
      const connectionUrl = await this.client!.createConnectionLink(
        user.userId,
        user.userSecret,
        brokerageId,
        redirectUri
      );
      this.rateLimiter.incrementRequestCount(user.userId);
      
      return connectionUrl;
    } catch (error) {
      console.error('Failed to create connection link:', error);
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
      
      if (!user) {
        throw new Error('No user registered');
      }
      
      const connections = await this.client!.getUserConnections(user.userId, user.userSecret);
      StorageHelpers.saveConnections(connections);
      return connections;
    } catch (error) {
      console.error('Failed to get user connections:', error);
      throw new Error(`Failed to get user connections: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a connection
   */
  public async deleteConnection(connectionId: string): Promise<void> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      
      if (!user) {
        throw new Error('No user registered');
      }
      
      await this.client!.deleteConnection(user.userId, user.userSecret, connectionId);
      
      // Update stored connections
      const connections = StorageHelpers.getConnections();
      const updatedConnections = connections.filter(conn => conn.id !== connectionId);
      StorageHelpers.saveConnections(updatedConnections);
      
      // Remove accounts associated with this connection
      const accounts = StorageHelpers.getAccounts();
      const updatedAccounts = accounts.filter(acc => acc.connectionId !== connectionId);
      StorageHelpers.saveAccounts(updatedAccounts);
      
      console.log('Connection deleted successfully:', connectionId);
    } catch (error) {
      console.error('Failed to delete connection:', error);
      throw new Error(`Failed to delete connection: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a list of user accounts
   */
  public async getUserAccounts(): Promise<SnapTradeAccount[]> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      
      if (!user) {
        throw new Error('No user registered');
      }
      
      const accounts = await this.client!.getUserAccounts(user.userId, user.userSecret);
      StorageHelpers.saveAccounts(accounts);
      return accounts;
    } catch (error) {
      console.error('Failed to get user accounts:', error);
      throw new Error(`Failed to get user accounts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get account holdings
   */
  public async getAccountHoldings(accountId: string): Promise<SnapTradePosition[]> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      
      if (!user) {
        throw new Error('No user registered');
      }

      this.checkRateLimit(user.userId);
      const holdings = await this.client!.getAccountHoldings(user.userId, user.userSecret, accountId);
      this.rateLimiter.incrementRequestCount(user.userId);
      return holdings;
    } catch (error) {
      console.error('Failed to get account holdings:', error);
      throw error;
    }
  }

  /**
   * Get account balances
   */
  public async getAccountBalances(accountId: string): Promise<SnapTradeBalance[]> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      
      if (!user) {
        throw new Error('No user registered');
      }
      
      const balances = await this.client!.getAccountBalances(user.userId, user.userSecret, accountId);
      this.saveBalances(balances);
      return balances;
    } catch (error) {
      console.error('Failed to get account balances:', error);
      throw new Error(`Failed to get account balances: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get account orders
   */
  public async getAccountOrders(accountId: string): Promise<SnapTradeOrder[]> {
    this.ensureInitialized();

    try {
      const user = this.getUser();
      
      if (!user) {
        throw new Error('No user registered');
      }

      this.checkRateLimit(user.userId);
      const orders = await this.client!.getAccountOrders(user.userId, user.userSecret, accountId);
      this.rateLimiter.incrementRequestCount(user.userId);
      return orders;
    } catch (error) {
      console.error('Failed to get account orders:', error);
      throw error;
    }
  }

  /**
   * Sync all user data (connections and accounts)
   */
  public async syncAllData(): Promise<{ connections: SnapTradeConnection[], accounts: SnapTradeAccount[] }> {
    this.ensureInitialized();

    try {
      const connections = await this.getUserConnections();
      const accounts = await this.getUserAccounts();
      
      return { connections, accounts };
    } catch (error) {
      console.error('Failed to sync all data:', error);
      throw new Error(`Failed to sync all data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Save account balances
   * @param balances Account balances
   */
  private saveBalances(balances: SnapTradeBalance[]): void {
    StorageHelpers.setItem(STORAGE_KEYS.BALANCES, JSON.stringify(balances));
  }

  /**
   * Clear all data
   */
  private clearAllData(): void {
    StorageHelpers.clearAll();
  }

  /**
   * Get rate limit info for current user
   */
  public getRateLimitInfo(): { remaining: number; timeUntilReset: number } | null {
    const user = this.getUser();
    if (!user) {
      return null;
    }

    return {
      remaining: this.rateLimiter.getRemainingRequests(user.userId),
      timeUntilReset: this.rateLimiter.getTimeUntilReset(user.userId),
    };
  }
}

// Initialize the service with configuration from environment variables
export const snapTradeService = SnapTradeServiceSingleton.getInstance();

try {
  const config = getSnapTradeConfig();
  snapTradeService.initialize(config);
} catch (error) {
  console.error('Failed to initialize SnapTrade service:', error);
} 