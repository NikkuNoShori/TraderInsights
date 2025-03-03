import type { Trade } from "@/types/trade";
import type { TradeFilters } from "@/types/trade";

export function filterTrades(trades: Trade[], filters: TradeFilters): Trade[] {
  return trades.filter((trade) => {
    // Filter by broker
    if (filters.brokers?.length) {
      if (!trade.broker_id || !filters.brokers.includes(trade.broker_id)) {
        return false;
      }
    }

    // Filter by date range
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      const tradeDate = new Date(trade.date);
      if (tradeDate < startDate || tradeDate > endDate) {
        return false;
      }
    }

    // Filter by symbols
    if (filters.symbols?.length) {
      if (!filters.symbols.includes(trade.symbol)) {
        return false;
      }
    }

    // Filter by trade types
    if (filters.types?.length) {
      if (!filters.types.includes(trade.type)) {
        return false;
      }
    }

    // Filter by sides
    if (filters.sides?.length) {
      if (!filters.sides.includes(trade.side)) {
        return false;
      }
    }

    // Filter by status
    if (filters.status?.length) {
      if (!filters.status.includes(trade.status)) {
        return false;
      }
    }

    // Filter by P&L range
    if (filters.minPnl !== undefined && trade.pnl !== undefined) {
      if (trade.pnl < filters.minPnl) {
        return false;
      }
    }
    if (filters.maxPnl !== undefined && trade.pnl !== undefined) {
      if (trade.pnl > filters.maxPnl) {
        return false;
      }
    }

    // Filter by win/loss
    if (filters.winLoss) {
      if (trade.pnl === undefined) return false;
      if (filters.winLoss === "win" && trade.pnl <= 0) return false;
      if (filters.winLoss === "loss" && trade.pnl >= 0) return false;
    }

    return true;
  });
}
