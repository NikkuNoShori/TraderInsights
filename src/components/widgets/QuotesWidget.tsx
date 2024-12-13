import React, { useState } from 'react';
import { WidgetContainer } from './WidgetContainer';
import type { StockQuote, QuoteDataPoint } from '../../types/stock';
import { formatCurrency, formatNumber, formatPercent, formatDate } from '../../utils/formatters';
import { Filter, X, Check } from 'lucide-react';
import { clsx } from 'clsx';

// Rest of the imports and DEFAULT_DATA_POINTS remain the same...
const DEFAULT_DATA_POINTS: QuoteDataPoint[] = [
  { id: 'open', key: 'open', label: 'Open', category: 'price', visible: true, format: 'currency' },
  { id: 'high', key: 'high', label: 'High', category: 'price', visible: true, format: 'currency' },
  { id: 'low', key: 'low', label: 'Low', category: 'price', visible: true, format: 'currency' },
  { id: 'volume', key: 'volume', label: 'Volume', category: 'trading', visible: true, format: 'number' },
  { id: 'avgVolume3Month', key: 'avgVolume3Month', label: '3M Avg Volume', category: 'trading', visible: true, format: 'number' },
  { id: 'marketCap', key: 'marketCap', label: 'Market Cap', category: 'company', visible: true, format: 'currency' },
  { id: 'float', key: 'float', label: 'Float', category: 'company', visible: true, format: 'number' },
  { id: 'sharesOutstanding', key: 'sharesOutstanding', label: 'Shares Outstanding', category: 'company', visible: true, format: 'number' },
  { id: 'weekHigh52', key: 'weekHigh52', label: '52 Week High', category: 'technical', visible: true, format: 'currency' },
  { id: 'weekLow52', key: 'weekLow52', label: '52 Week Low', category: 'technical', visible: true, format: 'currency' },
  { id: 'nextEarningsDate', key: 'nextEarningsDate', label: 'Next Earnings', category: 'company', visible: true, format: 'date' },
  { id: 'sector', key: 'sector', label: 'Sector', category: 'company', visible: false, format: 'text' },
  { id: 'index', key: 'index', label: 'Index', category: 'company', visible: false, format: 'text' },
];

interface QuotesWidgetProps {
  quote: StockQuote;
  onClose: () => void;
  isMinimized: boolean;
  onMinimize: () => void;
}

export function QuotesWidget({ quote, onClose, isMinimized, onMinimize }: QuotesWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [dataPoints, setDataPoints] = useState<QuoteDataPoint[]>(DEFAULT_DATA_POINTS);
  const [filterCategory, setFilterCategory] = useState<QuoteDataPoint['category'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isPositive = quote.change >= 0;
  const isAfterHoursPositive = quote.afterHoursChange >= 0;

  const formatValue = (point: QuoteDataPoint, value: any) => {
    switch (point.format) {
      case 'currency':
        return formatCurrency(value);
      case 'number':
        return formatNumber(value);
      case 'percent':
        return formatPercent(value);
      case 'date':
        return formatDate(value);
      default:
        return value;
    }
  };

  const toggleDataPoint = (id: string) => {
    setDataPoints(points =>
      points.map(p =>
        p.id === id ? { ...p, visible: !p.visible } : p
      )
    );
  };

  const filteredDataPoints = dataPoints.filter(point => {
    const matchesCategory = filterCategory === 'all' || point.category === filterCategory;
    const matchesSearch = point.label.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleDataPoints = dataPoints.filter(p => p.visible);

  return (
    <WidgetContainer
      title="Quotes"
      isMinimized={isMinimized}
      onMinimize={onMinimize}
      onClose={onClose}
      headerActions={
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 hover:bg-gray-200 rounded-md text-gray-500 hover:text-gray-700"
        >
          <Filter className="h-4 w-4" />
        </button>
      }
    >
      {/* Header with company info */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {quote.companyName}
        </h3>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
            {quote.symbol}
          </span>
          <span className={`text-lg font-semibold ${
            isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(quote.currentPrice)}
          </span>
          <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{formatCurrency(quote.change)} ({formatPercent(quote.changePercent)})
          </span>
        </div>
        {quote.afterHoursPrice > 0 && (
          <div className="mt-1 text-sm">
            <span className="text-gray-500">After Hours: </span>
            <span className={isAfterHoursPositive ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(quote.afterHoursPrice)}
              {' '}({formatPercent(quote.afterHoursChangePercent)})
            </span>
          </div>
        )}
      </div>

      {showSettings ? (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search data points..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-1 rounded-md text-sm bg-background border-input"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm bg-white"
            >
              <option value="all">All Categories</option>
              <option value="price">Price</option>
              <option value="trading">Trading</option>
              <option value="company">Company</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {filteredDataPoints.map((point) => (
              <label
                key={point.id}
                className={clsx(
                  'flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-50',
                  point.visible && 'bg-indigo-50 hover:bg-indigo-100'
                )}
              >
                <span className="text-sm">{point.label}</span>
                <button
                  onClick={() => toggleDataPoint(point.id)}
                  className={clsx(
                    'p-1 rounded-md',
                    point.visible ? 'text-indigo-600' : 'text-gray-400'
                  )}
                >
                  {point.visible ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </button>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {visibleDataPoints.map((point) => (
            <div key={point.id}>
              <span className="text-sm text-gray-500">{point.label}</span>
              <div className="font-medium">
                {formatValue(point, quote[point.key])}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetContainer>
  );
}