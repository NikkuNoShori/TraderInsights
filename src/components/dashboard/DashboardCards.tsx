import type { Trade } from "@/types/trade";
import { useMemo } from "@/lib/react";
import { StatsCard } from "./StatsCard";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface DashboardCardsProps {
  trades: Trade[];
}

export function DashboardCards({ trades }: DashboardCardsProps) {
  const stats = useMemo(() => {
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = trades.filter((trade) => (trade.pnl || 0) > 0);
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

    return {
      totalPnL,
      winRate,
      totalTrades: trades.length,
    };
  }, [trades]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatsCard
        title="Total P&L"
        value={formatCurrency(stats.totalPnL)}
        icon={stats.totalPnL >= 0 ? TrendingUp : TrendingDown}
        trend={formatCurrency(Math.abs(stats.totalPnL))}
        trendDirection={stats.totalPnL >= 0 ? "up" : "down"}
      />
      <StatsCard
        title="Win Rate"
        value={`${stats.winRate.toFixed(1)}%`}
        icon={Activity}
        trend={`${stats.winRate.toFixed(1)}%`}
        trendDirection={stats.winRate >= 50 ? "up" : "down"}
      />
      <StatsCard
        title="Total Trades"
        value={stats.totalTrades.toString()}
        icon={Activity}
      />
    </div>
  );
}
