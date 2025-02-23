import { X, Loader2 } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/utils/cn';
import type { WatchlistSymbol } from '@/types/stock';

interface WatchlistTableProps {
  symbols: WatchlistSymbol[];
  onRemove: (symbol: string) => void;
  isLoading?: boolean;
}

export function WatchlistTable({ symbols, onRemove, isLoading }: WatchlistTableProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!symbols.length) {
    return (
      <div className="text-center p-4 text-gray-500">
        No symbols in watchlist
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', theme === 'dark' ? 'dark' : '')}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="text-left p-4">Symbol</th>
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4">Price</th>
            <th className="text-left p-4">Change</th>
            <th className="text-right p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map(symbol => (
            <tr key={symbol.symbol} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-4">{symbol.symbol}</td>
              <td className="p-4">{symbol.name}</td>
              <td className="p-4">${symbol.price.toFixed(2)}</td>
              <td className={cn('p-4', symbol.change >= 0 ? 'text-green-500' : 'text-red-500')}>
                {symbol.change >= 0 ? '+' : ''}{symbol.change.toFixed(2)}%
              </td>
              <td className="p-4 text-right">
                <button
                  onClick={() => onRemove(symbol.symbol)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
