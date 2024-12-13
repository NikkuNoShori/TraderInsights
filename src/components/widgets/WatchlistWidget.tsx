import React, { useState } from 'react';
import { WidgetContainer } from './WidgetContainer';
import type { Watchlist, WatchlistColumn } from '../../types/stock';
import { Settings, Plus } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

interface WatchlistWidgetProps {
  watchlist: Watchlist;
  onClose: () => void;
  isMinimized: boolean;
  onMinimize: () => void;
  onAddStock: (symbol: string) => void;
  onRemoveStock: (id: string) => void;
  onUpdateColumns: (columns: WatchlistColumn[]) => void;
}

export function WatchlistWidget({
  watchlist,
  onClose,
  isMinimized,
  onMinimize,
  onAddStock,
  onRemoveStock,
  onUpdateColumns
}: WatchlistWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol) {
      onAddStock(newSymbol.toUpperCase());
      setNewSymbol('');
    }
  };

  const formatValue = (key: keyof WatchlistColumn['key'], value: any) => {
    switch (key) {
      case 'currentPrice':
      case 'marketCap':
        return formatCurrency(value);
      case 'volume':
      case 'avgVolume3Month':
      case 'float':
        return formatNumber(value);
      case 'changePercent':
        return formatPercent(value);
      default:
        return value;
    }
  };

  return (
    <WidgetContainer
      title={watchlist.name}
      isMinimized={isMinimized}
      onMinimize={onMinimize}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <form onSubmit={handleAddStock} className="flex space-x-2">
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="Add symbol..."
              className="px-3 py-1 border rounded-md text-sm"
            />
            <button
              type="submit"
              className="p-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
            >
              <Plus className="h-5 w-5" />
            </button>
          </form>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-md"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {showSettings && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">Visible Columns</h4>
            <div className="grid grid-cols-3 gap-2">
              {watchlist.columns.map((column) => (
                <label key={column.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => {
                      onUpdateColumns(
                        watchlist.columns.map((c) =>
                          c.id === column.id ? { ...c, visible: !c.visible } : c
                        )
                      );
                    }}
                  />
                  <span className="text-sm">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {watchlist.columns
                  .filter((column) => column.visible)
                  .map((column) => (
                    <th
                      key={column.id}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {watchlist.stocks.map((stock) => (
                <tr key={stock.id}>
                  {watchlist.columns
                    .filter((column) => column.visible)
                    .map((column) => (
                      <td
                        key={column.id}
                        className="px-3 py-2 text-sm whitespace-nowrap"
                      >
                        {formatValue(column.key, stock[column.key])}
                      </td>
                    ))}
                  <td>
                    <button
                      onClick={() => onRemoveStock(stock.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WidgetContainer>
  );
}