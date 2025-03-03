import type { Trade } from "@/types/trade";
import { formatCurrency } from "@/lib/utils/formatters";

interface ActiveTradesCardProps {
  trades: Trade[];
}

export function ActiveTradesCard({ trades }: ActiveTradesCardProps) {
  const activeTrades = trades.filter(trade => !trade.closed_at);

  return (
    <div className="bg-card dark:bg-dark-paper p-4 rounded-lg border border-border dark:border-dark-border">
      <h3 className="text-lg font-medium mb-3">Active Trades</h3>
      <div className="space-y-4">
        {activeTrades.length === 0 ? (
          <p className="text-muted-foreground">No active trades</p>
        ) : (
          <div className="space-y-3">
            {activeTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{trade.symbol}</p>
                  <p className="text-sm text-muted-foreground">
                    {trade.side} • {trade.quantity} {trade.type === "stock" ? "shares" : "contracts"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={trade.unrealized_pnl >= 0 ? "text-green-500" : "text-red-500"}>
                    {formatCurrency(trade.unrealized_pnl)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Entry: {formatCurrency(trade.entry_price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 