import { supabase } from '../supabase';
import { calculateTransactionStatus } from '../../utils/transactions';
import type { Transaction } from '../../types/database';

export const journalService = {
  getTransactions: async (userId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    // Calculate averages and totals
    return data.map(transaction => {
      const entryOrders = (transaction.orders || []).filter(o => 
        (transaction.side === 'Long' && o.action === 'buy') ||
        (transaction.side === 'Short' && o.action === 'sell')
      );
      
      const exitOrders = (transaction.orders || []).filter(o => 
        (transaction.side === 'Long' && o.action === 'sell') ||
        (transaction.side === 'Short' && o.action === 'buy')
      );

      const totalEntryQuantity = entryOrders.reduce((sum, o) => sum + o.quantity, 0);
      const totalExitQuantity = exitOrders.reduce((sum, o) => sum + o.quantity, 0);

      const avgEntryPrice = entryOrders.length > 0
        ? entryOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0) / totalEntryQuantity
        : 0;

      const avgExitPrice = exitOrders.length > 0
        ? exitOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0) / totalExitQuantity
        : 0;

      return {
        ...transaction,
        avgEntryPrice,
        avgExitPrice,
        status: totalExitQuantity >= transaction.quantity ? 'closed' : 'open',
        remainingQuantity: Math.max(transaction.quantity - totalExitQuantity, 0)
      };
    });
  },

  getTransaction: async (id: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching transaction:', error);
      return { data: null, error };
    }

    return { data, error };
  },

  createTransaction: async (userId: string, transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    return data;
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    return data;
  },

  deleteTransaction: async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
};