import React from 'react';
import { Portfolio } from '../../hooks/usePortfolios';

interface PortfolioFormProps {
  portfolio?: Portfolio | null;
  onSubmit: (data: Omit<Portfolio, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

export const PortfolioForm: React.FC<PortfolioFormProps> = ({ portfolio, onSubmit, onClose }) => {
  const [formData, setFormData] = React.useState({
    name: portfolio?.name || '',
    description: portfolio?.description || '',
    initial_balance: portfolio?.initial_balance || 0,
    currency: portfolio?.currency || 'USD'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-light-paper dark:bg-dark-paper rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
          {portfolio ? 'Edit Portfolio' : 'Create Portfolio'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 rounded border border-light-border dark:border-dark-border bg-white dark:bg-dark-paper text-light-text dark:text-dark-text"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 rounded border border-light-border dark:border-dark-border bg-white dark:bg-dark-paper text-light-text dark:text-dark-text"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              Initial Balance
            </label>
            <input
              type="number"
              value={formData.initial_balance}
              onChange={(e) => setFormData(prev => ({ ...prev, initial_balance: parseFloat(e.target.value) }))}
              className="w-full p-2 rounded border border-light-border dark:border-dark-border bg-white dark:bg-dark-paper text-light-text dark:text-dark-text"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full p-2 rounded border border-light-border dark:border-dark-border bg-white dark:bg-dark-paper text-light-text dark:text-dark-text"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              {/* Add more currencies as needed */}
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-light-text dark:text-dark-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded-lg"
            >
              {portfolio ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 