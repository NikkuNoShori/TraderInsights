import { create } from "zustand";
import { journalService } from "../lib/services/journalService";
import type { Transaction } from "../types/database";

interface JournalState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (userId: string) => Promise<void>;
  addTransaction: (
    userId: string,
    transaction: Omit<Transaction, "id" | "user_id" | "created_at">,
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await journalService.getTransactions(userId);
      set({ transactions });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch transactions",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (
    userId: string,
    transaction: Omit<Transaction, "id" | "user_id" | "created_at">,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await journalService.createTransaction(
        userId,
        transaction,
      );
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to add transaction",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTransaction = await journalService.updateTransaction(
        id,
        updates,
      );
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? updatedTransaction : t,
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update transaction",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await journalService.deleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete transaction",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
