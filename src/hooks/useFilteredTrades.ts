import { useMemo } from "react";
import { useTrades } from "./useTrades";
import { useFilterStore } from "@/stores/filterStore";
import type { Trade } from "@/types/trade";
import { filterTrades } from "@/utils/tradeFilters";

function calculateTradePnL(trade: Trade): number {
  // For open trades, use the current market price if available
  if (trade.status === "open") {
    return 0; // For now, return 0 for open trades
  }

  // For closed trades, calculate P&L based on entry and exit prices
  if (!trade.exit_price || !trade.entry_price || !trade.quantity) {
    return 0;
  }

  const rawPnL = (trade.exit_price - trade.entry_price) * trade.quantity;
  // For short positions, we need to invert the P&L
  return trade.side === "Short" ? -rawPnL : rawPnL;
}

interface TradeStats {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  maxDrawdown: number;
}

export function useFilteredTrades() {
  const { data: trades = [], isLoading, error } = useTrades();
  const { filters, activeSection } = useFilterStore();

  const filteredTrades = useMemo(() => {
    // Ensure trades is an array
    if (!Array.isArray(trades)) {
      console.warn("trades is not an array:", trades);
      return [];
    }
    return filterTrades(trades, filters[activeSection] || {});
  }, [trades, filters, activeSection]);

  // Calculate aggregated stats from filtered trades
  const stats = useMemo<TradeStats>(() => {
    // Ensure filteredTrades is an array
    if (!Array.isArray(filteredTrades) || filteredTrades.length === 0) {
      return {
        totalPnL: 0,
        winRate: 0,
        totalTrades: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        maxDrawdown: 0,
      };
    }

    const winningTrades = filteredTrades.filter(
      (trade) => (trade.pnl || 0) > 0
    );
    const losingTrades = filteredTrades.filter((trade) => (trade.pnl || 0) < 0);

    const totalPnL = filteredTrades.reduce(
      (sum, trade) => sum + (trade.pnl || 0),
      0
    );
    const winRate = winningTrades.length / filteredTrades.length;

    const grossProfit = winningTrades.reduce(
      (sum, trade) => sum + (trade.pnl || 0),
      0
    );
    const grossLoss = Math.abs(
      losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
    );
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    const averageWin =
      winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
    const averageLoss =
      losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;

    const largestWin = winningTrades.reduce(
      (max, trade) => Math.max(max, trade.pnl || 0),
      0
    );
    const largestLoss = losingTrades.reduce(
      (min, trade) => Math.min(min, trade.pnl || 0),
      0
    );

    // Calculate max drawdown
    const sortedTrades = [...filteredTrades].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let maxDrawdown = 0;
    let peak = 0;
    let runningPnL = 0;

    sortedTrades.forEach((trade) => {
      runningPnL += trade.pnl || 0;

      if (runningPnL > peak) {
        peak = runningPnL;
      }

      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return {
      totalPnL,
      winRate,
      totalTrades: filteredTrades.length,
      profitFactor,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
      maxDrawdown: maxDrawdown / (peak > 0 ? peak : 1), // Convert to percentage
    };
  }, [filteredTrades]);

  return {
    trades: filteredTrades.map((trade) => ({
      ...trade,
      pnl: calculateTradePnL(trade), // Override the pnl field with our calculated value
    })),
    stats,
    isLoading,
    error,
  };
}
