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
} from "../lib/snaptrade/types";
import { createConfig } from "@/lib/snaptrade/config";
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
  getUserAccounts: () => Promise<SnapTradeAccount[]>;
  getAccountHoldings: (accountId: string) => Promise<SnapTradePosition[]>;
  getAccountBalance: (accountId: string) => Promise<SnapTradeBalance[]>;
  getUserAccountOrders: (accountId: string) => Promise<SnapTradeOrder[]>;
}

const config = createConfig();

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
      const credentials = await snapTradeClient.registerUser();
      if (!credentials.userId || !credentials.userSecret) {
        throw new Error(
          "User registration failed: missing userId or userSecret"
        );
      }
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

  getUserAccounts: async () => {
    try {
      set({ isLoading: true, error: null });
      const accounts = await snapTradeClient.getUserAccounts();
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

  getAccountHoldings: async (accountId: string) => {
    try {
      set({ isLoading: true, error: null });
      const positions = await snapTradeClient.getAccountHoldings(accountId);
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
      const balances = await snapTradeClient.getAccountBalance(accountId);
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

  getUserAccountOrders: async (accountId: string) => {
    try {
      set({ isLoading: true, error: null });
      const orders = await snapTradeClient.getUserAccountOrders(accountId);
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