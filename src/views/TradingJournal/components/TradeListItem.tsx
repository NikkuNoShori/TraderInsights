import React from 'react';
import { format } from 'date-fns';
import { Trade } from '../../../types/trade';
import { Button } from '../../../components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface TradeListItemProps {
  trade: Trade;
  onDelete: () => Promise<void>;
}

export function TradeListItem({ trade, onDelete }: TradeListItemProps) {
  const formattedDate = format(new Date(trade.date + ' ' + trade.time), 'MMM dd, yyyy HH:mm');
  
  const getPnLColor = (pnl: number | null | undefined) => {
    if (!pnl) return 'text-muted-foreground';
    return pnl > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {formattedDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {trade.symbol}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {trade.type === 'option' ? (
          <div>
            <span className="font-medium">{trade.option_details?.contract_type.toUpperCase()}</span>
            <span className="text-muted-foreground ml-1">
              ${trade.option_details?.strike} {format(new Date(trade.option_details?.expiration || ''), 'MM/dd')}
            </span>
          </div>
        ) : (
          'Stock'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={trade.side === 'Long' ? 'text-green-600' : 'text-red-600'}>
          {trade.side}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {trade.quantity}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {formatCurrency(trade.entry_price || 0)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {trade.exit_price ? formatCurrency(trade.exit_price) : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <span className={getPnLColor(trade.pnl)}>
          {trade.pnl ? formatCurrency(trade.pnl) : '-'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <StatusBadge status={trade.status as 'open' | 'closed' | 'pending'} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </td>
    </tr>
  );
} 