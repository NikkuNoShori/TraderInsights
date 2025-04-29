import { create } from "zustand";
import { persist } from "zustand/middleware";
import snapTradeClient from "@/lib/snaptrade/client";
import {
  SnapTradeError,
  SnapTradeUser,
  SnapTradeAccount,
  SnapTradePosition,
  SnapTradeBalance,
  SnapTradeOrder,
  SnapTradeConnection,
  SnapTradeBrokerage,
  SnapTradeErrorCode,
} from "../lib/snaptrade/types";
import { configHelpers } from "@/lib/snaptrade/config";
import { StorageHelpers } from "../lib/storage";
import { toast } from "react-hot-toast";
import {
  Configuration,
  Snaptrade,
  Balance,
  BrokerageAuthorization,
} from "snaptrade-typescript-sdk";
import { SnapTradeConfig } from "@/lib/snaptrade/types";
import { ErrorHandler } from "@/lib/snaptrade/errors";

interface BrokerDataState {
  snapTradeUser: SnapTradeUser | null;
  accounts: SnapTradeAccount[];
  positions: SnapTradePosition[];
  balances: Balance[];
  orders: SnapTradeOrder[];
  brokerages: SnapTradeBrokerage[];
  connections: BrokerageAuthorization[];
  isLoading: boolean;
  error: SnapTradeError | null;
  registerUser: () => Promise<SnapTradeUser>;
  getBrokerageList: () => Promise<SnapTradeBrokerage[]>;
  getAccounts: () => Promise<SnapTradeAccount[]>;
  getAccountPositions: (accountId: string) => Promise<SnapTradePosition[]>;
  getAccountBalance: (accountId: string) => Promise<Balance[]>;
  getAccountOrders: (accountId: string) => Promise<SnapTradeOrder[]>;
  getConnections: () => Promise<BrokerageAuthorization[]>;
}

export const useBrokerDataStore = create<BrokerDataState>((set, get) => {
  // Initialize config when store is created
  configHelpers.initializeFromEnv();

  return {
    snapTradeUser: null,
    accounts: [],
    positions: [],
    balances: [],
    orders: [],
    brokerages: [],
    connections: [],
    isLoading: false,
    error: null,

    registerUser: async () => {
      try {
        set({ isLoading: true, error: null });
        const userId = `user_${Date.now()}`;

        // Step 1: Register the user
        await snapTradeClient.registerUser(userId);

        // Step 2: Get the user secret by logging in
        const userSecret = "default"; // TODO: Get actual userSecret from login

        const user: SnapTradeUser = {
          userId,
          userSecret,
        };

        set({ snapTradeUser: user });
        return user;
      } catch (error) {
        const snapTradeError = ErrorHandler.wrapError(
          error,
          "Failed to register user"
        );
        set({ error: snapTradeError });
        throw snapTradeError;
      } finally {
        set({ isLoading: false });
      }
    },

    getBrokerageList: async () => {
      try {
        set({ isLoading: true, error: null });
        const brokerages = await snapTradeClient.getBrokerageList();
        set({ brokerages });
        return brokerages;
      } catch (error) {
        const snapTradeError = ErrorHandler.wrapError(
          error,
          "Failed to get brokerage list"
        );
        set({ error: snapTradeError });
        throw snapTradeError;
      } finally {
        set({ isLoading: false });
      }
    },

    getConnections: async () => {
      try {
        set({ isLoading: true, error: null });
        const { snapTradeUser } = get();
        if (!snapTradeUser) {
          throw new SnapTradeError({
            message: "User not registered",
            code: SnapTradeErrorCode.AUTHENTICATION_ERROR,
          });
        }
        const connections = await snapTradeClient.getConnections(
          snapTradeUser.userId,
          snapTradeUser.userSecret
        );
        set({ connections });
        return connections;
      } catch (error) {
        const snapTradeError = ErrorHandler.wrapError(
          error,
          "Failed to get connections"
        );
        set({ error: snapTradeError });
        throw snapTradeError;
      } finally {
        set({ isLoading: false });
      }
    },

    getAccounts: async () => {
      try {
        set({ isLoading: true, error: null });
        const { snapTradeUser } = get();
        if (!snapTradeUser) {
          throw new SnapTradeError({
            message: "User not registered",
            code: SnapTradeErrorCode.AUTHENTICATION_ERROR,
          });
        }
        const accounts = await snapTradeClient.getAccounts(
          snapTradeUser.userId,
          snapTradeUser.userSecret
        );
        set({ accounts });
        return accounts;
      } catch (error) {
        const snapTradeError = ErrorHandler.wrapError(
          error,
          "Failed to get accounts"
        );
        set({ error: snapTradeError });
        throw snapTradeError;
      } finally {
        set({ isLoading: false });
      }
    },

    getAccountPositions: async (accountId: string) => {
      try {
        set({ isLoading: true, error: null });
        const { snapTradeUser } = get();
        if (!snapTradeUser) {
          throw new SnapTradeError({
            message: "User not registered",
            code: SnapTradeErrorCode.AUTHENTICATION_ERROR,
          });
        }
        const positions = await snapTradeClient.getAccountPositions(
          snapTradeUser.userId,
          snapTradeUser.userSecret,
          accountId
        );
        set({ positions });
        return positions;
      } catch (error) {
        const snapTradeError = ErrorHandler.wrapError(
          error,
          "Failed to get account positions"
        );
        set({ error: snapTradeError });
        throw snapTradeError;
      } finally {
        set({ isLoading: false });
      }
    },

    getAccountBalance: async (accountId: string) => {
      try {
        set({ isLoading: true, error: null });
        const { snapTradeUser } = get();
        if (!snapTradeUser) {
          throw new SnapTradeError({
            message: "User not registered",
            code: SnapTradeErrorCode.AUTHENTICATION_ERROR,
          });
        }
        const balance = await snapTradeClient.getAccountBalance(
          snapTradeUser.userId,
          snapTradeUser.userSecret,
          accountId
        );
        const balances = [balance];
        set({ balances });
        return balances;
      } catch (error) {
        const snapTradeError = ErrorHandler.wrapError(
          error,
          "Failed to get account balance"
        );
        set({ error: snapTradeError });
        throw snapTradeError;
      } finally {
        set({ isLoading: false });
      }
    },

    getAccountOrders: async (accountId: string) => {
      set({ isLoading: true, error: null });
      try {
        const { snapTradeUser } = get();
        if (!snapTradeUser) {
          throw new SnapTradeError({
            code: SnapTradeErrorCode.AUTHENTICATION_ERROR,
            message: "User not registered",
          });
        }
        const orders = await snapTradeClient.getUserAccountOrders(accountId);
        set({ orders });
        return orders;
      } catch (error: unknown) {
        throw ErrorHandler.wrapError(error, "Failed to fetch account orders");
      } finally {
        set({ isLoading: false });
      }
    },
  };
}); 