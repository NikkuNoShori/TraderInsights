import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Trade } from "@/types/trade";
import { config } from "@/config";
import { calculatePnL } from "@/utils/trade";
import React from "react";

interface TradeState {
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  currentUserId: string | null;
}

interface TradeActions {
  fetchTrades: (userId: string, force?: boolean) => Promise<void>;
  importTrades: (trades: Partial<Trade>[]) => Promise<void>;
  addTrade: (trade: Omit<Trade, "id" | "user_id">) => Promise<void>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
}

const STORAGE_KEY = "trader_insights_trades";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to generate a unique ID
const generateId = () =>
  `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper functions for localStorage
const getStoredTrades = (): Trade[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const trades = JSON.parse(stored);
      if (process.env.NODE_ENV === "development") {
        console.debug(
          "[TradeStore] Loaded trades from localStorage:",
          trades.length
        );
      }
      return trades;
    }
  } catch (error) {
    console.error(
      "[TradeStore] Error loading trades from localStorage:",
      error
    );
  }
  return [];
};

const setStoredTrades = (trades: Trade[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  } catch (error) {
    console.error("Failed to save trades to localStorage:", error);
  }
};

// Helper function to calculate and add PnL to a trade
const addPnLToTrade = (trade: Trade): Trade => {
  return {
    ...trade,
    pnl: calculatePnL(trade),
  };
};

export const useTradeStore = create<TradeState & TradeActions>((set, get) => ({
  trades: [],
  isLoading: false,
  error: null,
  lastFetch: null,
  currentUserId: null,

  fetchTrades: async (userId: string, force = false) => {
    const state = get();
    const now = Date.now();

    // Return cached data if:
    // 1. We have data
    // 2. It's for the same user
    // 3. The cache hasn't expired
    // 4. We're not forcing a refresh
    if (
      !force &&
      state.trades.length > 0 &&
      state.currentUserId === userId &&
      state.lastFetch &&
      now - state.lastFetch < CACHE_DURATION
    ) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[TradeStore] Using cached trades");
      }
      return;
    }

    set({ isLoading: true, error: null });
    try {
      if (!config.isProduction) {
        const trades = getStoredTrades()
          .filter((t) => t.user_id === userId)
          .map(addPnLToTrade);
        if (process.env.NODE_ENV === "development") {
          console.debug("[TradeStore] Fetched trades from localStorage");
        }
        set({
          trades,
          lastFetch: now,
          currentUserId: userId,
        });
        return;
      }

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;
      set({
        trades: (data || []).map(addPnLToTrade),
        lastFetch: now,
        currentUserId: userId,
      });
    } catch (error) {
      console.error("[TradeStore] Failed to fetch trades:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch trades",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  importTrades: async (trades: Partial<Trade>[]) => {
    set({ isLoading: true, error: null });
    try {
      if (!config.isProduction) {
        const completeTrades = trades.map((trade) => ({
          ...trade,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) as Trade[];

        console.log("Importing trades:", completeTrades);

        // Get current trades and filter out any duplicates by orderId if it exists
        const currentTrades = getStoredTrades();
        const newTrades = completeTrades.filter(
          (newTrade) =>
            !currentTrades.some(
              (existingTrade) =>
                (newTrade as any).orderId &&
                existingTrade.notes?.includes((newTrade as any).orderId)
            )
        );

        // Add PnL to new trades
        const tradesWithPnL = newTrades.map(addPnLToTrade);

        // Add new trades at the beginning of the array
        const updatedTrades = [...tradesWithPnL, ...currentTrades];
        setStoredTrades(updatedTrades);

        // Update the store's state with the complete updated trades list
        // Filter by the current user's ID
        const userTrades = updatedTrades.filter(
          (t) => t.user_id === trades[0]?.user_id
        );
        set({ trades: userTrades });
        console.log("Updated store state with user trades:", userTrades);
        return;
      }

      const { error } = await supabase.from("trades").insert(trades);
      if (error) throw error;
      set((state) => ({
        trades: [...(trades as Trade[]).map(addPnLToTrade), ...state.trades],
      }));
    } catch (error) {
      console.error("Failed to import trades:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to import trades",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addTrade: async (trade) => {
    set({ isLoading: true, error: null });
    try {
      if (!config.isProduction) {
        const newTrade = {
          ...trade,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Trade;

        const tradeWithPnL = addPnLToTrade(newTrade);
        const currentTrades = getStoredTrades();
        const updatedTrades = [tradeWithPnL, ...currentTrades];
        setStoredTrades(updatedTrades);
        set((state) => ({ trades: [tradeWithPnL, ...state.trades] }));
        return;
      }

      const { data, error } = await supabase
        .from("trades")
        .insert([trade])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ trades: [addPnLToTrade(data), ...state.trades] }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add trade",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTrade: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      if (!config.isProduction) {
        const currentTrades = getStoredTrades();
        const updatedTrades = currentTrades.map((t) =>
          t.id === id
            ? addPnLToTrade({
                ...t,
                ...updates,
                updated_at: new Date().toISOString(),
              })
            : t
        );
        setStoredTrades(updatedTrades);
        set((state) => ({
          trades: state.trades.map((t) =>
            t.id === id
              ? addPnLToTrade({
                  ...t,
                  ...updates,
                  updated_at: new Date().toISOString(),
                })
              : t
          ),
        }));
        return;
      }

      const { data, error } = await supabase
        .from("trades")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        trades: state.trades.map((t) =>
          t.id === id ? addPnLToTrade(data) : t
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update trade",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTrade: async (id) => {
    set({ isLoading: true, error: null });
    try {
      if (!config.isProduction) {
        const currentTrades = getStoredTrades();
        const updatedTrades = currentTrades.filter((t) => t.id !== id);
        setStoredTrades(updatedTrades);
        set((state) => ({
          trades: state.trades.filter((t) => t.id !== id),
        }));
        return;
      }

      const { error } = await supabase.from("trades").delete().eq("id", id);
      if (error) throw error;
      set((state) => ({
        trades: state.trades.filter((t) => t.id !== id),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete trade",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Export a hook for components that need trades data
export function useTradesData(userId: string) {
  const { trades, isLoading, error, fetchTrades } = useTradeStore();

  React.useEffect(() => {
    fetchTrades(userId);
  }, [userId, fetchTrades]);

  return { trades, isLoading, error };
}
