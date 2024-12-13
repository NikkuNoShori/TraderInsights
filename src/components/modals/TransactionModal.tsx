import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = useSupabase();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{ symbol: symbol.toUpperCase(), amount: Number(amount) }]);

      if (error) throw error;
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-dark-muted"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted">
              Symbol
            </label>
            <input
              type="text"
              required
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="input mt-1"
              placeholder="AAPL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted">
              Amount
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input mt-1"
              placeholder="100.00"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}