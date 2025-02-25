import { supabase } from "@/lib/supabase";
import type { Trade } from "@/types/trade";

export class JournalService {
  async getTrades(userId: string): Promise<Trade[]> {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addTrade(trade: Partial<Trade>): Promise<Trade> {
    const { data, error } = await supabase
      .from("trades")
      .insert([trade])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade> {
    const { data, error } = await supabase
      .from("trades")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTrade(id: string): Promise<void> {
    const { error } = await supabase.from("trades").delete().eq("id", id);
    if (error) throw error;
  }
}
