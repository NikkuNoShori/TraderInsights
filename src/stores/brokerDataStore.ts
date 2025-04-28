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
  SnapTradeCredentials,
  SnapTradeErrorCode,
} from "../lib/snaptrade/types";
import { configHelpers } from "@/lib/snaptrade/config";
import { StorageHelpers } from "../lib/storage";
import { toast } from "react-hot-toast";
import { Configuration, Snaptrade } from "snaptrade-typescript-sdk";
import { SnapTradeConfig } from "@/lib/snaptrade/types";

interface BrokerDataState {
  snapTradeUser: SnapTradeUser | null;
  accounts: SnapTradeAccount[];
  positions: SnapTradePosition[];
  balances: SnapTradeBalance[];
  orders: SnapTradeOrder[];
  brokerages: SnapTradeBrokerage[];
  isLoading: boolean;
  error: SnapTradeError | null;
  registerUser: () => Promise<SnapTradeCredentials>;
  getBrokerageList: () => Promise<SnapTradeBrokerage[]>;
  getAccounts: () => Promise<SnapTradeAccount[]>;
  getAccountPositions: (accountId: string) => Promise<SnapTradePosition[]>;
  getAccountBalance: (accountId: string) => Promise<SnapTradeBalance[]>;
  getAccountOrders: (accountId: string) => Promise<SnapTradeOrder[]>;
}

// Initialize config from environment variables
configHelpers.initializeFromEnv();

export const useBrokerDataStore = create<BrokerDataState>((set, get) => ({
  snapTradeUser: null,
  accounts: [],
  positions: [],
  balances: [],
  orders: [],
  brokerages: [],
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

      const credentials = { userId, userSecret };
      set({
        snapTradeUser: {
          userId: credentials.userId,
          userSecret: credentials.userSecret,
        },
      });
      return credentials;
    } catch (error) {
      const snapTradeError = error as SnapTradeError;
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
      const snapTradeError = error as SnapTradeError;
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
        throw new SnapTradeError(
          "User not registered",
          SnapTradeErrorCode.USER_NOT_REGISTERED
        );
      }
      const accounts = await snapTradeClient.getAccounts(
        snapTradeUser.userId,
        snapTradeUser.userSecret
      );
      set({ accounts });
      return accounts;
    } catch (error) {
      const snapTradeError = error as SnapTradeError;
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
        throw new SnapTradeError(
          "User not registered",
          SnapTradeErrorCode.USER_NOT_REGISTERED
        );
      }
      const positions = await snapTradeClient.getAccountPositions(
        snapTradeUser.userId,
        snapTradeUser.userSecret,
        accountId
      );
      set({ positions });
      return positions;
    } catch (error) {
      const snapTradeError = error as SnapTradeError;
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
        throw new SnapTradeError(
          "User not registered",
          SnapTradeErrorCode.USER_NOT_REGISTERED
        );
      }
      const balances = await snapTradeClient.getAccountBalance(
        snapTradeUser.userId,
        snapTradeUser.userSecret,
        accountId
      );
      set({ balances });
      return balances;
    } catch (error) {
      const snapTradeError = error as SnapTradeError;
      set({ error: snapTradeError });
      throw snapTradeError;
    } finally {
      set({ isLoading: false });
    }
  },

  getAccountOrders: async (accountId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { snapTradeUser } = get();
      if (!snapTradeUser) {
        throw new SnapTradeError(
          "User not registered",
          SnapTradeErrorCode.USER_NOT_REGISTERED
        );
      }
      const orders = await snapTradeClient.getUserAccountQuotes(
        snapTradeUser.userId,
        snapTradeUser.userSecret,
        accountId,
        "" // TODO: Get actual symbols
      );
      set({ orders });
      return orders;
    } catch (error) {
      const snapTradeError = error as SnapTradeError;
      set({ error: snapTradeError });
      throw snapTradeError;
    } finally {
      set({ isLoading: false });
    }
  },
})); 