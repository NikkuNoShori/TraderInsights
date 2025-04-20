import { create } from "zustand";
import { persist } from "zustand/middleware";
import { snapTradeService } from "../services/snaptradeService";
import { SnapTradeUser } from "../lib/snaptrade/types";
import { StorageHelpers } from "../lib/storage";
import type {
  SnapTradeConnection,
  SnapTradeAccount,
  SnapTradePosition,
  SnapTradeBalance,
  SnapTradeOrder,
} from "@/lib/snaptrade/types";

interface BrokerDataState {
  // Data
  connections: SnapTradeConnection[];
  accounts: SnapTradeAccount[];
  positions: Record<string, SnapTradePosition[]>;
  balances: Record<string, SnapTradeBalance[]>;
  orders: Record<string, SnapTradeOrder[]>;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Last sync time
  lastSyncTime: string | null;

  // Actions
  registerUser: (userId: string) => Promise<void>;
  syncAllData: () => Promise<void>;
  refreshPositions: (accountId: string) => Promise<void>;
  refreshBalances: (accountId: string) => Promise<void>;
  refreshOrders: (accountId: string) => Promise<void>;
  clearError: () => void;
}

export const useBrokerDataStore = create<BrokerDataState>((set, get) => ({
  // Initial state
  connections: [],
  accounts: [],
  positions: {},
  balances: {},
  orders: {},
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

        // Call the SnapTrade service to register the user
        const userData = await snapTradeService.registerUser(userId);
        console.log("Registration successful:", { userId });

        // Success - return and exit the retry loop
        set({ isLoading: false });
        return userData;
      } catch (error) {
        attempts++;
        console.error(`Registration attempt ${attempts} failed:`, error);

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

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempts) * 500; // 1s, 2s
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  },

  syncAllData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check if user is registered
      const user = snapTradeService.getUser();
      if (!user) {
        throw new Error("User not registered with SnapTrade");
      }

      // Ensure userId and userSecret are available
      const { userId, userSecret } = user;
      if (!userId || !userSecret) {
        throw new Error("Invalid SnapTrade user data");
      }

      // Get connections
      const connectionsResponse = await snapTradeService.connections.list();

      // Get accounts
      const accountsResponse =
        await snapTradeService.accountInformation.listUserAccounts({
          userId,
          userSecret,
        });

      set({
        connections: connectionsResponse || [],
        accounts: accountsResponse.data || [],
        lastSyncTime: new Date().toISOString(),
      });

      // Fetch positions, balances, and orders for each account
      for (const account of accountsResponse.data || []) {
        await get().refreshPositions(account.id);
        await get().refreshBalances(account.id);
        await get().refreshOrders(account.id);
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
      const user = snapTradeService.getUser();
      if (!user) {
        throw new Error("User not registered with SnapTrade");
      }

      // Extract and validate userId and userSecret
      const { userId, userSecret } = user;
      if (!userId || !userSecret) {
        throw new Error("Invalid SnapTrade user data");
      }

      const positionsResponse =
        await snapTradeService.accountInformation.getUserAccountPositions({
          userId,
          userSecret,
          accountId,
        });

      set((state) => ({
        positions: {
          ...state.positions,
          [accountId]: positionsResponse.data?.positions || [],
        },
      }));
    } catch (error) {
      console.error("Error refreshing positions:", error);
    }
  },

  refreshBalances: async (accountId: string) => {
    try {
      const user = snapTradeService.getUser();
      if (!user) {
        throw new Error("User not registered with SnapTrade");
      }

      // Extract and validate userId and userSecret
      const { userId, userSecret } = user;
      if (!userId || !userSecret) {
        throw new Error("Invalid SnapTrade user data");
      }

      const balancesResponse =
        await snapTradeService.accountInformation.getUserAccountBalance({
          userId,
          userSecret,
          accountId,
        });

      set((state) => ({
        balances: {
          ...state.balances,
          [accountId]: balancesResponse.data || [],
        },
      }));
    } catch (error) {
      console.error("Error refreshing balances:", error);
    }
  },

  refreshOrders: async (accountId: string) => {
    try {
      const user = snapTradeService.getUser();
      if (!user) {
        throw new Error("User not registered with SnapTrade");
      }

      // Extract and validate userId and userSecret
      const { userId, userSecret } = user;
      if (!userId || !userSecret) {
        throw new Error("Invalid SnapTrade user data");
      }

      const ordersResponse =
        await snapTradeService.accountInformation.getUserAccountOrders({
          userId,
          userSecret,
          accountId,
        });

      set((state) => ({
        orders: {
          ...state.orders,
          [accountId]: ordersResponse.data || [],
        },
      }));
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  },

  clearError: () => set({ error: null }),
})); 