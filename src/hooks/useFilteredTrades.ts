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
  const stats = useMemo(() => {
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
      };
    }

    // Calculate P&L for each trade
    const tradesWithPnL = filteredTrades.map((trade) => ({
      ...trade,
      calculatedPnL: calculateTradePnL(trade),
    }));

    const wins = tradesWithPnL.filter((trade) => trade.calculatedPnL > 0);
    const losses = tradesWithPnL.filter((trade) => trade.calculatedPnL < 0);

    const totalPnL = tradesWithPnL.reduce(
      (sum, trade) => sum + trade.calculatedPnL,
      0
    );
    const winRate = (wins.length / tradesWithPnL.length) * 100;

    const totalWins = wins.reduce((sum, trade) => sum + trade.calculatedPnL, 0);
    const totalLosses = Math.abs(
      losses.reduce((sum, trade) => sum + trade.calculatedPnL, 0)
    );
    const profitFactor =
      totalLosses === 0 ? totalWins : totalWins / totalLosses;

    const averageWin = wins.length ? totalWins / wins.length : 0;
    const averageLoss = losses.length ? totalLosses / losses.length : 0;

    const largestWin = wins.length
      ? Math.max(...wins.map((t) => t.calculatedPnL))
      : 0;
    const largestLoss = losses.length
      ? Math.min(...losses.map((t) => t.calculatedPnL))
      : 0;

    return {
      totalPnL,
      winRate,
      totalTrades: filteredTrades.length,
      profitFactor,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
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
