import type { Trade } from '../../types/trade';

interface TradeMetrics {
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  riskRewardRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  profitableTrades: number;
  lossTrades: number;
  totalProfitLoss: number;
  expectancy: number;
}

export const calculateMetrics = (trades: Trade[]): TradeMetrics => {
  const defaultMetrics: TradeMetrics = {
    winRate: 0,
    profitFactor: 0,
    averageWin: 0,
    averageLoss: 0,
    riskRewardRatio: 0,
    maxDrawdown: 0,
    totalTrades: 0,
    profitableTrades: 0,
    lossTrades: 0,
    totalProfitLoss: 0,
    expectancy: 0
  };

  if (!trades.length) return defaultMetrics;

  const completedTrades = trades.filter(trade => trade.pnl !== undefined);
  if (!completedTrades.length) return defaultMetrics;

  const winningTrades = completedTrades.filter(trade => (trade.pnl ?? 0) > 0);
  const losingTrades = completedTrades.filter(trade => (trade.pnl ?? 0) < 0);

  const totalProfit = winningTrades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0));

  const metrics = {
    totalTrades: completedTrades.length,
    profitableTrades: winningTrades.length,
    lossTrades: losingTrades.length,
    winRate: (winningTrades.length / completedTrades.length) * 100,
    profitFactor: totalLoss === 0 ? totalProfit : totalProfit / totalLoss,
    averageWin: winningTrades.length ? totalProfit / winningTrades.length : 0,
    averageLoss: losingTrades.length ? totalLoss / losingTrades.length : 0,
    totalProfitLoss: totalProfit - totalLoss,
    maxDrawdown: calculateMaxDrawdown(completedTrades),
    riskRewardRatio: 0,
    expectancy: 0
  };

  metrics.riskRewardRatio = metrics.averageLoss === 0 ? 0 : metrics.averageWin / metrics.averageLoss;
  metrics.expectancy = (metrics.winRate / 100 * metrics.averageWin) - ((1 - metrics.winRate / 100) * metrics.averageLoss);

  return metrics;
};

const calculateMaxDrawdown = (trades: Trade[]): number => {
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;

  trades.forEach(trade => {
    runningPnL += trade.pnl ?? 0;
    peak = Math.max(peak, runningPnL);
    maxDrawdown = Math.max(maxDrawdown, peak - runningPnL);
  });

  return maxDrawdown;
}; 