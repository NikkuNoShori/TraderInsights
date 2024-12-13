import React, { useMemo } from "react";
import { format, subDays, isWithinInterval, startOfYear } from "date-fns";
import { StatsCard } from "./StatsCard";
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, Percent, BarChart2 } from "lucide-react";
import { Trade } from "../../types/trade";
import {
  formatTradeValue,
  calculateWinRate,
  calculateProfitFactor,
  calculateAverageTrade,
  calculateMaxDrawdown
} from "../../utils/trade";

interface TradeStatisticsProps {
  trades: Trade[];
  timeframe?: "1W" | "1M" | "3M" | "YTD" | "1Y";
  isLoading?: boolean;
}

export function TradeStatistics({ trades, timeframe = "1M", isLoading }: TradeStatisticsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const filterDate = {
      "1W": subDays(now, 7),
      "1M": subDays(now, 30),
      "3M": subDays(now, 90),
      "YTD": startOfYear(now),
      "1Y": subDays(now, 365),
    }[timeframe];

    const filteredTrades = trades.filter(trade =>
      isWithinInterval(new Date(trade.date), {
        start: filterDate,
        end: now
      })
    );

    // Basic Statistics
    const totalTrades = filteredTrades.length;
    const winningTrades = filteredTrades.filter(trade => trade.pnl > 0);
    const losingTrades = filteredTrades.filter(trade => trade.pnl < 0);
    const winRate = calculateWinRate(filteredTrades);

    // Profit/Loss Calculations
    const grossProfit = filteredTrades.reduce((sum, trade) => sum + (trade.pnl > 0 ? trade.pnl : 0), 0);
    const grossLoss = Math.abs(filteredTrades.reduce((sum, trade) => sum + (trade.pnl < 0 ? trade.pnl : 0), 0));
    const netProfit = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);

    // Advanced Metrics
    const profitFactor = calculateProfitFactor(filteredTrades);
    const avgTrade = calculateAverageTrade(filteredTrades);
    const maxDrawdown = calculateMaxDrawdown(filteredTrades);
    const avgWinningTrade = winningTrades.length > 0
      ? winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length
      : 0;
    const avgLosingTrade = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0)) / losingTrades.length
      : 0;
    const riskRewardRatio = avgLosingTrade === 0 ? 0 : avgWinningTrade / avgLosingTrade;
    const expectancy = (winRate * avgWinningTrade) - ((1 - winRate) * avgLosingTrade);

    return {
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
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
      expectancy
    };
  }, [trades, timeframe]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatsCard
        title="Net P&L"
        value={formatTradeValue(stats.netProfit)}
        icon={DollarSign}
        trend={stats.netProfit >= 0 ? "up" : "down"}
        isLoading={isLoading}
        tooltip="Total profit/loss across all trades"
        hoverContent={
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Gross Profit:</span>
              <span className="text-green-500">{formatTradeValue(stats.grossProfit)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gross Loss:</span>
              <span className="text-red-500">{formatTradeValue(stats.grossLoss)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t">
              <span>Max Drawdown:</span>
              <span className="text-red-500">{formatTradeValue(stats.maxDrawdown)}</span>
            </div>
          </div>
        }
      />

      <StatsCard
        title="Win Rate"
        value={`${(stats.winRate * 100).toFixed(1)}%`}
        icon={TrendingUp}
        trend={stats.winRate >= 0.5 ? "up" : "down"}
        isLoading={isLoading}
        tooltip="Percentage of profitable trades"
        hoverContent={
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Winning Trades:</span>
              <span>{stats.winningTrades}</span>
            </div>
            <div className="flex justify-between">
              <span>Losing Trades:</span>
              <span>{stats.losingTrades}</span>
            </div>
            <div className="flex justify-between pt-1 border-t">
              <span>Avg Win:</span>
              <span className="text-green-500">{formatTradeValue(stats.avgWinningTrade)}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Loss:</span>
              <span className="text-red-500">{formatTradeValue(stats.avgLosingTrade)}</span>
            </div>
          </div>
        }
      />

      <StatsCard
        title="Profit Factor"
        value={stats.profitFactor.toFixed(2)}
        icon={TrendingDown}
        trend={stats.profitFactor >= 1.5 ? "up" : "down"}
        isLoading={isLoading}
        tooltip="Ratio of gross profit to gross loss"
        hoverContent={
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Gross Profit:</span>
              <span>{formatTradeValue(stats.grossProfit)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gross Loss:</span>
              <span>{formatTradeValue(stats.grossLoss)}</span>
            </div>
          </div>
        }
      />

      <StatsCard
        title="Risk/Reward"
        value={stats.riskRewardRatio.toFixed(2)}
        icon={Target}
        trend={stats.riskRewardRatio >= 2 ? "up" : "down"}
        isLoading={isLoading}
        tooltip="Ratio of average win to average loss"
        hoverContent={
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Avg Win:</span>
              <span>{formatTradeValue(stats.avgWinningTrade)}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Loss:</span>
              <span>{formatTradeValue(stats.avgLosingTrade)}</span>
            </div>
          </div>
        }
      />

      <StatsCard
        title="Expectancy"
        value={formatTradeValue(stats.expectancy)}
        icon={Percent}
        trend={stats.expectancy > 0 ? "up" : "down"}
        isLoading={isLoading}
        tooltip="Expected value per trade"
        hoverContent={
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Win Rate:</span>
              <span>{(stats.winRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Trade:</span>
              <span>{formatTradeValue(stats.avgTrade)}</span>
            </div>
          </div>
        }
      />

      <StatsCard
        title="Total Trades"
        value={stats.totalTrades.toString()}
        icon={Activity}
        isLoading={isLoading}
        tooltip="Number of trades taken"
        hoverContent={
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Winning:</span>
              <span className="text-green-500">{stats.winningTrades}</span>
            </div>
            <div className="flex justify-between">
              <span>Losing:</span>
              <span className="text-red-500">{stats.losingTrades}</span>
            </div>
          </div>
        }
      />
    </div>
  );
}
