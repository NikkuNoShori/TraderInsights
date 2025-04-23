/**
 * SnapTrade API client implementation
 * This file provides a client for interacting with the SnapTrade API
 */

import {
  Configuration,
  Snaptrade,
  UserIDandSecret,
  Account as SDKAccount,
  Position as SDKPosition,
  Balance as SDKBalance,
  BrokerageAuthorization,
  Brokerage,
  AccountOrderRecord,
  Status,
  AuthenticationApi,
  ReferenceDataApi,
  ConnectionsApi,
  AccountInformationApi,
} from "snaptrade-typescript-sdk";
import {
  SnapTradeConfig,
  SnapTradeError,
  SnapTradeConnection,
  SnapTradeAccount,
  SnapTradePosition,
  SnapTradeBalance,
  SnapTradeOrder,
  SnaptradeBrokerage,
} from "./types";

export class SnapTradeClient {
  private client: Snaptrade;

  constructor(config: SnapTradeConfig) {
    const configuration = new Configuration({
      clientId: config.clientId,
      consumerKey: config.consumerKey,
      // Demo mode uses a different base URL
      basePath: config.isDemo
        ? "https://demo-api.snaptrade.com/api/v1"
        : "https://api.snaptrade.com/api/v1",
    });
    this.client = new Snaptrade(configuration);
  }

  async initialize(): Promise<Status> {
    try {
      const response = await this.client.apiStatus.check();
      return response.data;
    } catch (error) {
      const err = new Error(
        `Failed to initialize SnapTrade client: ${error}`
      ) as SnapTradeError;
      err.code = "INITIALIZATION_ERROR";
      err.details = error;
      throw err;
    }
  }

  async registerUser(userId: string): Promise<UserIDandSecret> {
    try {
      const response = await this.client.authentication.registerSnapTradeUser({
        userId,
      });
      return response.data;
    } catch (error) {
      const err = new Error(
        `Failed to register user: ${error}`
      ) as SnapTradeError;
      err.code = "REGISTRATION_ERROR";
      err.details = error;
      throw err;
    }
  }

  async getBrokerages(): Promise<SnaptradeBrokerage[]> {
    try {
      const response = await this.client.referenceData.listAllBrokerages();
      return response.data;
    } catch (error) {
      const err = new Error(
        `Failed to get brokerages: ${error}`
      ) as SnapTradeError;
      err.code = "BROKERAGES_ERROR";
      err.details = error;
      throw err;
    }
  }

  async getConnections(
    userId: string,
    userSecret: string
  ): Promise<SnapTradeConnection[]> {
    try {
      const response =
        await this.client.connections.listBrokerageAuthorizations({
          userId,
          userSecret,
        });
      return response.data;
    } catch (error) {
      const err = new Error(
        `Failed to get connections: ${error}`
      ) as SnapTradeError;
      err.code = "CONNECTIONS_ERROR";
      err.details = error;
      throw err;
    }
  }

  async getAccounts(
    userId: string,
    userSecret: string
  ): Promise<SnapTradeAccount[]> {
    try {
      const response = await this.client.accountInformation.listUserAccounts({
        userId,
        userSecret,
      });
      return response.data;
    } catch (error) {
      const err = new Error(
        `Failed to get accounts: ${error}`
      ) as SnapTradeError;
      err.code = "ACCOUNTS_ERROR";
      err.details = error;
      throw err;
    }
  }

  async getAccountPositions(
    userId: string,
    userSecret: string,
    accountId: string
  ): Promise<SnapTradePosition[]> {
    try {
      const response =
        await this.client.accountInformation.getUserAccountPositions({
          userId,
          userSecret,
          accountId,
        });
      return response.data;
    } catch (error) {
      const err = new Error(
        `Failed to get account positions: ${error}`
      ) as SnapTradeError;
      err.code = "POSITIONS_ERROR";
      err.details = error;
      throw err;
    }
  }

  async getAccountBalances(
    userId: string,
    userSecret: string,
    accountId: string
  ): Promise<SnapTradeBalance[]> {
    try {
      const response =
        await this.client.accountInformation.getUserAccountBalance({
          userId,
          userSecret,
          accountId,
        });
      return response.data;
    } catch (error) {
      const err = new Error(
        `Failed to get account balances: ${error}`
      ) as SnapTradeError;
      err.code = "BALANCES_ERROR";
      err.details = error;
      throw err;
    }
  }

  async getAccountOrders(
    userId: string,
    userSecret: string,
    accountId: string
  ): Promise<SnapTradeOrder[]> {
    try {
      const response =
        await this.client.accountInformation.getUserAccountOrders({
          userId,
          userSecret,
          accountId,
          state: "all",
        });
      return response.data;
    } catch (error) {
      const err = new Error(
        `Failed to get account orders: ${error}`
      ) as SnapTradeError;
      err.code = "ORDERS_ERROR";
      err.details = error;
      throw err;
    }
  }
} 