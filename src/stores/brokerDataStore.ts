import { create } from "zustand";
import { snapTradeService } from "@/services/snaptradeService";
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
    try {
      await snapTradeService.registerUser(userId);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to register user",
      });
      throw error;
    } finally {
      set({ isLoading: false });
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

      const data = await snapTradeService.syncAllData();
      set({
        connections: data.connections,
        accounts: data.accounts,
        lastSyncTime: new Date().toISOString(),
      });

      // Fetch positions, balances, and orders for each account
      for (const account of data.accounts) {
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
      const positions = await snapTradeService.getAccountHoldings(accountId);
      set((state) => ({
        positions: {
          ...state.positions,
          [accountId]: positions,
        },
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to refresh positions",
      });
    }
  },

  refreshBalances: async (accountId: string) => {
    try {
      const balances = await snapTradeService.getAccountBalances(accountId);
      set((state) => ({
        balances: {
          ...state.balances,
          [accountId]: balances,
        },
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to refresh balances",
      });
    }
  },

  refreshOrders: async (accountId: string) => {
    try {
      const orders = await snapTradeService.getAccountOrders(accountId);
      set((state) => ({
        orders: {
          ...state.orders,
          [accountId]: orders,
        },
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to refresh orders",
      });
    }
  },

  clearError: () => set({ error: null }),
})); 