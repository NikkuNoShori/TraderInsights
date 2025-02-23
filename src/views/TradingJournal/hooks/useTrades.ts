import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../../../contexts/SupabaseContext";
import type { Trade } from "../../../types/trade";

const ITEMS_PER_PAGE = 10;

interface TradesResponse {
  trades: Trade[];
  totalPages: number;
}

export function useTrades(page: number = 1) {
  const { supabase, user } = useSupabase();

  return useQuery<TradesResponse, Error>({
    queryKey: ["trades", user?.id, page],
    queryFn: async () => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // First get total count
      const { count, error: countError } = await supabase
        .from("trades")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (countError) throw countError;

      // Then get paginated data
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      return {
        trades: (data || []) as Trade[],
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
