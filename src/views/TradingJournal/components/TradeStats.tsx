import { Trade } from "@/types/trade";
import { formatTradeValue, formatPercent } from "@/utils/trade";

interface TradeStats {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
}

interface TradeStatsProps {
  stats: TradeStats;
}

export function TradeStats({ stats }: TradeStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card dark:bg-dark-card rounded-lg p-4 border border-border dark:border-dark-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Total P&L
        </h3>
        <div className="flex items-baseline">
          <span
            className={`text-2xl font-bold ${stats.totalPnL >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {stats.totalPnL >= 0 ? "+" : ""}
            {formatTradeValue(stats.totalPnL)}
          </span>
          {stats.totalPnL !== 0 && (
            <span
              className={`ml-2 text-sm ${stats.totalPnL >= 0 ? "text-green-600/70 dark:text-green-400/70" : "text-red-600/70 dark:text-red-400/70"}`}
            >
              {formatTradeValue(Math.abs(stats.totalPnL))}
            </span>
          )}
        </div>
      </div>

      <div className="bg-card dark:bg-dark-card rounded-lg p-4 border border-border dark:border-dark-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Win Rate
        </h3>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold">
            {formatPercent(stats.winRate)}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">
            {stats.totalTrades} trades
          </span>
        </div>
      </div>

      <div className="bg-card dark:bg-dark-card rounded-lg p-4 border border-border dark:border-dark-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Profit Factor
        </h3>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold">
            {stats.profitFactor.toFixed(2)}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">
            Avg Win: {formatTradeValue(stats.averageWin)}
          </span>
        </div>
      </div>
    </div>
  );
}
