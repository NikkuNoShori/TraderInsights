import { useEffect, useMemo, useCallback, useState } from "@/lib/react";
import { useAuthStore } from "@/stores/authStore";
import { tradeService } from "@/lib/services/tradeService";
import type { Trade } from "@/types/trade";
import { Spinner } from "@/components/ui/Spinner";
import {
  TimeframeSelector,
  type TimeframeOption,
} from "@/components/ui/TimeframeSelector";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { RechartsPnLChart } from "@/components/dashboard/RechartsPnLChart";
import { WinRateChart } from "@/components/dashboard/WinRateChart";
import { TradeDistributionChart } from "@/components/dashboard/TradeDistributionChart";
import { PerformanceCharts } from "@/components/portfolio/PerformanceCharts";

interface PerformanceError extends Error {
  message: string;
  code?: string;
}

export default function Performance() {
  const { user } = useAuthStore();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1M");

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;

      try {
        const trades = await tradeService.getTrades(user.id);
        setTrades(trades);
      } catch (err) {
        console.error("Error fetching trades:", err);
        setError("Failed to load trades. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

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
    return trades.filter((trade: Trade) => new Date(trade.entry_date) >= cutoff);
  }, [trades, timeframe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading trades...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your trading data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No trades found</h2>
          <p className="text-muted-foreground">Start adding trades to see your performance metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trading Performance</h1>
        <TimeframeSelector value={timeframe} onValueChange={handleTimeframeChange} />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <PerformanceMetrics trades={filteredTrades} timeframe={timeframe} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RechartsPnLChart trades={filteredTrades} timeframe={timeframe} />
        <WinRateChart trades={filteredTrades} timeframe={timeframe} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TradeDistributionChart trades={filteredTrades} />
        <PerformanceCharts trades={filteredTrades} timeframe={timeframe} />
      </div>
    </div>
  );
}
