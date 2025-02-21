import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "../contexts/SupabaseContext";

interface WatchlistItem {
  id: string;
  symbol: string;
  notes?: string;
  created_at: string;
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  const fetchWatchlist = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch watchlist"
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = async (symbol: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .insert([{ symbol: symbol.toUpperCase(), notes }])
        .select()
        .single();

      if (error) throw error;
      setItems([data, ...items]);
      return data;
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to add to watchlist");
    }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
      const { error } = await supabase.from("watchlist").delete().eq("id", id);

      if (error) throw error;
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to remove from watchlist");
    }
  };

  return {
    items,
    isLoading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    refresh: fetchWatchlist,
  };
}
