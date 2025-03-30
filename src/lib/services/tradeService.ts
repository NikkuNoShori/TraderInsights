import { supabase } from "@/lib/supabase";
import type { Trade } from "@/types/trade";

export class TradeService {
  async getTrades(userId: string): Promise<Trade[]> {
    try {
      console.log("Fetching trades for user:", userId);
      const { data, error, status } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      console.log("Response:", { data, error, status });

      if (error) {
        console.error("Error fetching trades:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getTrades:", error);
      throw error;
    }
  }

  async createTrade(trade: Omit<Trade, "id">): Promise<Trade> {
    try {
      const { data, error } = await supabase
        .from("trades")
        .insert([trade])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating trade:", error);
      throw error;
    }
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade> {
    try {
      const { data, error } = await supabase
        .from("trades")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating trade:", error);
      throw error;
    }
  }

  async deleteTrade(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("trades").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting trade:", error);
      throw error;
    }
  }
}

export const tradeService = new TradeService();
