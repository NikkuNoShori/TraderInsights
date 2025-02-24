import { Trade } from "@/types/trade";

export const calculateWinRate = (trades: Trade[]): number => {
  if (!trades.length) return 0;
  const winningTrades = trades.filter((trade) => (trade.pnl || 0) > 0);
  return winningTrades.length / trades.length;
};

export const calculateProfitFactor = (trades: Trade[]): number => {
  const grossProfit = trades.reduce(
    (sum, trade) => sum + ((trade.pnl || 0) > 0 ? trade.pnl || 0 : 0),
    0,
  );
  const grossLoss = Math.abs(
    trades.reduce(
      (sum, trade) => sum + ((trade.pnl || 0) < 0 ? trade.pnl || 0 : 0),
      0,
    ),
  );
  return grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
};

export const calculateAverageTrade = (trades: Trade[]): number => {
  if (!trades.length) return 0;
  return (
    trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / trades.length
  );
};

export const calculateMaxDrawdown = (trades: Trade[]): number => {
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;

  trades.forEach((trade) => {
    runningPnL += trade.pnl || 0;
    if (runningPnL > peak) {
      peak = runningPnL;
    }
    const drawdown = peak - runningPnL;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return maxDrawdown;
};
