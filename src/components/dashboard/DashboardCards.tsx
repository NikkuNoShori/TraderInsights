import type { Trade } from "@/types/trade";
import { useMemo } from "@/lib/react";
import { StatsCard } from "./StatsCard";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Receipt,
} from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/format";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { WinRateChart } from "./WinRateChart";
import { PnLChart } from "./PnLChart";
import { TradeDistributionChart } from "./TradeDistributionChart";
import { DashboardConfig } from "./DashboardConfig";
import { useDashboardStore, type CardType } from "@/stores/dashboardStore";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";

interface DashboardCardsProps {
  trades: Trade[];
  timeframe: TimeframeOption;
  section: "dashboard" | "journal";
}

type StatCardType = "total_pnl" | "win_rate" | "profit_factor" | "largest_trade";

type StatCardData = {
  title: string;
  value: string;
  description: string;
  trend: "up" | "down";
  trendValue: string;
};

export function DashboardCards({ trades, timeframe, section }: DashboardCardsProps) {
  const { stats, isLoading } = useFilteredTrades();
  const enabledCards = useDashboardStore((state) => state.enabledCards[section]);

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
    largest_trade: {
      title: "Largest Trade",
      value: formatCurrency(Math.max(Math.abs(stats.largestWin), Math.abs(stats.largestLoss))),
      description: "Largest single trade P&L",
      trend: stats.largestWin > Math.abs(stats.largestLoss) ? "up" : "down",
      trendValue: formatCurrency(stats.averageLoss),
    },
  } as const), [stats]);

  const renderEmptyState = () => (
    <div className="w-full max-w-[1200px] mx-auto space-y-4">
      <div className="flex justify-end">
        <DashboardConfig section={section} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(statCards).map(([id, card]) => (
          enabledCards.includes(id as CardType) && (
            <StatsCard
              key={id}
              {...card}
              isLoading={true}
            />
          )
        ))}
      </div>

      {enabledCards.includes("win_rate_chart") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card dark:bg-dark-paper p-4 rounded-lg border border-border dark:border-dark-border">
            <h3 className="text-lg font-medium mb-3">Win Rate Over Time</h3>
            <WinRateChart trades={[]} timeframe={timeframe} />
          </div>
          {enabledCards.includes("pnl_chart") && (
            <div className="bg-card dark:bg-dark-paper p-4 rounded-lg border border-border dark:border-dark-border">
              <h3 className="text-lg font-medium mb-3">P&L Over Time</h3>
              <PnLChart trades={[]} timeframe={timeframe} />
            </div>
          )}
        </div>
      )}

      {enabledCards.includes("trade_distribution") && (
        <div className="bg-card dark:bg-dark-paper p-4 rounded-lg border border-border dark:border-dark-border">
          <h3 className="text-lg font-medium mb-3">Trade Distribution</h3>
          <TradeDistributionChart trades={[]} timeframe={timeframe} />
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="w-full max-w-[1200px] mx-auto space-y-4">
      <div className="flex justify-end">
        <DashboardConfig section={section} />
      </div>
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

      {enabledCards.includes("win_rate_chart") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card dark:bg-dark-paper p-4 rounded-lg border border-border dark:border-dark-border">
            <h3 className="text-lg font-medium mb-3">Win Rate Over Time</h3>
            <WinRateChart trades={trades} timeframe={timeframe} />
          </div>
          {enabledCards.includes("pnl_chart") && (
            <div className="bg-card dark:bg-dark-paper p-4 rounded-lg border border-border dark:border-dark-border">
              <h3 className="text-lg font-medium mb-3">P&L Over Time</h3>
              <PnLChart trades={trades} timeframe={timeframe} />
            </div>
          )}
        </div>
      )}

      {enabledCards.includes("trade_distribution") && (
        <div className="bg-card dark:bg-dark-paper p-4 rounded-lg border border-border dark:border-dark-border">
          <h3 className="text-lg font-medium mb-3">Trade Distribution</h3>
          <TradeDistributionChart trades={trades} timeframe={timeframe} />
        </div>
      )}
    </div>
  );

  return trades.length === 0 ? renderEmptyState() : renderStats();
}
