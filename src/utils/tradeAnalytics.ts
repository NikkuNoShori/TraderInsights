import type { Trade } from "@/types/trade";
import type { TradeMetrics } from "@/types/portfolio";

export function calculateTradeMetrics(trades: Trade[]): TradeMetrics[] {
  // Group trades by symbol
  const tradesBySymbol = trades.reduce(
    (acc, trade) => {
      if (!acc[trade.symbol]) {
        acc[trade.symbol] = [];
      }
      acc[trade.symbol].push(trade);
      return acc;
    },
    {} as Record<string, Trade[]>,
  );

  // Calculate metrics for each symbol
  return Object.entries(tradesBySymbol).map(([symbol, trades]) => {
    const buyTrades = trades.filter((t) => t.side === "Long");
    const sellTrades = trades.filter((t) => t.side === "Short");

    const avgEntryPrice =
      buyTrades.reduce((sum, t) => sum + t.price, 0) / buyTrades.length;
    const avgExitPrice =
      sellTrades.reduce((sum, t) => sum + t.price, 0) / sellTrades.length;
    const totalQuantity = buyTrades.reduce((sum, t) => sum + t.quantity, 0);
    const totalFees = trades.reduce((sum, t) => sum + (t.fees || 0), 0);

    const gainLoss = (avgExitPrice - avgEntryPrice) * totalQuantity;
    const gainLossPercent =
      ((avgExitPrice - avgEntryPrice) / avgEntryPrice) * 100;

    const firstTrade = new Date(trades[0].entry_date);
    const lastTrade = new Date(trades[trades.length - 1].entry_date);
    const holdingPeriod = Math.ceil(
      (lastTrade.getTime() - firstTrade.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      symbol,
      entryPrice: avgEntryPrice,
      exitPrice: avgExitPrice,
      shares: totalQuantity,
      gainLoss,
      gainLossPercent,
      holdingPeriod,
      fees: totalFees,
      netReturn: gainLoss - totalFees,
      riskRewardRatio: Math.abs(
        gainLoss / (avgEntryPrice * totalQuantity * 0.02),
      ), // Assuming 2% risk
    };
  });
}
