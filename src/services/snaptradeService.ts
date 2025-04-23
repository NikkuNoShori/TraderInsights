import { SnapTradeClient } from "@/lib/snaptrade/client";
import type { SnapTradeError } from "@/lib/snaptrade/types";

class SnapTradeService {
  private client: SnapTradeClient;

  constructor() {
    this.client = new SnapTradeClient({
      clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID!,
      consumerKey: process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY!,
      isDemo: process.env.NODE_ENV === "development",
    });
  }

  async initialize() {
    try {
      return await this.client.initialize();
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error as SnapTradeError;
      }
      throw new Error("Failed to initialize SnapTrade client");
    }
  }

  async registerUser(userId: string) {
    try {
      return await this.client.registerUser(userId);
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error as SnapTradeError;
      }
      throw new Error("Failed to register user");
    }
  }

  async getBrokerages() {
    try {
      return await this.client.getBrokerages();
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error as SnapTradeError;
      }
      throw new Error("Failed to get brokerages");
    }
  }

  async getConnections(userId: string, userSecret: string) {
    try {
      return await this.client.getConnections(userId, userSecret);
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error as SnapTradeError;
      }
      throw new Error("Failed to get connections");
    }
  }

  async getAccounts(userId: string, userSecret: string) {
    try {
      return await this.client.getAccounts(userId, userSecret);
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error as SnapTradeError;
      }
      throw new Error("Failed to get accounts");
    }
  }

  async getAccountPositions(
    userId: string,
    userSecret: string,
    accountId: string
  ) {
    try {
      return await this.client.getAccountPositions(
        userId,
        userSecret,
        accountId
      );
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error as SnapTradeError;
      }
      throw new Error("Failed to get account positions");
    }
  }

  async getAccountBalances(
    userId: string,
    userSecret: string,
    accountId: string
  ) {
    try {
      return await this.client.getAccountBalances(
        userId,
        userSecret,
        accountId
      );
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error as SnapTradeError;
      }
      throw new Error("Failed to get account balances");
    }
  }

  async getAccountOrders(
    userId: string,
    userSecret: string,
    accountId: string
  ) {
    try {
      return await this.client.getAccountOrders(userId, userSecret, accountId);
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error as SnapTradeError;
      }
      throw new Error("Failed to get account orders");
    }
  }
}

export const snaptradeService = new SnapTradeService();
