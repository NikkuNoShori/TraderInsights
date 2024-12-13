import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useToast } from './useToast';

export interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  initial_balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export function usePortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const toast = useToast();

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      toast.error('Error fetching portfolios');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async (portfolio: Omit<Portfolio, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert([portfolio])
        .select()
        .single();

      if (error) throw error;
      setPortfolios(prev => [data, ...prev]);
      toast.success('Portfolio created successfully');
      return data;
    } catch (error) {
      toast.error('Error creating portfolio');
      console.error('Error:', error);
      return null;
    }
  };

  const updatePortfolio = async (id: string, updates: Partial<Portfolio>) => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPortfolios(prev => prev.map(p => p.id === id ? data : p));
      toast.success('Portfolio updated successfully');
      return data;
    } catch (error) {
      toast.error('Error updating portfolio');
      console.error('Error:', error);
      return null;
    }
  };

  const deletePortfolio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPortfolios(prev => prev.filter(p => p.id !== id));
      toast.success('Portfolio deleted successfully');
    } catch (error) {
      toast.error('Error deleting portfolio');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return {
    portfolios,
    loading,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    refreshPortfolios: fetchPortfolios
  };
} 