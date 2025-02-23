import { formatCurrency } from '../../utils/formatters';
import type { Trade } from '../../types/trade';

interface RecentTradeRowProps {
  trade: Trade;
}

export function RecentTradeRow({ trade }: RecentTradeRowProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 dark:hover:bg-dark-muted/20 rounded-lg">
      <div className="flex items-center space-x-3">
        <span className={`px-2 py-0.5 text-xs rounded ${
          trade.direction === 'long' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          {trade.direction === 'long' ? 'Long' : 'Short'}
        </span>
        <span className="font-medium">{trade.symbol}</span>
      </div>

      <div className="flex items-center space-x-6">
        <span className="text-sm">
          <span className="text-muted-foreground">Qty:</span> {trade.quantity}
        </span>
        <span className="text-sm">
          <span className="text-muted-foreground">@</span> {formatCurrency(trade.entry_price)}
        </span>
        {trade.pnl !== null && (
          <span className={`text-sm font-medium ${
            trade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {formatCurrency(trade.pnl)}
          </span>
        )}
      </div>
    </div>
  );
} 