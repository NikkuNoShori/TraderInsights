import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Trade } from "../../types/trade";

interface TradeAnalyticsProps {
  trades: Trade[];
  timeframe?: "1W" | "1M" | "3M" | "YTD" | "1Y";
}

export function TradeAnalytics({
  trades,
  timeframe = "1M",
}: TradeAnalyticsProps) {
  const calculateMetrics = () => {
    if (trades.length === 0) {
      return {
        profitLoss: 0,
        winRate: 0,
        totalTrades: 0,
        winningTrades: 0,
        averageWin: 0,
        averageLoss: 0,
      };
    }

    const tradeResults = trades.map((trade) => {
      const amount = trade.price * trade.quantity;
      return trade.side === "Short" ? amount : -amount;
    });

    const winningTrades = tradeResults.filter((result) => result > 0);
    const losingTrades = tradeResults.filter((result) => result < 0);

    const profitLoss = tradeResults.reduce((sum, result) => sum + result, 0);
    const winRate = (winningTrades.length / trades.length) * 100;

    const averageWin =
      winningTrades.length > 0
        ? winningTrades.reduce((sum, win) => sum + win, 0) /
          winningTrades.length
        : 0;

    const averageLoss =
      losingTrades.length > 0
        ? Math.abs(
            losingTrades.reduce((sum, loss) => sum + loss, 0) /
              losingTrades.length,
          )
        : 0;

    return {
      profitLoss,
      winRate,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      averageWin,
      averageLoss,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-dark-muted">
            Total P/L
          </h3>
          <p
            className={`mt-2 text-2xl font-semibold ${
              metrics.profitLoss >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {metrics.profitLoss >= 0 ? "+" : ""}${metrics.profitLoss.toFixed(2)}
          </p>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-dark-muted">
            Win Rate
          </h3>
          <p
            className={`mt-2 text-2xl font-semibold ${
              metrics.winRate > 50
                ? "text-emerald-600 dark:text-emerald-400"
                : metrics.winRate < 50
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-gray-900 dark:text-dark-text"
            }`}
          >
            {metrics.winRate.toFixed(1)}%
          </p>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-dark-muted">
            Average Win
          </h3>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            ${metrics.averageWin.toFixed(2)}
          </p>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-dark-muted">
            Average Loss
          </h3>
          <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-400">
            ${metrics.averageLoss.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
          Performance Chart
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trades}>
              <XAxis
                dataKey="date"
                tickFormatter={(date: string) =>
                  format(new Date(date), "MMM d")
                }
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                labelFormatter={(date: string) => format(new Date(date), "PPp")}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                contentStyle={{
                  backgroundColor: "rgb(30 41 59)",
                  border: "none",
                  borderRadius: "0.375rem",
                  color: "#f1f5f9",
                }}
                itemStyle={{ color: "#f1f5f9" }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#0ea5e9" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
