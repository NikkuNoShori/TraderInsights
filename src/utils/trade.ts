import { Trade } from '../types/trade';

export const formatTradeValue = (value: number): string => {
  if (isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const calculatePnL = (trade: Trade): number => {
  if (!trade.exit_price || !trade.entry_price) return 0;
  const pnl =
    trade.side === "Long"
      ? (trade.exit_price - trade.entry_price) * trade.quantity
      : (trade.entry_price - trade.exit_price) * trade.quantity;
  return pnl;
};

export const calculateWinRate = (trades: Trade[]): number => {
  if (!trades.length) return 0;
  const winningTrades = trades.filter(
    (trade) => trade.pnl !== undefined && trade.pnl > 0
  );
  return winningTrades.length / trades.length;
};

export const calculateProfitFactor = (trades: Trade[]): number => {
  const grossProfit = trades.reduce(
    (sum, trade) =>
      sum + (trade.pnl !== undefined && trade.pnl > 0 ? trade.pnl : 0),
    0
  );
  const grossLoss = Math.abs(
    trades.reduce(
      (sum, trade) =>
        sum + (trade.pnl !== undefined && trade.pnl < 0 ? trade.pnl : 0),
      0
    )
  );
  return grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
};

export const calculateAverageTrade = (trades: Trade[]): number => {
  if (!trades.length) return 0;
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0);
  return totalPnL / trades.length;
};

export const calculateMaxDrawdown = (trades: Trade[]): number => {
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;

  trades.forEach((trade) => {
    if (trade.pnl !== undefined) {
      runningPnL += trade.pnl;
    }
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

// Helper function to format percentages
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

// Helper function to calculate risk reward ratio
export const calculateRiskReward = (trades: Trade[]): number => {
  const winningTrades = trades.filter(
    (trade) => trade.pnl !== undefined && trade.pnl > 0
  );
  const losingTrades = trades.filter(
    (trade) => trade.pnl !== undefined && trade.pnl < 0
  );

  const avgWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0) /
        winningTrades.length
      : 0;

  const avgLoss =
    losingTrades.length > 0
      ? Math.abs(
          losingTrades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0)
        ) / losingTrades.length
      : 0;

  return avgLoss === 0 ? 0 : avgWin / avgLoss;
}; 