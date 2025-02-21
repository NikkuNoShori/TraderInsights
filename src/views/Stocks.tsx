import React, { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { StockChart } from '../components/StockChart';
import { StockInfo } from '../components/dashboard/StockInfo';
import { EmptyState } from '../components/dashboard/EmptyState';
import { InsightCard } from '../components/InsightCard';
import { FeatureAccessError } from '../components/FeatureAccessError';
import { isFeatureAccessible } from '../utils/marketHours';
import config from '../../config.json';
import { useStockData } from '../hooks/useStockData';
import type { ChartType } from '../components/ChartTypeSelector';

export function Stocks() {
  const isAccessible = isFeatureAccessible('quotes');
  const [symbol, setSymbol] = useState('');
  const [searchedSymbol, setSearchedSymbol] = useState('');
  const [chartType, setChartType] = useState<ChartType>('area');
  
  const { stockData, stockQuote, isLoading, error, fetchData } = useStockData();

  if (!isAccessible) {
    return (
      <FeatureAccessError
        feature="Stock Quotes"
        startTime={config.featureAccess.quotes.start}
        endTime={config.featureAccess.quotes.end}
      />
    );
  }

  const handleSearch = async () => {
    setSearchedSymbol(symbol);
    await fetchData(symbol);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-center mb-8">
        <SearchBar
          value={symbol}
          onChange={setSymbol}
          onSubmit={handleSearch}
          isLoading={isLoading}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {stockData?.length > 0 && stockQuote && (
        <>
          <StockInfo
            quote={stockQuote}
            chartType={chartType}
            onChartTypeChange={setChartType}
          />

          <div className="mb-8">
            <StockChart
              data={stockData}
              type={chartType}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <InsightCard
              type={stockQuote.changePercent >= 0 ? 'positive' : 'negative'}
              title={`${Math.abs(stockQuote.changePercent).toFixed(2)}% ${stockQuote.changePercent >= 0 ? 'Gain' : 'Loss'}`}
              description={`${stockQuote.symbol} has ${stockQuote.changePercent >= 0 ? 'gained' : 'lost'} ${Math.abs(stockQuote.changePercent).toFixed(2)}% today.`}
            />
            <InsightCard
              type="info"
              title="Trading Volume"
              description={`Volume of ${stockQuote.volume.toLocaleString()} shares traded today.`}
            />
            <InsightCard
              type="warning"
              title="52 Week Range"
              description={`Trading at ${((stockQuote.currentPrice - stockQuote.weekLow52) / (stockQuote.weekHigh52 - stockQuote.weekLow52) * 100).toFixed(1)}% of 52-week range.`}
            />
          </div>
        </>
      )}

      {stockData?.length === 0 && searchedSymbol && !isLoading && (
        <EmptyState />
      )}
    </main>
  );
}