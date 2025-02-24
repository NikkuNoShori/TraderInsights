import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Trade } from "@/types/trade";

export function useTrade(id?: string) {
  return useQuery({
    queryKey: ["trade", id],
    queryFn: async () => {
      if (!id) throw new Error("Trade ID is required");

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Trade;
    },
    enabled: !!id,
  });
}
