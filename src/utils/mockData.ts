export const generateMockStockData = (symbol: string) => {
  const basePrice = 100;
  const volatility = 0.02;
  const numPoints = 100;
  const data = [];

  for (let i = 0; i < numPoints; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (numPoints - i));

    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const price = basePrice * (1 + randomChange);

    data.push({
      symbol,
      date: date.toISOString(),
      open: price * (1 - volatility / 2),
      high: price * (1 + volatility),
      low: price * (1 - volatility),
      close: price,
      volume: Math.floor(Math.random() * 1000000),
    });
  }

  return data;
};

export const generateMockInsights = (
  symbol: string,
  data: Array<{ price: number }>,
) => {
  const currentPrice = data[data.length - 1].price;
  const startPrice = data[0].price;
  const priceChange = ((currentPrice - startPrice) / startPrice) * 100;

  const insights = [
    {
      type: priceChange >= 0 ? "positive" : ("negative" as const),
      title: `${Math.abs(priceChange).toFixed(2)}% ${priceChange >= 0 ? "Increase" : "Decrease"}`,
      description: `${symbol} has ${priceChange >= 0 ? "gained" : "lost"} ${Math.abs(priceChange).toFixed(2)}% over the last 30 days.`,
    },
    {
      type: "info" as const,
      title: "Trading Volume",
      description: `High trading volume indicates strong market interest in ${symbol}.`,
    },
    {
      type: "warning" as const,
      title: "Market Volatility",
      description: `${symbol} shows moderate volatility. Consider implementing stop-loss orders.`,
    },
  ];

  return insights;
};
