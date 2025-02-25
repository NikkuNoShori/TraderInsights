import { useState, useMemo, useCallback } from "@/lib/react";
import { useSupabaseStore } from "@/stores/supabaseStore";
import { useTrades } from "@/hooks/useTrades";
import { Spinner } from "@/components/ui/Spinner";
import {
  TimeframeSelector,
  type TimeframeOption,
} from "../components/ui/TimeframeSelector";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { WinRateChart } from "@/components/dashboard/WinRateChart";
import { TradeDistributionChart } from "@/components/dashboard/TradeDistributionChart";
import { PerformanceCharts } from "@/components/portfolio/PerformanceCharts";

interface PerformanceError extends Error {
  message: string;
  code?: string;
}

export default function Performance() {
  const { data: trades = [], isLoading, error } = useTrades();
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1M");

  const handleTimeframeChange = useCallback((value: TimeframeOption) => {
    setTimeframe(value);
  }, []);

  const filteredTrades = useMemo(() => {
    if (!trades.length) return [];
    // Filter trades based on timeframe
    const now = new Date();
    const cutoff = new Date();
    switch (timeframe) {
      case "1D":
        cutoff.setDate(now.getDate() - 1);
        break;
      case "1W":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "1M":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case "1Y":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      case "YTD":
        cutoff.setMonth(0, 1);
        break;
      case "ALL":
        return trades;
    }
    return trades.filter((trade) => new Date(trade.entry_date) >= cutoff);
  }, [trades, timeframe]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-error">{(error as PerformanceError).message}</div>
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
            onValueChange={handleTimeframeChange}
            className="text-text-muted"
          />
        </div>
        <PerformanceMetrics trades={filteredTrades} timeframe={timeframe} />
      </div>

      {/* Advanced Charts */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h3 className="text-base font-medium text-text-primary mb-4">
          Advanced Performance Analysis
        </h3>
        <PerformanceCharts trades={filteredTrades} />
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
