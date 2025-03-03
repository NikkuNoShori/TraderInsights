import { useEffect, useState, useMemo } from "@/lib/react";
import { useTradeStore } from "@/stores/tradeStore";
import { useAuthStore } from "@/stores/authStore";
import { useFilterStore } from "@/stores/filterStore";
import { PerformanceCharts } from "@/components/portfolio/PerformanceCharts";
import { TradeStatistics } from "@/components/dashboard/TradeStatistics";
import { PageHeader } from "@/components/ui";
import { TimeframeSelector } from "@/components/ui/TimeframeSelector";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/trades/FilterBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export default function Performance() {
  const { user } = useAuthStore();
  const { trades, fetchTrades, isLoading, error } = useTradeStore();
  const { setActiveSection, filters, clearFilters } = useFilterStore();
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1M");

  // Set active section and initialize filters when component mounts
  useEffect(() => {
    setActiveSection("performance");
    // Clear filters if they're not properly initialized
    if (!filters.performance) {
      clearFilters("performance");
    }
  }, []);

  // Fetch trades when user changes
  useEffect(() => {
    if (user?.id) {
      fetchTrades(user.id);
    }
  }, [user?.id, fetchTrades]);

  // Filter trades based on current filters
  const filteredTrades = useMemo(() => {
    if (!trades.length) return [];

    const currentFilters = filters.performance;
    if (!currentFilters) return trades;

    return trades.filter((trade) => {
      try {
        // Filter by broker
        if (
          currentFilters.brokers &&
          currentFilters.brokers.length > 0 &&
          trade.broker_id
        ) {
          if (!currentFilters.brokers.includes(trade.broker_id)) {
            return false;
          }
        }

        // Filter by symbol
        if (currentFilters.symbols && currentFilters.symbols.length > 0) {
          if (!currentFilters.symbols.includes(trade.symbol)) {
            return false;
          }
        }

        // Filter by type
        if (currentFilters.types && currentFilters.types.length > 0) {
          if (!currentFilters.types.includes(trade.type)) {
            return false;
          }
        }

        // Filter by side
        if (currentFilters.sides && currentFilters.sides.length > 0) {
          if (!currentFilters.sides.includes(trade.side)) {
            return false;
          }
        }

        // Filter by status
        if (currentFilters.status && currentFilters.status.length > 0) {
          if (!currentFilters.status.includes(trade.status)) {
            return false;
          }
        }

        // Filter by date range
        if (currentFilters.dateRange) {
          const tradeDate = new Date(trade.entry_date);
          if (isNaN(tradeDate.getTime())) return false;
          if (
            tradeDate < currentFilters.dateRange[0] ||
            tradeDate > currentFilters.dateRange[1]
          ) {
            return false;
          }
        }

        // Filter by P&L range
        if (
          currentFilters.minPnl !== undefined &&
          (trade.pnl || 0) < currentFilters.minPnl
        ) {
          return false;
        }
        if (
          currentFilters.maxPnl !== undefined &&
          (trade.pnl || 0) > currentFilters.maxPnl
        ) {
          return false;
        }

        // Filter by win/loss
        if (currentFilters.winLoss) {
          const isProfitable = (trade.pnl || 0) > 0;
          if (currentFilters.winLoss === "win" && !isProfitable) {
            return false;
          }
          if (currentFilters.winLoss === "loss" && isProfitable) {
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error("Error filtering trade:", error, trade);
        return false;
      }
    });
  }, [trades, filters.performance]);

  if (error) {
    return (
      <div className="flex-grow p-6">
        <div className="text-center text-red-500">
          Error loading trades: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Performance Analysis"
          subtitle="Analyze your trading performance and metrics"
        />
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Trade Filters</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <FilterBar section="performance" />
              </div>
            </DialogContent>
          </Dialog>
          <TimeframeSelector
            value={timeframe}
            onValueChange={setTimeframe}
            className="w-32"
          />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No trades found for the selected filters
          </div>
        ) : (
          <>
            <PerformanceCharts trades={filteredTrades} timeframe={timeframe} />
            <TradeStatistics trades={filteredTrades} />
          </>
        )}
      </div>
    </div>
  );
}
