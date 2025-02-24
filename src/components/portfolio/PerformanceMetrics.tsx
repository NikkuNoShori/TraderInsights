import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Activity,
  Percent,
} from "lucide-react";
import type { PortfolioMetrics } from "@/types/portfolio";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend = "neutral",
  subtitle,
}: MetricCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-dark-muted">
            {title}
          </p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              trend === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : trend === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-gray-900 dark:text-dark-text"
            }`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${
            trend === "up"
              ? "bg-emerald-100 dark:bg-emerald-900/30"
              : trend === "down"
                ? "bg-rose-100 dark:bg-rose-900/30"
                : "bg-gray-100 dark:bg-dark-paper"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              trend === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : trend === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-gray-600 dark:text-dark-muted"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

interface PerformanceMetricsProps {
  metrics: PortfolioMetrics;
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Value"
          value={formatCurrency(metrics.totalValue)}
          icon={DollarSign}
          trend="neutral"
        />
        <MetricCard
          title="Total P/L"
          value={formatCurrency(metrics.totalGainLoss)}
          icon={TrendingUp}
          trend={metrics.totalGainLoss >= 0 ? "up" : "down"}
          subtitle={`${formatPercent(metrics.totalGainLossPercent)} overall`}
        />
        <MetricCard
          title="Win Rate"
          value={formatPercent(metrics.winRate)}
          icon={Activity}
          trend={
            metrics.winRate > 50
              ? "up"
              : metrics.winRate < 50
                ? "down"
                : "neutral"
          }
          subtitle={`${metrics.winningTrades} of ${metrics.tradeCount} trades`}
        />
        <MetricCard
          title="Profit Factor"
          value={metrics.profitFactor.toFixed(2)}
          icon={Percent}
          trend={
            metrics.profitFactor > 1
              ? "up"
              : metrics.profitFactor < 1
                ? "down"
                : "neutral"
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Average Win"
          value={formatCurrency(metrics.averageWin)}
          icon={TrendingUp}
          trend="up"
        />
        <MetricCard
          title="Average Loss"
          value={formatCurrency(metrics.averageLoss)}
          icon={TrendingDown}
          trend="down"
        />
        <MetricCard
          title="Average Holding Period"
          value={`${metrics.averageHoldingPeriod} days`}
          icon={Clock}
          trend="neutral"
        />
      </div>
    </div>
  );
}
