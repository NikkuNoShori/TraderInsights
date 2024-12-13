import { useState, useCallback } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

interface StockData {
  timestamp: string;
  price: number;
  volume: number;
}

interface StockQuote {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

export function useStockData() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  const fetchData = useCallback(async (symbol: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('stock_data')
        .select('*')
        .eq('symbol', symbol.toUpperCase())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      setStockData(data || []);
      
      // Fetch latest quote
      const { data: quoteData, error: quoteError } = await supabase
        .from('stock_quotes')
        .select('*')
        .eq('symbol', symbol.toUpperCase())
        .single();

      if (quoteError) throw quoteError;
      setStockQuote(quoteData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  return {
    stockData,
    stockQuote,
    isLoading,
    error,
    fetchData
  };
}