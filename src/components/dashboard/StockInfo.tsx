import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockQuote {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

interface StockInfoProps {
  quote: StockQuote;
}

export function StockInfo({ quote }: StockInfoProps) {
  const formatNumber = (num: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(num);

  const isPositive = quote.changePercent >= 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-baseline">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {quote.symbol}
          </h2>
          <p className="text-sm text-gray-500">{quote.companyName}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {formatNumber(quote.currentPrice)}
          </div>
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            <span>{isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Volume</p>
          <p className="text-lg font-semibold">
            {quote.volume.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Market Cap</p>
          <p className="text-lg font-semibold">
            {formatNumber(quote.marketCap)}
          </p>
        </div>
      </div>
    </div>
  );
}