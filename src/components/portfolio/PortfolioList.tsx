import React, { useState } from 'react';
import { usePortfolios, Portfolio } from '../../hooks/usePortfolios';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { PortfolioForm } from './PortfolioForm';
import { PlusIcon } from 'lucide-react';

export const PortfolioList = () => {
  const { portfolios, loading, createPortfolio, updatePortfolio, deletePortfolio } = usePortfolios();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);

  if (loading) return <LoadingSpinner />;

  if (!portfolios.length) {
    return (
      <div className="text-center py-12 bg-white dark:bg-dark-paper rounded-lg shadow">
        <div className="text-gray-500 dark:text-dark-muted mb-4">
          No portfolios created yet
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-light-primary dark:bg-dark-primary hover:bg-opacity-90"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Your First Portfolio
        </button>
      </div>
    );
  }

  return (
    <div className="bg-light-paper dark:bg-dark-paper p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
          Your Portfolios
        </h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-light-primary dark:bg-dark-primary text-white px-4 py-2 rounded-lg"
        >
          Add Portfolio
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {portfolios.map(portfolio => (
          <div
            key={portfolio.id}
            className="border border-light-border dark:border-dark-border rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
              {portfolio.name}
            </h3>
            <p className="text-light-muted dark:text-dark-muted mt-2">
              {portfolio.description}
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setEditingPortfolio(portfolio)}
                className="text-light-primary dark:text-dark-primary"
              >
                Edit
              </button>
              <button
                onClick={() => deletePortfolio(portfolio.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isFormOpen || editingPortfolio) && (
        <PortfolioForm
          portfolio={editingPortfolio}
          onSubmit={async (data) => {
            if (editingPortfolio) {
              await updatePortfolio(editingPortfolio.id, data);
            } else {
              await createPortfolio(data);
            }
            setIsFormOpen(false);
            setEditingPortfolio(null);
          }}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPortfolio(null);
          }}
        />
      )}
    </div>
  );
}; 