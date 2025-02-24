export function calculateMetrics(trades: any[]) {
  const totalTrades = trades.length;
  const profitableTrades = trades.filter((t) => t.profit_loss > 0).length;
  const winRate = (profitableTrades / totalTrades) * 100;

  const grossProfit = trades.reduce(
    (sum, t) => (t.profit_loss > 0 ? sum + t.profit_loss : sum),
    0,
  );
  const grossLoss = Math.abs(
    trades.reduce(
      (sum, t) => (t.profit_loss < 0 ? sum + t.profit_loss : sum),
      0,
    ),
  );
  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

  const totalProfitLoss = trades.reduce((sum, t) => sum + t.profit_loss, 0);
  const averageWin =
    profitableTrades === 0 ? 0 : grossProfit / profitableTrades;
  const averageLoss =
    totalTrades - profitableTrades === 0
      ? 0
      : grossLoss / (totalTrades - profitableTrades);

  const expectancy =
    (winRate / 100) * averageWin - ((100 - winRate) / 100) * averageLoss;

  // Calculate max drawdown
  let maxDrawdown = 0;
  let peak = 0;
  let balance = 0;

  trades.forEach((trade) => {
    balance += trade.profit_loss;
    if (balance > peak) peak = balance;
    const drawdown = peak - balance;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });

  return {
    totalTrades,
    profitableTrades,
    winRate,
    profitFactor,
    totalProfitLoss,
    averageWin,
    averageLoss,
    expectancy,
    maxDrawdown,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
