import { useMemo } from "@/lib/react";
import type { Trade } from "@/types/trade";

interface TradeMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  averageHoldingTime: number;
}

export function useTradeMetrics(trades: Trade[] = []): TradeMetrics {
  return useMemo(() => {
    if (!trades || !Array.isArray(trades)) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        averageHoldingTime: 0,
      };
    }

    const completedTrades = trades.filter(
      (trade) => trade.status === "closed" && trade.pnl !== null
    );
    const winningTrades = completedTrades.filter((t) => (t.pnl || 0) > 0);
    const losingTrades = completedTrades.filter((t) => (t.pnl || 0) <= 0);

    const totalPnL = completedTrades.reduce(
      (sum, trade) => sum + (trade.pnl || 0),
      0
    );
    const gains = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const losses = Math.abs(
      losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    );

    const averageWin = winningTrades.length ? gains / winningTrades.length : 0;
    const averageLoss = losingTrades.length ? losses / losingTrades.length : 0;

    const largestWin = winningTrades.reduce(
      (max, t) => Math.max(max, t.pnl || 0),
      0
    );
    const largestLoss = losingTrades.reduce(
      (min, t) => Math.min(min, t.pnl || 0),
      0
    );

    // Calculate average holding time
    const holdingTimes = completedTrades.map((trade) => {
      const entryDate = new Date(trade.date + " " + trade.time);
      const exitDate = new Date(trade.updated_at);
      return exitDate.getTime() - entryDate.getTime();
    });

    const averageHoldingTime = holdingTimes.length
      ? holdingTimes.reduce((sum, time) => sum + time, 0) / holdingTimes.length
      : 0;

    return {
      totalTrades: completedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: completedTrades.length
        ? winningTrades.length / completedTrades.length
        : 0,
      totalPnL,
      profitFactor: losses === 0 ? gains : gains / losses,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
      averageHoldingTime,
    };
  }, [trades]);
}
