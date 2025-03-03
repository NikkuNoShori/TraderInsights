import { useState, useEffect, useCallback } from "@/lib/react";
import { useSupabaseStore } from "@/stores/supabaseStore";
import type { WatchlistSymbol } from "@/types/stock";

export function useWatchlist() {
  const { client: supabase } = useSupabaseStore();
  const [items, setItems] = useState<WatchlistSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data as WatchlistSymbol[]) || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch watchlist",
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addSymbol = async (symbol: string, userId: string) => {
    const { error } = await supabase.from("watchlist").insert([
      {
        symbol,
        user_id: userId,
        name: symbol,
        price: 0,
        change: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
    return { error };
  };

  const removeSymbol = async (symbol: string, userId: string) => {
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .match({ symbol, user_id: userId });
    return { error };
  };

  const getWatchlist = async (userId: string) => {
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId);
    return { data: data as WatchlistSymbol[], error };
  };

  return {
    items,
    isLoading,
    error,
    addSymbol,
    removeSymbol,
    getWatchlist,
    refresh: fetchWatchlist,
  };
}
