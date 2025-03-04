import type { Trade } from "@/types/trade";

export interface TradeMetrics {
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  profitRatio?: number;
}

export function calculateTradeMetrics(trade: Trade): TradeMetrics {
  const quantity = trade.quantity || 0;
  const entryPrice = trade.entry_price || 0;
  const exitPrice = trade.exit_price;

  let pnl: number | undefined;
  if (exitPrice !== undefined && trade.status === "closed") {
    pnl =
      (exitPrice - entryPrice) * quantity * (trade.side === "Long" ? 1 : -1);
    if (trade.fees) {
      pnl -= trade.fees;
    }
  }

  let profitRatio: number | undefined;
  if (trade.take_profit && trade.stop_loss && entryPrice) {
    const potentialProfit = Math.abs(trade.take_profit - entryPrice);
    const potentialLoss = Math.abs(trade.stop_loss - entryPrice);
    profitRatio =
      potentialLoss > 0 ? potentialProfit / potentialLoss : undefined;
  }

  return {
    quantity,
    entryPrice,
    exitPrice,
    pnl,
    profitRatio,
  };
}
