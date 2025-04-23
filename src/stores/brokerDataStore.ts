import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SnapTradeClient } from "@/lib/snaptrade/client";
import { getSnapTradeConfig } from "@/lib/snaptrade/config";
import {
  SnapTradeUser,
  SnapTradeConnection,
  SnapTradeAccount,
  SnapTradePosition,
  SnapTradeBalance,
  SnapTradeOrder,
  Account,
  Position,
  Balance,
  Order,
} from "@/lib/snaptrade/types";
import { StorageHelpers } from "../lib/storage";
import { toast } from "react-hot-toast";

interface BrokerDataState {
  // Data
  connections: SnapTradeConnection[];
  accounts: Account[];
  positions: Position[];
  balances: Balance[];
  orders: Order[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Last sync time
  lastSyncTime: string | null;

  // Actions
  registerUser: (userId: string) => Promise<SnapTradeUser>;
  syncAllData: () => Promise<void>;
  refreshPositions: (accountId: string) => Promise<void>;
  refreshBalances: (accountId: string) => Promise<void>;
  refreshOrders: (accountId: string) => Promise<void>;
  clearError: () => void;
  fetchAccounts: () => Promise<void>;
  fetchPositions: (accountId: string) => Promise<void>;
  fetchBalances: (accountId: string) => Promise<void>;
  fetchOrders: (accountId: string) => Promise<void>;
  reset: () => void;
}

const snapTradeClient = new SnapTradeClient(getSnapTradeConfig());

export const useBrokerDataStore = create<BrokerDataState>((set, get) => ({
  // Initial state
  connections: [],
  accounts: [],
  positions: [],
  balances: [],
  orders: [],
  isLoading: false,
  error: null,
  lastSyncTime: null,

  // Actions
  registerUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        console.log(`Registration attempt ${attempts + 1}/${maxAttempts}`);

        // If we already have a failed registration attempt, add a delay
        // to ensure we get a new timestamp for signature generation
        if (attempts > 0) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempts) * 1000; // 2s, 4s
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // Call the SnapTrade service to register the user
        const userData = await snapTradeClient.registerUser(userId);
        console.log("Registration successful:", { userId });

        // Success - return and exit the retry loop
        set({ isLoading: false });
        return userData;
      } catch (error) {
        attempts++;

        // Check if this is a signature verification error
        const errorStr = String(error);
        const isSignatureError =
          errorStr.includes("Unable to verify signature") ||
          errorStr.includes('code":"1076');

        console.error(`Registration attempt ${attempts} failed:`, {
          error,
          isSignatureError,
        });

        // Only throw on the last attempt
        if (attempts >= maxAttempts) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to register user",
            isLoading: false,
          });
          throw error;
        }
      }
    }

    // This should never be reached due to the while loop, but TypeScript requires a return statement
    throw new Error("Failed to register user after multiple attempts");
  },

  syncAllData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check if user is registered
      if (!snapTradeClient.isUserRegistered()) {
        throw new Error("User not registered with SnapTrade");
      }

      // Get connections
      const connectionsResponse = await snapTradeClient.connections.list();
      // Ensure we have a valid connections array
      const connections = Array.isArray(connectionsResponse)
        ? connectionsResponse
        : [];

      // Get accounts
      const accountsResponse = await snapTradeClient.getAccounts({
        userId: snapTradeClient.getUser().userId,
        userSecret: snapTradeClient.getUser().userSecret,
      });

      set({
        connections,
        accounts: accountsResponse.data || [],
        lastSyncTime: new Date().toISOString(),
      });

      // Fetch positions, balances, and orders for each account
      for (const account of accountsResponse.data || []) {
        await get().fetchPositions(account.id);
        await get().fetchBalances(account.id);
        await get().fetchOrders(account.id);
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to sync broker data",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshPositions: async (accountId: string) => {
    try {
      if (!snapTradeClient.isUserRegistered()) {
        throw new Error("User not registered with SnapTrade");
      }

      const positionsResponse = await snapTradeClient.getAccountPositions({
        userId: snapTradeClient.getUser().userId,
        userSecret: snapTradeClient.getUser().userSecret,
        accountId,
      });

      set((state) => ({
        positions: positionsResponse.data?.positions || [],
      }));
    } catch (error) {
      console.error("Error refreshing positions:", error);
      set({ error: "Failed to fetch positions" });
      toast.error("Failed to fetch positions");
    }
  },

  refreshBalances: async (accountId: string) => {
    try {
      if (!snapTradeClient.isUserRegistered()) {
        throw new Error("User not registered with SnapTrade");
      }

      const balancesResponse = await snapTradeClient.getAccountBalances({
        userId: snapTradeClient.getUser().userId,
        userSecret: snapTradeClient.getUser().userSecret,
        accountId,
      });

      set((state) => ({
        balances: balancesResponse.data || [],
      }));
    } catch (error) {
      console.error("Error refreshing balances:", error);
      set({ error: "Failed to fetch balances" });
      toast.error("Failed to fetch balances");
    }
  },

  refreshOrders: async (accountId: string) => {
    try {
      if (!snapTradeClient.isUserRegistered()) {
        throw new Error("User not registered with SnapTrade");
      }

      const ordersResponse = await snapTradeClient.getAccountOrders({
        userId: snapTradeClient.getUser().userId,
        userSecret: snapTradeClient.getUser().userSecret,
        accountId,
      });

      set((state) => ({
        orders: ordersResponse.data || [],
      }));
    } catch (error) {
      console.error("Error refreshing orders:", error);
      set({ error: "Failed to fetch orders" });
      toast.error("Failed to fetch orders");
    }
  },

  clearError: () => set({ error: null }),

  fetchAccounts: async () => {
    try {
      set({ isLoading: true, error: null });
      if (!snapTradeClient.isUserRegistered()) {
        throw new Error("User not registered with SnapTrade");
      }
      const user = snapTradeClient.getUser();
      if (!user) {
        throw new Error("User not found");
      }
      const accounts = await snapTradeClient.getAccounts({
        userId: user.userId,
        userSecret: user.userSecret,
      });
      set({ accounts });
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      set({ error: "Failed to fetch accounts" });
      toast.error("Failed to fetch accounts");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPositions: async (accountId: string) => {
    try {
      set({ isLoading: true, error: null });
      if (!snapTradeClient.isUserRegistered()) {
        throw new Error("User not registered with SnapTrade");
      }
      const user = snapTradeClient.getUser();
      if (!user) {
        throw new Error("User not found");
      }
      const positions = await snapTradeClient.getAccountPositions({
        userId: user.userId,
        userSecret: user.userSecret,
        accountId,
      });
      set({ positions });
    } catch (error) {
      console.error("Failed to fetch positions:", error);
      set({ error: "Failed to fetch positions" });
      toast.error("Failed to fetch positions");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBalances: async (accountId: string) => {
    try {
      set({ isLoading: true, error: null });
      if (!snapTradeClient.isUserRegistered()) {
        throw new Error("User not registered with SnapTrade");
      }
      const user = snapTradeClient.getUser();
      if (!user) {
        throw new Error("User not found");
      }
      const balances = await snapTradeClient.getAccountBalances({
        userId: user.userId,
        userSecret: user.userSecret,
        accountId,
      });
      set({ balances });
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      set({ error: "Failed to fetch balances" });
      toast.error("Failed to fetch balances");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrders: async (accountId: string) => {
    try {
      set({ isLoading: true, error: null });
      if (!snapTradeClient.isUserRegistered()) {
        throw new Error("User not registered with SnapTrade");
      }
      const user = snapTradeClient.getUser();
      if (!user) {
        throw new Error("User not found");
      }
      const orders = await snapTradeClient.getAccountOrders({
        userId: user.userId,
        userSecret: user.userSecret,
        accountId,
      });
      set({ orders });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      set({ error: "Failed to fetch orders" });
      toast.error("Failed to fetch orders");
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({
      connections: [],
      accounts: [],
      positions: [],
      balances: [],
      orders: [],
      isLoading: false,
      error: null,
      lastSyncTime: null,
    });
  },
})); 