import { Trade } from "@/types/trade";
import { formatTradeValue, formatPercent, calculatePnL } from "@/utils/trade";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";

interface TradeStatsProps {
  trades: Trade[];
}

export function TradeStats({ trades }: TradeStatsProps) {
  const filteredTrades = useFilteredTrades(trades);

  // Calculate total P&L
  const totalPnL = filteredTrades.reduce((sum, trade) => {
    const pnl = calculatePnL(trade);
    return sum + (pnl ?? 0);
  }, 0);

  // Calculate win rate from trades with PnL
  const tradesWithPnL = filteredTrades.filter(
    (trade) => calculatePnL(trade) !== undefined,
  );
  const winningTrades = tradesWithPnL.filter((trade) => {
    const pnl = calculatePnL(trade);
    return pnl !== undefined && pnl > 0;
  });
  const winRate =
    tradesWithPnL.length > 0 ? winningTrades.length / tradesWithPnL.length : 0;

  // Get total number of trades
  const totalTrades = filteredTrades.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card rounded-lg p-4 border border-default">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Total P&L
        </h3>
        <div className="flex items-baseline">
          <span
            className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {totalPnL >= 0 ? "+" : ""}
            {formatTradeValue(totalPnL)}
          </span>
          {totalPnL !== 0 && (
            <span
              className={`ml-2 text-sm ${totalPnL >= 0 ? "text-green-600/70 dark:text-green-400/70" : "text-red-600/70 dark:text-red-400/70"}`}
            >
              {formatTradeValue(Math.abs(totalPnL))}
            </span>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-default">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Win Rate
        </h3>
        <div className="flex items-baseline">
          <span
            className={`text-2xl font-bold ${winRate >= 0.5 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {formatPercent(winRate)}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">
            {`${winningTrades.length}/${tradesWithPnL.length} trades`}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-default">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          Total Trades
        </h3>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-foreground">
            {totalTrades}
          </span>
          {tradesWithPnL.length < totalTrades && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({tradesWithPnL.length} with P&L)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
