import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Trade } from "@/types/trade";
import { config } from "@/config";
import { calculatePnL } from "@/utils/trade";

interface TradeState {
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
}

interface TradeActions {
  fetchTrades: (userId: string) => Promise<void>;
  importTrades: (trades: Partial<Trade>[]) => Promise<void>;
  addTrade: (trade: Omit<Trade, "id" | "user_id">) => Promise<void>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
}

const STORAGE_KEY = "trader_insights_trades";

// Helper function to generate a unique ID
const generateId = () =>
  `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper functions for localStorage
const getStoredTrades = (): Trade[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get trades from localStorage:", error);
    return [];
  }
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

  fetchTrades: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!config.isProduction) {
        const trades = getStoredTrades()
          .filter((t) => t.user_id === userId)
          .map(addPnLToTrade);
        console.log("Fetched trades from localStorage:", trades);
        set({ trades });
        return;
      }

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;
      set({ trades: (data || []).map(addPnLToTrade) });
    } catch (error) {
      console.error("Failed to fetch trades:", error);
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
