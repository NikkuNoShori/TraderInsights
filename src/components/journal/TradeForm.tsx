import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';
import type { Trade } from '../../types/trade';
import { useQueryClient } from '@tanstack/react-query';

interface TradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TradeType = 'stock' | 'option';

export const TradeForm: React.FC<TradeFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    symbol: '',
    type: 'stock' as TradeType,
    side: 'Long' as const,
    quantity: '',
    price: '',
    notes: '',
    option_details: null as null | {
      strike: string;
      expiration: string;
      contract_type: 'call' | 'put';
    }
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const tradeData = {
        symbol: formData.symbol.toUpperCase(),
        type: formData.type,
        side: formData.side,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        notes: formData.notes || null,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        option_details: formData.type === 'option' ? {
          ...formData.option_details!,
          strike: Number(formData.option_details?.strike)
        } : null
      };

      const { error: submitError } = await supabase
        .from('trades')
        .insert([tradeData]);

      if (submitError) throw submitError;

      queryClient.invalidateQueries({ queryKey: ['trades'] });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add trade');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-paper rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Trade
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 
                     transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 
                         rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Symbol
            </label>
            <input
              type="text"
              required
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                       shadow-sm focus:border-primary-500 focus:ring-primary-500 
                       dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TradeType }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                       shadow-sm focus:border-primary-500 focus:ring-primary-500 
                       dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="stock">Stock</option>
              <option value="option">Option</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shares
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                         shadow-sm focus:border-primary-500 focus:ring-primary-500 
                         dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                         shadow-sm focus:border-primary-500 focus:ring-primary-500 
                         dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                       shadow-sm focus:border-primary-500 focus:ring-primary-500 
                       dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                       hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md 
                       border border-gray-300 dark:border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-primary-500 dark:focus:ring-offset-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 
                       hover:bg-primary-600 rounded-md border border-transparent 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-primary-500 dark:focus:ring-offset-gray-900
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 