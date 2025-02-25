import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Trade } from "@/types/trade";

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

export const useTradeStore = create<TradeState & TradeActions>()(
  (set, get) => ({
    trades: [],
    isLoading: false,
    error: null,

    fetchTrades: async (userId: string) => {
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", userId)
          .order("entry_date", { ascending: false });

        if (error) throw error;
        set({ trades: data || [] });
      } catch (error) {
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
        const { data, error } = await supabase
          .from("trades")
          .insert(trades)
          .select();

        if (error) throw error;
        set((state) => ({ trades: [...(data || []), ...state.trades] }));
      } catch (error) {
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
        const { data, error } = await supabase
          .from("trades")
          .insert([trade])
          .select()
          .single();

        if (error) throw error;
        set((state) => ({ trades: [data, ...state.trades] }));
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
        const { data, error } = await supabase
          .from("trades")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        set((state) => ({
          trades: state.trades.map((t) => (t.id === id ? data : t)),
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
  })
);
