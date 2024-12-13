export const calculateStatistics = (trades) => {
  if (!trades || trades.length === 0) {
    return createEmptyStats();
  }

  return {
    returnDollar: calculateReturnDollarStats(trades),
    returnPercent: calculateReturnPercentStats(trades),
    avgReturn: calculateAvgReturnStats(trades),
    avgReturnPercent: calculateAvgReturnPercentStats(trades),
    trades: calculateTradeStats(trades),
    tradeSize: calculateTradeSizeStats(trades),
    holdTime: calculateHoldTimeStats(trades),
    commissions: calculateCommissionStats(trades),
    performance: calculatePerformanceStats(trades)
  };
};

const calculateReturnDollarStats = (trades) => {
  const winners = trades.filter(t => t.profit > 0);
  const losers = trades.filter(t => t.profit < 0);
  const longs = trades.filter(t => t.type === 'LONG');
  const shorts = trades.filter(t => t.type === 'SHORT');

  return {
    return: trades.reduce((sum, t) => sum + t.profit, 0),
    accumulativeReturnNet: calculateAccumulativeReturn(trades, true),
    accumulativeReturnGross
  };
}; 