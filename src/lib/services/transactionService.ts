import { supabase } from "@/lib/supabase";
import type { Transaction } from "@/types/database";

export const transactionService = {
  getTransactions: async (userId: string) => {
    return await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  },

  saveTransaction: async (
    userId: string,
    transaction: Omit<Transaction, "id" | "user_id" | "created_at">,
  ) => {
    return await supabase
      .from("transactions")
      .insert({
        ...transaction,
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    return await supabase.from("transactions").update(updates).eq("id", id);
  },

  deleteTransaction: async (id: string) => {
    return await supabase.from("transactions").delete().eq("id", id);
  },
};
