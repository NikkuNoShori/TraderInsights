import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { LoadingButton } from '../LoadingButton';

interface AddSymbolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string) => Promise<void>;
}

export function AddSymbolModal({ isOpen, onClose, onAdd }: AddSymbolModalProps) {
  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setIsLoading(true);
    try {
      await onAdd(symbol.toUpperCase());
      setSymbol('');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative bg-white rounded-lg max-w-md w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Add Symbol to Watchlist
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL)"
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <LoadingButton
                type="submit"
                isLoading={isLoading}
                disabled={!symbol.trim()}
              >
                Add Symbol
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}