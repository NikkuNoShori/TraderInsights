import { useMemo } from "@/lib/react";
import { subDays, isWithinInterval, startOfYear } from "date-fns";
import { StatsCard } from "./StatsCard";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Target,
  Percent,
} from "lucide-react";
import type { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/formatters";

interface TradeStatisticsProps {
  trades: Trade[];
  timeframe?: "1W" | "1M" | "3M" | "YTD" | "1Y";
  isLoading?: boolean;
}

interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  profitFactor: number;
  avgTrade: number;
  maxDrawdown: number;
  avgWinningTrade: number;
  avgLosingTrade: number;
  riskRewardRatio: number;
  expectancy: number;
}

export function TradeStatistics({
  trades,
  timeframe = "1M",
  isLoading,
}: TradeStatisticsProps) {
  const stats = useMemo((): TradeStats => {
    const now = new Date();
    const filterDate = {
      "1W": subDays(now, 7),
      "1M": subDays(now, 30),
      "3M": subDays(now, 90),
      YTD: startOfYear(now),
      "1Y": subDays(now, 365),
    }[timeframe];

    const filteredTrades = trades.filter((trade) =>
      isWithinInterval(new Date(trade.date), {
        start: filterDate,
        end: now,
      }),
    );

    // Basic Statistics
    const totalTrades = filteredTrades.length;
    const winningTrades = filteredTrades.filter((trade) => (trade.pnl ?? 0) > 0).length;
    const losingTrades = filteredTrades.filter((trade) => (trade.pnl ?? 0) < 0).length;
    const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

    // Profit/Loss Calculations
    const grossProfit = filteredTrades.reduce(
      (sum, trade) => sum + ((trade.pnl ?? 0) > 0 ? (trade.pnl ?? 0) : 0),
      0,
    );
    const grossLoss = Math.abs(
      filteredTrades.reduce(
        (sum, trade) => sum + ((trade.pnl ?? 0) < 0 ? (trade.pnl ?? 0) : 0),
        0,
      ),
    );
    const netProfit = filteredTrades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0);

    // Advanced Metrics
    const profitFactor = grossLoss === 0 ? 0 : grossProfit / grossLoss;
    const avgTrade = totalTrades > 0 ? netProfit / totalTrades : 0;
    const maxDrawdown = Math.abs(
      filteredTrades.reduce((max, trade) => Math.min(max, trade.pnl ?? 0), 0),
    );

    const winningTradesArr = filteredTrades.filter((trade) => (trade.pnl ?? 0) > 0);
    const losingTradesArr = filteredTrades.filter((trade) => (trade.pnl ?? 0) < 0);

    const avgWinningTrade =
      winningTradesArr.length > 0
        ? winningTradesArr.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0) /
          winningTradesArr.length
        : 0;
    const avgLosingTrade =
      losingTradesArr.length > 0
        ? Math.abs(losingTradesArr.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0)) /
          losingTradesArr.length
        : 0;
    const riskRewardRatio =
      avgLosingTrade === 0 ? 0 : avgWinningTrade / avgLosingTrade;
    const expectancy =
      winRate * avgWinningTrade - (1 - winRate) * avgLosingTrade;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      grossProfit,
      grossLoss,
      netProfit,
      profitFactor,
      avgTrade,
      maxDrawdown,
      avgWinningTrade,
      avgLosingTrade,
      riskRewardRatio,
      expectancy,
    };
  }, [trades, timeframe]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatsCard
        title="Net P&L"
        value={formatCurrency(stats.netProfit)}
        icon={DollarSign}
        trendDirection={stats.netProfit >= 0 ? "up" : "down"}
        trend={formatCurrency(Math.abs(stats.netProfit))}
        subtitle="Total profit/loss across all trades"
        isLoading={isLoading}
      />

      <StatsCard
        title="Win Rate"
        value={`${(stats.winRate * 100).toFixed(1)}%`}
        icon={TrendingUp}
        trendDirection={stats.winRate >= 0.5 ? "up" : "down"}
        trend={`${stats.winningTrades} winning trades`}
        subtitle="Percentage of profitable trades"
        isLoading={isLoading}
      />

      <StatsCard
        title="Profit Factor"
        value={stats.profitFactor.toFixed(2)}
        icon={TrendingDown}
        trendDirection={stats.profitFactor >= 1.5 ? "up" : "down"}
        trend={`${formatCurrency(stats.grossProfit)} / ${formatCurrency(stats.grossLoss)}`}
        subtitle="Ratio of gross profit to gross loss"
        isLoading={isLoading}
      />

      <StatsCard
        title="Risk/Reward"
        value={stats.riskRewardRatio.toFixed(2)}
        icon={Target}
        trendDirection={stats.riskRewardRatio >= 2 ? "up" : "down"}
        trend={`${formatCurrency(stats.avgWinningTrade)} / ${formatCurrency(stats.avgLosingTrade)}`}
        subtitle="Ratio of average win to average loss"
        isLoading={isLoading}
      />

      <StatsCard
        title="Expectancy"
        value={formatCurrency(stats.expectancy)}
        icon={Percent}
        trendDirection={stats.expectancy > 0 ? "up" : "down"}
        trend={`${(stats.winRate * 100).toFixed(1)}% win rate`}
        subtitle="Expected value per trade"
        isLoading={isLoading}
      />

      <StatsCard
        title="Total Trades"
        value={stats.totalTrades.toString()}
        icon={Activity}
        subtitle={`${stats.winningTrades} winning / ${stats.losingTrades} losing`}
        isLoading={isLoading}
      />
    </div>
  );
}
