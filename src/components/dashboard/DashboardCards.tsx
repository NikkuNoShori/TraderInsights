import type { Trade } from "@/types/trade";
import { useMemo } from "@/lib/react";
import { StatsCard } from "./StatsCard";
import { formatCurrency, formatPercentage } from "@/utils/format";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { DashboardConfig } from "./DashboardConfig";
import { useDashboardStore, type CardType } from "@/stores/dashboardStore";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import { RecentTradesCard } from "./RecentTradesCard";
import { PlaybookCard } from "./PlaybookCard";
import { ActiveTradesCard } from "./ActiveTradesCard";

interface DashboardCardsProps {
  trades: Trade[];
  timeframe: TimeframeOption;
  section: "dashboard" | "journal";
}

type StatCardType = "total_pnl" | "win_rate" | "profit_factor" | "average_win" | "average_loss" | "total_trades" | "max_drawdown_pct";

type StatCardData = {
  title: string;
  value: string;
  description: string;
  trend: "up" | "down";
  trendValue: string;
};

export function DashboardCards({ trades, timeframe, section }: DashboardCardsProps) {
  const { stats, isLoading } = useFilteredTrades();
  const enabledCards = useDashboardStore((state) => state.enabledCards[section] || []);

  const statCards = useMemo<Record<StatCardType, StatCardData>>(() => ({
    total_pnl: {
      title: "Total P&L",
      value: formatCurrency(stats.totalPnL),
      description: "Total profit/loss across all trades",
      trend: stats.totalPnL > 0 ? "up" : "down",
      trendValue: formatPercentage(Math.abs(stats.totalPnL / 100)),
    },
    win_rate: {
      title: "Win Rate",
      value: formatPercentage(stats.winRate),
      description: "Percentage of winning trades",
      trend: stats.winRate > 50 ? "up" : "down",
      trendValue: `${stats.totalTrades} trades`,
    },
    profit_factor: {
      title: "Profit Factor",
      value: stats.profitFactor.toFixed(2),
      description: "Ratio of gross profit to gross loss",
      trend: stats.profitFactor > 1 ? "up" : "down",
      trendValue: formatCurrency(stats.averageWin),
    },
    average_win: {
      title: "Average Win",
      value: formatCurrency(stats.averageWin),
      description: "Average profit per winning trade",
      trend: "up",
      trendValue: formatCurrency(stats.averageWin),
    },
    average_loss: {
      title: "Average Loss",
      value: formatCurrency(stats.averageLoss),
      description: "Average loss per losing trade",
      trend: "down",
      trendValue: formatCurrency(stats.averageLoss),
    },
    total_trades: {
      title: "Total Trades",
      value: stats.totalTrades.toString(),
      description: "Total number of trades",
      trend: stats.totalTrades > 0 ? "up" : "down",
      trendValue: `${formatPercentage(stats.winRate)} win rate`,
    },
    max_drawdown_pct: {
      title: "Max Drawdown",
      value: formatPercentage(stats.maxDrawdown),
      description: "Maximum drawdown percentage",
      trend: "down",
      trendValue: formatCurrency(Math.abs(stats.maxDrawdown * stats.totalPnL)),
    },
  } as const), [stats]);

  const renderCards = () => (
    <div className="w-full max-w-[1200px] mx-auto space-y-4">
      <div className="flex justify-end">
        <DashboardConfig section={section} />
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(statCards).map(([id, card]) => (
          enabledCards.includes(id as CardType) && (
            <StatsCard
              key={id}
              {...card}
              isLoading={isLoading}
            />
          )
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {enabledCards.includes("recent_trades") && (
          <RecentTradesCard trades={trades} timeframe={timeframe} />
        )}
        {enabledCards.includes("playbook") && (
          <PlaybookCard trades={trades} />
        )}
      </div>

      {/* Full Width Cards */}
      {enabledCards.includes("active_trades") && (
        <ActiveTradesCard trades={trades.filter(t => !t.closed_at)} />
      )}
    </div>
  );

  return renderCards();
}
