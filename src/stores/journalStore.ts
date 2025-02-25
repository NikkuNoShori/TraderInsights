import { create } from "zustand";
import { JournalService } from "@/lib/services/journalService";
import type { Trade } from "@/types/trade";

interface JournalState {
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
  fetchTrades: (userId: string) => Promise<void>;
  addTrade: (trade: Omit<Trade, "id" | "user_id">) => Promise<void>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
}

const journalService = new JournalService();

export const useJournalStore = create<JournalState>((set) => ({
  trades: [],
  isLoading: false,
  error: null,

  fetchTrades: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const trades = await journalService.getTrades(userId);
      set({ trades });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch trades",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addTrade: async (trade) => {
    set({ isLoading: true, error: null });
    try {
      const newTrade = await journalService.addTrade(trade);
      set((state) => ({ trades: [newTrade, ...state.trades] }));
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
      const updatedTrade = await journalService.updateTrade(id, updates);
      set((state) => ({
        trades: state.trades.map((t) => (t.id === id ? updatedTrade : t)),
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
      await journalService.deleteTrade(id);
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
