import { useSupabaseStore } from "@/stores/supabaseStore";
import type { Trade } from "../../../types/trade";
import { useQuery } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 10;

interface TradesResponse {
  trades: Trade[];
  totalCount: number;
}

export function useTrades(userId?: string, page: number = 1) {
  const { client: supabase } = useSupabaseStore();

  return useQuery<TradesResponse, Error>({
    queryKey: ["trades", userId, page],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      // First get total count
      const { count, error: countError } = await supabase
        .from("trades")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) throw countError;

      // Then get paginated data
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      return {
        trades: data || [],
        totalCount: count || 0,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
