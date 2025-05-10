import { useMemo } from "@/lib/react";
import type { Trade } from "@/types/trade";
import { useFilterStore } from "@/stores/filterStore";
import { calculatePnL } from "@/utils/trade";
import {
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  startOfYear,
} from "date-fns";

export function useFilteredTrades(trades: Trade[]) {
  const { filters } = useFilterStore();

  return useMemo(() => {
    let filteredTrades = trades;

    // Filter by timeframe
    if (filters.timeframe) {
      const now = new Date();
      let startDate: Date;
      const endDate = endOfDay(now);

      switch (filters.timeframe) {
        case "1D":
          startDate = startOfDay(subDays(now, 1));
          break;
        case "1W":
          startDate = startOfDay(subDays(now, 7));
          break;
        case "1M":
          startDate = startOfDay(subMonths(now, 1));
          break;
        case "3M":
          startDate = startOfDay(subMonths(now, 3));
          break;
        case "YTD":
          startDate = startOfYear(now);
          break;
        case "1Y":
          startDate = startOfDay(subMonths(now, 12));
          break;
        case "ALL":
          startDate = new Date(0); // Beginning of time
          break;
        default:
          startDate = startOfDay(subMonths(now, 1)); // Default to 1M
      }

      filteredTrades = filteredTrades.filter((trade) => {
        const tradeDate = new Date(trade.entry_date);
        return tradeDate >= startDate && tradeDate <= endDate;
      });
    }

    // Filter by date range
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filteredTrades = filteredTrades.filter((trade) => {
        const tradeDate = new Date(trade.date);
        return tradeDate >= startDate && tradeDate <= endDate;
      });
    }

    // Filter by symbols
    if (filters.symbols && filters.symbols.length > 0) {
      filteredTrades = filteredTrades.filter((trade) =>
        filters.symbols?.includes(trade.symbol)
      );
    }

    // Filter by trade types
    if (filters.types && filters.types.length > 0) {
      filteredTrades = filteredTrades.filter((trade) =>
        filters.types?.includes(trade.type)
      );
    }

    // Filter by sides
    if (filters.sides && filters.sides.length > 0) {
      filteredTrades = filteredTrades.filter((trade) =>
        filters.sides?.includes(trade.side)
      );
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filteredTrades = filteredTrades.filter((trade) =>
        filters.status?.includes(trade.status)
      );
    }

    // Filter by P&L range
    if (filters.minPnl !== undefined || filters.maxPnl !== undefined) {
      filteredTrades = filteredTrades.filter((trade) => {
        if (trade.pnl === undefined) return false;
        if (filters.minPnl !== undefined && trade.pnl < filters.minPnl)
          return false;
        if (filters.maxPnl !== undefined && trade.pnl > filters.maxPnl)
          return false;
        return true;
      });
    }

    // Filter by win/loss
    if (filters.winLoss) {
      filteredTrades = filteredTrades.filter((trade) => {
        if (trade.pnl === undefined) return false;
        if (filters.winLoss === "win" && trade.pnl <= 0) return false;
        if (filters.winLoss === "loss" && trade.pnl >= 0) return false;
        return true;
      });
    }

    // Calculate derived values for each trade
    return filteredTrades.map((trade) => ({
      ...trade,
      total: trade.quantity * (trade.entry_price || 0),
      pnl: calculatePnL(trade),
    }));
  }, [trades, filters]);
}
