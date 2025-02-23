import { format } from 'date-fns';
import { ArrowUpDown, Filter, Search } from 'lucide-react';
import type { Trade } from '../../types/portfolio';

interface TradeHistoryProps {
  trades: Trade[];
  onDelete?: (id: string) => void;
}

type SortField = 'date' | 'symbol' | 'type' | 'price' | 'shares' | 'value';
type SortOrder = 'asc' | 'desc';

export function TradeHistory({ trades, onDelete }: TradeHistoryProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'sell'>('all');

  const filteredTrades = trades
    .filter(trade => {
      const matchesSearch = trade.symbol.toLowerCase().includes(search.toLowerCase()) ||
        trade.notes?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || trade.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'date':
          return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order;
        case 'symbol':
          return a.symbol.localeCompare(b.symbol) * order;
        case 'price':
          return (a.price - b.price) * order;
        case 'shares':
          return (a.shares - b.shares) * order;
        case 'value':
          return (a.price * a.shares - b.price * b.shares) * order;
        default:
          return 0;
      }
    });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trades..."
            className="input pl-10"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'buy' | 'sell')}
            className="input"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy Orders</option>
            <option value="sell">Sell Orders</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
          <thead className="bg-gray-50 dark:bg-dark-paper">
            <tr>
              {[
                { field: 'date', label: 'Date' },
                { field: 'symbol', label: 'Symbol' },
                { field: 'type', label: 'Type' },
                { field: 'price', label: 'Price' },
                { field: 'shares', label: 'Shares' },
                { field: 'value', label: 'Value' },
              ].map(({ field, label }) => (
                <th
                  key={field}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-dark-text"
                  onClick={() => handleSort(field as SortField)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
              ))}
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-paper divide-y divide-gray-200 dark:divide-dark-border">
            {filteredTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-dark-border/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                  {format(new Date(trade.date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">
                  {trade.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    trade.type === 'buy' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                  }`}>
                    {trade.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                  ${trade.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                  {trade.shares}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                  ${(trade.price * trade.shares).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {onDelete && (
                    <button
                      onClick={() => onDelete(trade.id)}
                      className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 