import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../contexts/SupabaseContext';
import { Trade } from '../types/trade';

export function useTrades(userId?: string) {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: ['trades', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Trade[];
    },
    enabled: !!userId,
  });
} 