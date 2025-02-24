import { memo } from "react";
import { StatsCard } from "./StatsCard";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import type { Trade } from "../../types/trade";
import { formatCurrency } from "../../utils/formatters";
import type { TimeframeOption } from "../ui/TimeframeSelector";

interface PerformanceMetricsProps {
  trades: Trade[];
  timeframe: TimeframeOption;
}

interface MetricCalculations {
  completedTrades: Trade[];
  winningTrades: Trade[];
  winRate: number;
  totalPnL: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  riskRewardRatio: number;
}

function calculateMetrics(trades: Trade[]): MetricCalculations {
  const completedTrades = trades.filter((trade) => trade.status === "closed");
  const winningTrades = completedTrades.filter((t) => (t.pnl || 0) > 0);
  const losingTrades = completedTrades.filter((t) => (t.pnl || 0) <= 0);

  const winRate = completedTrades.length
    ? winningTrades.length / completedTrades.length
    : 0;
  const totalPnL = completedTrades.reduce(
    (sum, trade) => sum + (trade.pnl || 0),
    0,
  );

  const gains = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const losses = Math.abs(
    losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
  );

  const avgWin = winningTrades.length ? gains / winningTrades.length : 0;
  const avgLoss = losingTrades.length ? losses / losingTrades.length : 0;
  const profitFactor = losses === 0 ? gains : gains / losses;
  const riskRewardRatio = avgLoss === 0 ? avgWin : Math.abs(avgWin / avgLoss);

  return {
    completedTrades,
    winningTrades,
    winRate,
    totalPnL,
    profitFactor,
    avgWin,
    avgLoss,
    riskRewardRatio,
  };
}

export const PerformanceMetrics = memo(
  ({ trades }: PerformanceMetricsProps) => {
    const completedTrades = trades.filter((trade) => trade.status === "closed");
    const metrics = calculateMetrics(completedTrades);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total P&L"
          value={formatCurrency(metrics.totalPnL)}
          icon={faDollarSign}
          trend={metrics.totalPnL > 0 ? "up" : "down"}
          className="bg-card border border-border shadow-sm"
        />
        {/* Add other StatsCards here */}
      </div>
    );
  },
);

PerformanceMetrics.displayName = "PerformanceMetrics";
