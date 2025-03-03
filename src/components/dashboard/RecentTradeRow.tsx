import { formatCurrency } from "@/utils/formatters";
import type { Trade, TradeSide } from "@/types/trade";
import { cn } from "@/utils/cn";

interface RecentTradeRowProps {
  trade: Trade;
}

export function RecentTradeRow({ trade }: RecentTradeRowProps) {
  const getSideStyles = (side: TradeSide) => {
    return side === "Long"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
      : "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300";
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 dark:hover:bg-dark-muted/20 rounded-lg">
      <div className="flex items-center space-x-3">
        <span
          className={cn(
            "px-2 py-0.5 text-xs rounded",
            getSideStyles(trade.side),
          )}
        >
          {trade.side}
        </span>
        <span className="font-medium">{trade.symbol}</span>
      </div>

      <div className="flex items-center space-x-6">
        <span className="text-sm">
          <span className="text-muted-foreground">Qty:</span> {trade.quantity}
        </span>
        <span className="text-sm">
          <span className="text-muted-foreground">@</span>{" "}
          {formatCurrency(trade.price)}
        </span>
        {trade.pnl !== undefined && (
          <span
            className={cn(
              "text-sm font-medium",
              trade.pnl >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {formatCurrency(trade.pnl)}
          </span>
        )}
      </div>
    </div>
  );
}
