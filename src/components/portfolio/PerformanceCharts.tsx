import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Trade as PortfolioTrade } from "../../types/portfolio";
import type { Trade } from "../../types/trade";

// Common interface for chart data
interface ChartData {
  date: string;
  value: number;
  cumulativeReturn: number;
  drawdown: number;
}

interface PerformanceChartsProps {
  trades: (PortfolioTrade | Trade)[];
}

export function PerformanceCharts({ trades }: PerformanceChartsProps) {
  const processData = (): ChartData[] => {
    let runningValue = 0;
    let peak = 0;

    return trades
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((trade) => {
        // Handle both trade types
        const tradeValue =
          "shares" in trade
            ? trade.price * trade.shares
            : trade.price * trade.quantity;

        runningValue += tradeValue;
        peak = Math.max(peak, runningValue);
        const drawdown = peak > 0 ? ((peak - runningValue) / peak) * 100 : 0;

        return {
          date: trade.date.split("T")[0],
          value: tradeValue,
          cumulativeReturn: runningValue,
          drawdown: -drawdown,
        };
      });
  };

  const chartData = processData();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${Math.abs(value).toFixed(1)}%`;

  return (
    <div className="space-y-8">
      {/* Equity Curve */}
      <div className="card p-6">
        <h3 className="heading-3 mb-4">Equity Curve</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(30 41 59)",
                  border: "none",
                  borderRadius: "0.375rem",
                  color: "#f1f5f9",
                }}
                formatter={(value: number) => [formatCurrency(value), "Equity"]}
              />
              <Area
                type="monotone"
                dataKey="cumulativeReturn"
                stroke="#0ea5e9"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drawdown Chart */}
      <div className="card p-6">
        <h3 className="heading-3 mb-4">Drawdown</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={formatPercent}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(30 41 59)",
                  border: "none",
                  borderRadius: "0.375rem",
                  color: "#f1f5f9",
                }}
                formatter={(value: number) => [
                  formatPercent(value),
                  "Drawdown",
                ]}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#e11d48"
                fillOpacity={1}
                fill="url(#colorDrawdown)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trade Distribution */}
      <div className="card p-6">
        <h3 className="heading-3 mb-4">Trade Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(30 41 59)",
                  border: "none",
                  borderRadius: "0.375rem",
                  color: "#f1f5f9",
                }}
                formatter={(value: number) => [
                  formatCurrency(value),
                  "Trade Value",
                ]}
              />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
