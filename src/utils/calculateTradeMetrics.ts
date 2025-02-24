import type { Trade } from "../types/trade";

export function calculateTradeMetrics(trade: Trade) {
  const isComplete = trade.status === "closed";
  const hasExit = trade.exit_price != null;

  const entryPrice = trade.entry_price || trade.price;
  const exitPrice = trade.exit_price;

  const pnl =
    hasExit && exitPrice
      ? (exitPrice - entryPrice) *
        trade.quantity *
        (trade.side === "Long" ? 1 : -1)
      : 0;

  return {
    entryPrice,
    exitPrice,
    quantity: trade.quantity,
    pnl,
    isComplete,
    riskAmount: trade.risk_amount,
    fees: trade.fees || 0,
    profitRatio:
      trade.take_profit && trade.stop_loss
        ? (trade.take_profit - entryPrice) / (entryPrice - trade.stop_loss)
        : undefined,
  };
}
