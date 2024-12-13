export const generateMockStockData = (symbol: string) => {
  const basePrice = Math.random() * 1000 + 100;
  const volatility = 0.02;
  const days = 30;
  
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const price = basePrice * (1 + randomChange * i);
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Number(price.toFixed(2)),
    };
  });
};

export const generateMockInsights = (symbol: string, data: Array<{ price: number }>) => {
  const currentPrice = data[data.length - 1].price;
  const startPrice = data[0].price;
  const priceChange = ((currentPrice - startPrice) / startPrice) * 100;
  
  const insights = [
    {
      type: priceChange >= 0 ? 'positive' : 'negative' as const,
      title: `${Math.abs(priceChange).toFixed(2)}% ${priceChange >= 0 ? 'Increase' : 'Decrease'}`,
      description: `${symbol} has ${priceChange >= 0 ? 'gained' : 'lost'} ${Math.abs(priceChange).toFixed(2)}% over the last 30 days.`,
    },
    {
      type: 'info' as const,
      title: 'Trading Volume',
      description: `High trading volume indicates strong market interest in ${symbol}.`,
    },
    {
      type: 'warning' as const,
      title: 'Market Volatility',
      description: `${symbol} shows moderate volatility. Consider implementing stop-loss orders.`,
    },
  ];
  
  return insights;
};