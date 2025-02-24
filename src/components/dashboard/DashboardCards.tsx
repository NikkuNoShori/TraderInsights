import type { Trade } from "../../types/trade";
import type { Layout } from "react-grid-layout";
import { useMemo } from "@/lib/react";
import { DASHBOARD_CARDS } from "../../config/dashboardCards";
import { StatsCard } from "./StatsCard";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface DashboardCardsProps {
  trades: Trade[];
  layouts?: Layout[];
}

export function DashboardCards({ trades, layouts = [] }: DashboardCardsProps) {
  const stats = useMemo(() => {
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = trades.filter((trade) => (trade.pnl || 0) > 0);
    const winRate = trades.length ? (winningTrades.length / trades.length) * 100 : 0;
    
    return {
      totalPnL,
      winRate,
      totalTrades: trades.length,
      winningTradesCount: winningTrades.length,
    };
  }, [trades]);

  return (
    <div className="h-full">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Total P&L"
            value={`$${stats.totalPnL.toFixed(2)}`}
            icon={stats.totalPnL >= 0 ? TrendingUp : TrendingDown}
            trend={`${Math.abs(stats.totalPnL).toFixed(2)}%`}
            trendDirection={stats.totalPnL >= 0 ? "up" : "down"}
          />
          <StatsCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            icon={stats.winRate >= 50 ? TrendingUp : TrendingDown}
            trend={`${stats.winningTradesCount} winning trades`}
            trendDirection={stats.winRate >= 50 ? "up" : "down"}
          />
          <StatsCard
            title="Total Trades"
            value={stats.totalTrades}
            icon={Activity}
            subtitle="All time"
          />
        </div>
      </div>
    </div>
  );
}
