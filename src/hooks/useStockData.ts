import { useState, useEffect, useCallback } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import type { StockData, StockQuote } from "@/types/stock";

export interface StockDataState {
  data: StockData[];
  quotes: StockQuote[];
  loading: boolean;
  error: Error | null;
}

export function useStockData(symbols: string[]) {
  const [state, setState] = useState<StockDataState>({
    data: [],
    quotes: [],
    loading: true,
    error: null,
  });

  const fetchStockData = useCallback(async () => {
    if (!symbols.length) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("stock_data")
        .select("*")
        .in("symbol", symbols);

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        data: data as StockData[],
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  }, [symbols]);

  const fetchQuotes = useCallback(async () => {
    if (!symbols.length) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("stock_quotes")
        .select("*")
        .in("symbol", symbols);

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        quotes: data as StockQuote[],
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  }, [symbols]);

  useEffect(() => {
    fetchStockData();
    fetchQuotes();
  }, [symbols, fetchStockData, fetchQuotes]);

  return {
    data: state.data,
    quotes: state.quotes,
    loading: state.loading,
    error: state.error,
    refetchData: fetchStockData,
    refetchQuotes: fetchQuotes,
  };
}
