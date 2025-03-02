import type { Trade } from "@/types/trade";
import { useMemo } from "@/lib/react";
import { StatsCard } from "./StatsCard";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";

interface DashboardCardsProps {
  trades: Trade[];
}

export function DashboardCards({ trades }: DashboardCardsProps) {
  const filteredTrades = useFilteredTrades(trades, "overview");

  const stats = useMemo(() => {
    const totalPnL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = filteredTrades.filter((trade) => (trade.pnl || 0) > 0);
    const winRate = filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0;

    return {
      totalPnL,
      winRate,
      totalTrades: filteredTrades.length,
    };
  }, [filteredTrades]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
    </div>
  );
}
