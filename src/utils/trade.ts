import { Trade } from "@/types/trade";

export const calculatePnL = (trade: Trade): number | undefined => {
  // For closed trades
  if (trade.status === "closed") {
    // If we have exit_price, use that
    if (trade.exit_price) {
      const pnl =
        trade.side === "Long"
          ? (trade.exit_price - trade.entry_price) * trade.quantity
          : (trade.entry_price - trade.exit_price) * trade.quantity;
      return trade.fees ? pnl - trade.fees : pnl;
    }

    // If no exit_price but we have price, use that as exit price
    if (trade.price) {
      const pnl =
        trade.side === "Long"
          ? (trade.price - trade.entry_price) * trade.quantity
          : (trade.entry_price - trade.price) * trade.quantity;
      return trade.fees ? pnl - trade.fees : pnl;
    }
  }

  // For open trades, calculate unrealized PnL using current price
  if (trade.status === "open" && trade.price) {
    const pnl =
      trade.side === "Long"
        ? (trade.price - trade.entry_price) * trade.quantity
        : (trade.entry_price - trade.price) * trade.quantity;
    return trade.fees ? pnl - trade.fees : pnl;
  }

  return undefined;
};

// Format trade value with currency symbol
export const formatTradeValue = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Format percentage value
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};
