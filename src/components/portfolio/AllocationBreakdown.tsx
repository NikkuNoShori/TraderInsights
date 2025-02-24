import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  DollarSign,
  PieChart as PieIcon,
  Percent,
  AlertTriangle,
} from "lucide-react";
import type { Trade } from "../../types/portfolio";

interface AllocationData {
  symbol: string;
  value: number;
  percentage: number;
  risk: number;
}

interface AllocationBreakdownProps {
  trades: Trade[];
}

export function AllocationBreakdown({ trades }: AllocationBreakdownProps) {
  const calculateAllocations = (): AllocationData[] => {
    const positions = trades.reduce(
      (acc, trade) => {
        if (!acc[trade.symbol]) {
          acc[trade.symbol] = { shares: 0, value: 0 };
        }

        const tradeValue = trade.price * trade.shares;
        acc[trade.symbol].shares +=
          trade.type === "buy" ? trade.shares : -trade.shares;
        acc[trade.symbol].value +=
          trade.type === "buy" ? tradeValue : -tradeValue;

        return acc;
      },
      {} as Record<string, { shares: number; value: number }>,
    );

    const totalValue = Object.values(positions).reduce(
      (sum, pos) => sum + Math.abs(pos.value),
      0,
    );

    return Object.entries(positions)
      .map(([symbol, position]) => ({
        symbol,
        value: Math.abs(position.value),
        percentage: (Math.abs(position.value) / totalValue) * 100,
        risk: position.value < 0 ? 0 : (position.value / totalValue) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const allocations = calculateAllocations();
  const COLORS = ["#0ea5e9", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card p-6">
          <h3 className="heading-3 mb-4">Portfolio Allocation</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocations}
                  dataKey="value"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ symbol, percentage }) =>
                    `${symbol} (${formatPercent(percentage)})`
                  }
                >
                  {allocations.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(30 41 59)",
                    border: "none",
                    borderRadius: "0.375rem",
                    color: "#f1f5f9",
                  }}
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Position Size",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Position Details */}
        <div className="card p-6">
          <h3 className="heading-3 mb-4">Position Details</h3>
          <div className="space-y-4">
            {allocations.map(({ symbol, value, percentage, risk }) => (
              <div key={symbol} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-dark-text">
                    {symbol}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="inline-flex items-center text-sm text-gray-500 dark:text-dark-muted">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(value)}
                    </span>
                    <span className="inline-flex items-center text-sm text-gray-500 dark:text-dark-muted">
                      <Percent className="h-4 w-4 mr-1" />
                      {formatPercent(percentage)}
                    </span>
                  </div>
                </div>
                {percentage > 20 && (
                  <div className="flex items-center text-amber-500 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="ml-2 text-sm">High Concentration</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="card p-6">
        <h3 className="heading-3 mb-4">Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allocations.length > 0 && (
            <>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-muted">
                  Largest Position
                </p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-dark-text">
                  {allocations[0].symbol}
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-muted">
                  {formatPercent(allocations[0].percentage)} of portfolio
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-muted">
                  Position Count
                </p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-dark-text">
                  {allocations.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-muted">
                  Risk Score
                </p>
                <p
                  className={`mt-1 text-xl font-semibold ${
                    allocations[0].percentage > 20
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-emerald-500 dark:text-emerald-400"
                  }`}
                >
                  {allocations[0].percentage > 20 ? "High" : "Moderate"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
