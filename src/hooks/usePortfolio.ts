import { useState, useEffect, useCallback } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import type { Portfolio, Trade } from "@/types/portfolio";

export interface PortfolioState {
  portfolios: Portfolio[];
  trades: Trade[];
  loading: boolean;
  error: Error | null;
}

export function usePortfolio(userId: string) {
  const [state, setState] = useState<PortfolioState>({
    portfolios: [],
    trades: [],
    loading: true,
    error: null,
  });

  const fetchPortfolios = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        portfolios: data as Portfolio[],
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  }, [userId]);

  const fetchTrades = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        trades: data as Trade[],
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  }, [userId]);

  const createPortfolio = async (
    portfolio: Omit<Portfolio, "id" | "user_id">
  ) => {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .insert([{ ...portfolio, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        portfolios: [...prev.portfolios, data as Portfolio],
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  };

  const addTrade = async (trade: Omit<Trade, "id" | "user_id">) => {
    try {
      const { data, error } = await supabase
        .from("trades")
        .insert([{ ...trade, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        trades: [...prev.trades, data as Trade],
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPortfolios();
      fetchTrades();
    }
  }, [userId, fetchPortfolios, fetchTrades]);

  return {
    portfolios: state.portfolios,
    trades: state.trades,
    loading: state.loading,
    error: state.error,
    createPortfolio,
    addTrade,
  };
}
