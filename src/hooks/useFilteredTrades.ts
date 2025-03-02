import { useMemo } from "@/lib/react";
import type { Trade } from "@/types/trade";
import { useFilterStore, type FilterSection } from "@/stores/filterStore";
import { calculatePnL } from "@/utils/trade";

export function useFilteredTrades(trades: Trade[], section: FilterSection) {
  const { filters } = useFilterStore();

  return useMemo(() => {
    const currentFilters = filters[section];

    const filteredTrades = trades.filter((trade) => {
      // Filter by broker
      if (currentFilters.brokers && currentFilters.brokers.length > 0) {
        if (
          !trade.broker_id ||
          !currentFilters.brokers.includes(trade.broker_id)
        ) {
          return false;
        }
      }

      // Filter by date range
      if (currentFilters.dateRange) {
        const [startDate, endDate] = currentFilters.dateRange;
        const tradeDate = new Date(trade.date);
        if (tradeDate < startDate || tradeDate > endDate) {
          return false;
        }
      }

      // Filter by symbols
      if (currentFilters.symbols && currentFilters.symbols.length > 0) {
        if (!currentFilters.symbols.includes(trade.symbol)) {
          return false;
        }
      }

      // Filter by trade types
      if (currentFilters.types && currentFilters.types.length > 0) {
        if (!currentFilters.types.includes(trade.type)) {
          return false;
        }
      }

      // Filter by sides
      if (currentFilters.sides && currentFilters.sides.length > 0) {
        if (!currentFilters.sides.includes(trade.side)) {
          return false;
        }
      }

      // Filter by status
      if (currentFilters.status && currentFilters.status.length > 0) {
        if (!currentFilters.status.includes(trade.status)) {
          return false;
        }
      }

      // Filter by P&L range
      if (currentFilters.minPnl !== undefined && trade.pnl !== undefined) {
        if (trade.pnl < currentFilters.minPnl) {
          return false;
        }
      }
      if (currentFilters.maxPnl !== undefined && trade.pnl !== undefined) {
        if (trade.pnl > currentFilters.maxPnl) {
          return false;
        }
      }

      // Filter by win/loss
      if (currentFilters.winLoss) {
        if (trade.pnl === undefined) return false;
        if (currentFilters.winLoss === "win" && trade.pnl <= 0) return false;
        if (currentFilters.winLoss === "loss" && trade.pnl >= 0) return false;
      }

      return true;
    });

    // Calculate derived values for each trade
    return filteredTrades.map((trade) => ({
      ...trade,
      total: trade.quantity * (trade.entry_price || 0),
      pnl: calculatePnL(trade),
    }));
  }, [trades, filters, section]);
}
