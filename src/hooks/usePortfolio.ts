import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import type { Portfolio, Trade } from '../types/portfolio';

export function usePortfolio(portfolioId?: string) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    fetchPortfolios();
    if (portfolioId) {
      fetchPortfolioTrades(portfolioId);
    }
  }, [portfolioId]);

  const fetchPortfolios = async () => {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPortfolios(data);
      if (portfolioId) {
        setCurrentPortfolio(data.find(p => p.id === portfolioId) || null);
      }
    }
  };

  const fetchPortfolioTrades = async (id: string) => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('portfolio_id', id)
      .order('date', { ascending: false });

    if (!error) {
      setTrades(data || []);
    }
    setIsLoading(false);
  };

  // Add portfolio
  const createPortfolio = async (name: string, description?: string) => {
    const { data, error } = await supabase
      .from('portfolios')
      .insert([{ name, description }])
      .select()
      .single();

    if (!error && data) {
      setPortfolios([data, ...portfolios]);
      return data;
    }
    throw error;
  };

  // Add trade to portfolio
  const addTrade = async (trade: Omit<Trade, 'id'>) => {
    const { data, error } = await supabase
      .from('trades')
      .insert([trade])
      .select()
      .single();

    if (!error && data) {
      setTrades([data, ...trades]);
      return data;
    }
    throw error;
  };

  return {
    portfolios,
    currentPortfolio,
    trades,
    isLoading,
    createPortfolio,
    addTrade,
    refreshTrades: () => portfolioId && fetchPortfolioTrades(portfolioId),
  };
} 