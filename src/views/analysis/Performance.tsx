import { PageHeader } from "@/components/ui";
import { ReportingNav } from "@/components/navigation/ReportingNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MetricCard } from "@/components/ui";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  calculateWinRate,
  calculateProfitFactor,
  calculateAverageTrade,
  calculateMaxDrawdown,
} from "../../utils/tradeCalculations";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { PerformanceCharts } from "@/components/portfolio/PerformanceCharts";
import { Activity, TrendingUp, DollarSign } from "lucide-react";
import type { Trade } from "@/types/trade";
import type { Trade as PortfolioTrade } from "@/types/portfolio";

export default function Performance() {
  console.log("Rendering Performance component");

  const {
    data: trades = [],
    error,
    isLoading,
  } = useQuery<Trade[]>({
    queryKey: ["trades"],
    queryFn: async () => {
      console.log("Fetching trades...");
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching trades:", error);
        throw error;
      }
      console.log("Trades fetched:", data);
      return data || [];
    },
  });

  console.log("Component state:", {
    isLoading,
    error,
    tradesCount: trades.length,
  });

  if (isLoading) {
    return (
      <div className="flex-grow p-4">
        <PageHeader
          title="Performance"
          subtitle="Track your trading performance and analytics"
        />
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow p-4">
        <PageHeader
          title="Performance"
          subtitle="Track your trading performance and analytics"
        />
        <div className="mt-6 text-red-500">
          Error loading trades: {error.message}
        </div>
      </div>
    );
  }

  // Transform trades for charts
  const portfolioTrades: PortfolioTrade[] = trades.map((trade) => ({
    id: trade.id,
    portfolio_id: trade.user_id, // Using user_id as portfolio_id since we don't have portfolios yet
    symbol: trade.symbol,
    type: trade.side === "Long" ? "buy" : "sell",
    price: trade.price,
    shares: trade.quantity,
    date: trade.date,
    fees: trade.fees,
    notes: trade.notes || undefined,
  }));

  // Calculate metrics using utility functions
  const winRate = calculateWinRate(trades);
  const profitFactor = calculateProfitFactor(trades);
  const averageTrade = calculateAverageTrade(trades);
  const maxDrawdown = calculateMaxDrawdown(trades);
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const profitableTrades = trades.filter(
    (trade) => (trade.pnl || 0) > 0,
  ).length;
  const totalTrades = trades.length;

  return (
    <div className="flex-grow p-4">
      <PageHeader
        title="Performance"
        subtitle="Track your trading performance and analytics"
      />
      <ReportingNav />

      {/* Quick Stats Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Trades"
          value={totalTrades.toString()}
          icon={Activity}
        />
        <StatsCard
          title="Win Rate"
          value={formatPercentage(winRate)}
          icon={TrendingUp}
          trend={winRate >= 0.5 ? "up" : "down"}
        />
        <StatsCard
          title="Total P&L"
          value={formatCurrency(totalPnL)}
          icon={DollarSign}
          trend={totalPnL > 0 ? "up" : "down"}
        />
        <StatsCard
          title="Profit Factor"
          value={profitFactor.toFixed(2)}
          icon={TrendingUp}
          trend={profitFactor >= 1 ? "up" : "down"}
        />
      </div>

      {/* Performance Charts */}
      <div className="mt-6">
        <PerformanceCharts trades={trades} />
      </div>

      {/* Detailed Metrics Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Win Rate"
          value={formatPercentage(winRate)}
          subtitle={`${profitableTrades} out of ${totalTrades} trades`}
        />
        <MetricCard
          title="Profit Factor"
          value={profitFactor.toFixed(2)}
          subtitle="Gross profit / Gross loss"
        />
        <MetricCard
          title="Average Trade"
          value={formatCurrency(averageTrade)}
          subtitle="Expected value per trade"
        />
        <MetricCard
          title="Average Win"
          value={formatCurrency(averageTrade > 0 ? averageTrade : 0)}
          subtitle={`Total profit: ${formatCurrency(totalPnL)}`}
        />
        <MetricCard
          title="Average Loss"
          value={formatCurrency(averageTrade < 0 ? Math.abs(averageTrade) : 0)}
          subtitle="Average losing trade"
        />
        <MetricCard
          title="Max Drawdown"
          value={formatCurrency(maxDrawdown)}
          subtitle="Largest peak to trough decline"
        />
      </div>
    </div>
  );
}
