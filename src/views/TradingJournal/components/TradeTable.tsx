import type { Trade } from "@/types/trade";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface TradeTableProps {
  trades: Trade[];
  onDelete?: (id: string) => void;
}

export function TradeTable({ trades, onDelete }: TradeTableProps) {
  if (!trades.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No trades found. Add your first trade to get started!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Symbol</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Side</th>
            <th className="px-4 py-2 text-right">Quantity</th>
            <th className="px-4 py-2 text-right">Price</th>
            <th className="px-4 py-2 text-right">Total</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="border-b border-border hover:bg-muted/50">
              <td className="px-4 py-2">{formatDate(trade.entry_date)}</td>
              <td className="px-4 py-2 font-medium">{trade.symbol}</td>
              <td className="px-4 py-2">{trade.type}</td>
              <td className="px-4 py-2">{trade.side}</td>
              <td className="px-4 py-2 text-right">{trade.quantity}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(trade.price)}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(trade.total)}</td>
              <td className="px-4 py-2 text-center">
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(trade.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 