import { useEffect } from "@/lib/react";
import { useTradeStore } from "@/stores/tradeStore";
import { useAuthStore } from "@/stores/authStore";
import { useFilterStore } from "@/stores/filterStore";
import { PerformanceCharts } from "@/components/portfolio/PerformanceCharts";
import { TradeStatistics } from "@/components/dashboard/TradeStatistics";
import { PageHeader } from "@/components/ui";
import { FilterBar } from "@/components/trades/FilterBar";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { Loader2 } from "lucide-react";

export default function Performance() {
  const { user } = useAuthStore();
  const { trades, fetchTrades, isLoading, error } = useTradeStore();
  const { filters } = useFilterStore();
  const filteredTrades = useFilteredTrades(trades);

  // Fetch trades when user changes
  useEffect(() => {
    if (user?.id) {
      fetchTrades(user.id);
    }
  }, [user?.id, fetchTrades]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex-grow p-6">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Performance" subtitle="Analyze your trading performance" />
        <FilterBar />
      </div>

      <div className="space-y-6">
        <TradeStatistics trades={filteredTrades} isLoading={isLoading} />
        <PerformanceCharts trades={filteredTrades} timeframe={filters.timeframe || "1M"} />
      </div>
    </div>
  );
}
