import React from 'react';
import { X, ArrowUpDown, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '@/providers/ThemeProvider';
import { DraggableHeader } from './DraggableHeader';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import type { WatchlistColumn } from '../../types/watchlist';
import type { StockQuote } from '../../types/stock';

interface WatchlistTableProps {
  quotes: StockQuote[];
  columns: WatchlistColumn[];
  onRemoveSymbol: (symbol: string) => void;
  isLoading: boolean;
}

export function WatchlistTable({ quotes, columns, onRemoveSymbol, isLoading }: WatchlistTableProps) {
  const { getThemeClass } = useTheme();

  const formatValue = (quote: StockQuote, columnId: string) => {
    const value = quote[columnId as keyof StockQuote];
    
    if (value === undefined || value === null) return '-';

    if (typeof value === 'number') {
      if (columnId.toLowerCase().includes('price') || 
          columnId.toLowerCase().includes('market') ||
          columnId === 'bid' || 
          columnId === 'ask') {
        return formatCurrency(value);
      }
      if (columnId.toLowerCase().includes('percent') ||
          columnId.toLowerCase().includes('yield')) {
        return formatPercent(value);
      }
      if (columnId.toLowerCase().includes('volume') ||
          columnId === 'float' ||
          columnId === 'sharesOutstanding') {
        return formatNumber(value);
      }
      return value.toLocaleString();
    }

    return value;
  };

  return (
    <div className={clsx(
      "overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg",
      getThemeClass('surface')
    )}>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            {columns.filter(col => col.visible).map((column, index) => (
              <DraggableHeader
                key={column.id}
                column={column}
                index={index}
              />
            ))}
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isLoading && quotes.length === 0 ? (
            <tr>
              <td
                colSpan={columns.filter(col => col.visible).length + 1}
                className="px-6 py-4 text-center"
              >
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
              </td>
            </tr>
          ) : quotes.length === 0 ? (
            <tr>
              <td
                colSpan={columns.filter(col => col.visible).length + 1}
                className="px-6 py-4 text-center text-gray-500"
              >
                No symbols added to watchlist
              </td>
            </tr>
          ) : (
            quotes.map((quote) => (
              <tr
                key={quote.symbol}
                className={clsx(
                  "hover:bg-gray-50",
                  getThemeClass('surface')
                )}
              >
                {columns.filter(col => col.visible).map(column => (
                  <td
                    key={column.id}
                    className={clsx(
                      "px-6 py-4 text-sm whitespace-nowrap",
                      column.id === 'symbol' ? "font-medium" : "text-gray-500",
                      column.id.includes('change') && {
                        'text-green-600': Number(quote[column.id as keyof StockQuote]) > 0,
                        'text-red-600': Number(quote[column.id as keyof StockQuote]) < 0
                      }
                    )}
                  >
                    {formatValue(quote, column.id)}
                  </td>
                ))}
                <td className="px-6 py-4 text-sm text-right">
                  <button
                    onClick={() => onRemoveSymbol(quote.symbol)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
