import React, { useState } from 'react';
import { WidgetContainer } from './WidgetContainer';
import type { ScreenerFilter, StockQuote } from '../../types/stock';
import { Plus, X } from 'lucide-react';

interface ScreenerWidgetProps {
  onClose: () => void;
  isMinimized: boolean;
  onMinimize: () => void;
  onSearch: (filters: ScreenerFilter[]) => void;
}

const FILTER_FIELDS: Array<{ key: keyof StockQuote; label: string; type: 'number' | 'string' | 'date' }> = [
  { key: 'marketCap', label: 'Market Cap', type: 'number' },
  { key: 'volume', label: 'Volume', type: 'number' },
  { key: 'changePercent', label: 'Change %', type: 'number' },
  { key: 'sector', label: 'Sector', type: 'string' },
  { key: 'index', label: 'Index', type: 'string' },
  // Add more fields as needed
];

export function ScreenerWidget({
  onClose,
  isMinimized,
  onMinimize,
  onSearch
}: ScreenerWidgetProps) {
  const [filters, setFilters] = useState<ScreenerFilter[]>([]);

  const addFilter = () => {
    const newFilter: ScreenerFilter = {
      id: crypto.randomUUID(),
      field: 'marketCap',
      operator: 'greaterThan',
      value: '',
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<ScreenerFilter>) => {
    setFilters(
      filters.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  return (
    <WidgetContainer
      title="Stock Screener"
      isMinimized={isMinimized}
      onMinimize={onMinimize}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={addFilter}
            className="flex items-center space-x-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
          >
            <Plus className="h-4 w-4" />
            <span>Add Filter</span>
          </button>
          <button
            onClick={() => onSearch(filters)}
            className="px-4 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Search
          </button>
        </div>

        <div className="space-y-2">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md"
            >
              <select
                value={filter.field}
                onChange={(e) =>
                  updateFilter(filter.id, { field: e.target.value as keyof StockQuote })
                }
                className="px-2 py-1 border rounded-md text-sm"
              >
                {FILTER_FIELDS.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>

              <select
                value={filter.operator}
                onChange={(e) =>
                  updateFilter(filter.id, {
                    operator: e.target.value as ScreenerFilter['operator'],
                  })
                }
                className="px-2 py-1 border rounded-md text-sm"
              >
                <option value="equals">equals</option>
                <option value="greaterThan">greater than</option>
                <option value="lessThan">less than</option>
                <option value="between">between</option>
                <option value="contains">contains</option>
              </select>

              {filter.operator === 'between' ? (
                <>
                  <input
                    type="text"
                    value={(filter.value as [number, number])[0] || ''}
                    onChange={(e) =>
                      updateFilter(filter.id, {
                        value: [Number(e.target.value), (filter.value as [number, number])[1]],
                      })
                    }
                    className="px-2 py-1 border rounded-md text-sm w-24"
                    placeholder="Min"
                  />
                  <input
                    type="text"
                    value={(filter.value as [number, number])[1] || ''}
                    onChange={(e) =>
                      updateFilter(filter.id, {
                        value: [(filter.value as [number, number])[0], Number(e.target.value)],
                      })
                    }
                    className="px-2 py-1 border rounded-md text-sm w-24"
                    placeholder="Max"
                  />
                </>
              ) : (
                <input
                  type="text"
                  value={filter.value as string}
                  onChange={(e) =>
                    updateFilter(filter.id, { value: e.target.value })
                  }
                  className="px-2 py-1 border rounded-md text-sm w-40"
                  placeholder="Value"
                />
              )}

              <button
                onClick={() => removeFilter(filter.id)}
                className="p-1 text-red-500 hover:text-red-700 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </WidgetContainer>
  );
}