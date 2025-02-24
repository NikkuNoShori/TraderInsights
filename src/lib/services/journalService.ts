import { supabase } from "../supabase";
import { calculateTransactionStatus } from "../../utils/transactions";
import type { Transaction } from "../../types/database";

export const journalService = {
  getTransactions: async (userId: string) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }

    return data;
  },

  getTransaction: async (id: string) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching transaction:", error);
      return { data: null, error };
    }

    return { data, error };
  },

  createTransaction: async (
    userId: string,
    transaction: Omit<
      Transaction,
      | "id"
      | "user_id"
      | "created_at"
      | "updated_at"
      | "status"
      | "remaining_quantity"
    >,
  ) => {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        ...transaction,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }

    return data;
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }

    return data;
  },

  deleteTransaction: async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  },
};
