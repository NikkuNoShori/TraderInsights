import { useMemo } from "@/lib/react";
import type { Trade, BaseTrade } from "@/types/trade";
import type { Trade as PortfolioTrade } from "@/types/portfolio";

export interface NormalizedTrade {
  entry_date: string;
  pnl: number;
}

export interface TradeStats {
  totalPnL: number;
  winCount: number;
  lossCount: number;
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
}

export function useTradeCalculations(trades: (Trade | PortfolioTrade)[]) {
  // Normalize trades to have consistent properties
  const normalizedTrades = useMemo(() => {
    return trades
      .filter((trade) => {
        const date = new Date(
          "entry_date" in trade ? trade.entry_date : trade.date,
        );
        return !isNaN(date.getTime());
      })
      .map((trade) => {
        if ("entry_date" in trade) {
          return {
            entry_date: trade.entry_date,
            pnl: trade.pnl || 0,
          };
        }
        return {
          entry_date: trade.date,
          pnl:
            trade.type === "sell"
              ? trade.price * trade.shares
              : -(trade.price * trade.shares),
        };
      })
      .sort(
        (a, b) =>
          new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime(),
      );
  }, [trades]);

  const stats = useMemo(() => {
    if (!normalizedTrades.length) {
      return {
        totalPnL: 0,
        winCount: 0,
        lossCount: 0,
        totalTrades: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        profitFactor: 0,
      };
    }

    const winningTrades = normalizedTrades.filter((t) => t.pnl > 0);
    const losingTrades = normalizedTrades.filter((t) => t.pnl < 0);

    const totalPnL = normalizedTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winCount = winningTrades.length;
    const lossCount = losingTrades.length;
    const totalTrades = normalizedTrades.length;

    const winRate = totalTrades > 0 ? winCount / totalTrades : 0;

    const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalLosses = Math.abs(
      losingTrades.reduce((sum, t) => sum + t.pnl, 0),
    );

    const avgWin = winCount > 0 ? totalWins / winCount : 0;
    const avgLoss = lossCount > 0 ? totalLosses / lossCount : 0;

    const largestWin =
      winCount > 0 ? Math.max(...winningTrades.map((t) => t.pnl)) : 0;
    const largestLoss =
      lossCount > 0 ? Math.abs(Math.min(...losingTrades.map((t) => t.pnl))) : 0;

    const profitFactor =
      totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    return {
      totalPnL,
      winCount,
      lossCount,
      totalTrades,
      winRate,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      profitFactor,
    };
  }, [normalizedTrades]);

  return {
    normalizedTrades,
    stats,
  };
}
