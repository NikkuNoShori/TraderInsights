import { useState, useMemo, useCallback } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useTrades } from '../hooks/useTrades';
import { Spinner } from '../components/ui/Spinner';
import { TimeframeSelector, type TimeframeOption } from '../components/ui/TimeframeSelector';
import { PerformanceMetrics } from '../components/dashboard/PerformanceMetrics';
import { PnLChart } from '../components/dashboard/PnLChart';
import { WinRateChart } from '../components/dashboard/WinRateChart';
import { TradeDistributionChart } from '../components/dashboard/TradeDistributionChart';

interface PerformanceError extends Error {
  message: string;
  code?: string;
}

export default function Performance() {
  const { user } = useSupabase();
  const { data: trades = [], isLoading, error } = useTrades(user?.id);
  const [timeframe, setTimeframe] = useState<TimeframeOption>('1M');

  // Memoize the timeframe change handler
  const handleTimeframeChange = useCallback((newTimeframe: TimeframeOption) => {
    setTimeframe(newTimeframe);
  }, []);

  // Memoize filtered trades
  const filteredTrades = useMemo(() => {
    if (!trades.length) return [];
    const now = new Date();
    const timeframeInDays = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365,
      'YTD': Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)),
      'ALL': Infinity
    }[timeframe];

    return trades.filter(trade => {
      const tradeDate = new Date(trade.created_at);
      const diffTime = Math.abs(now.getTime() - tradeDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= timeframeInDays;
    });
  }, [trades, timeframe]);


  if (isLoading) {
    return (
      <div className="flex-grow bg-background p-6">
        <div className="flex justify-center">
          <Spinner className="text-primary" size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    const err = error as PerformanceError;
    return (
      <div className="flex-grow bg-background p-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Error Loading Performance Data
          </h3>
          <p className="text-text-muted">{err.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-background p-6">
      {/* Performance Overview */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-text-primary">
            Performance Overview
          </h2>
          <TimeframeSelector 
            value={timeframe} 
            onChange={handleTimeframeChange}
            className="text-text-muted"
            children={undefined}
          />
        </div>
        <PerformanceMetrics trades={filteredTrades} timeframe={timeframe} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-base font-medium text-text-primary mb-4">
            P&L Over Time
          </h3>
          <PnLChart trades={filteredTrades} timeframe={timeframe} />
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-base font-medium text-text-primary mb-4">
            Win Rate Analysis
          </h3>
          <WinRateChart trades={filteredTrades} timeframe={timeframe} />
        </div>
      </div>

      {/* Trade Distribution */}
      <div className="mt-6 bg-card border border-border rounded-lg p-6">
        <h3 className="text-base font-medium text-text-primary mb-4">
          Trade Distribution
        </h3>
        <TradeDistributionChart trades={filteredTrades} timeframe={timeframe} />
      </div>
    </div>
  );
} 