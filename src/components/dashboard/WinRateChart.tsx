import { useMemo } from "react";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import { formatCurrency } from "@/lib/utils/formatters";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WinRateChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
}

export function WinRateChart({ trades, timeframe }: WinRateChartProps) {
  const chartData = useMemo(() => {
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let runningWins = 0;
    let runningTotal = 0;

    return sortedTrades.map((trade) => {
      runningTotal++;
      if ((trade.pnl || 0) > 0) {
        runningWins++;
      }

      return {
        date: new Date(trade.created_at).toLocaleDateString(),
        winRate: (runningWins / runningTotal) * 100,
        pnl: trade.pnl || 0,
      };
    });
  }, [trades]);

  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No trades available
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "winRate") {
                return [`${value.toFixed(1)}%`, "Win Rate"];
              }
              return [formatCurrency(value), "P&L"];
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="winRate"
            stroke="#10b981"
            dot={false}
            name="winRate"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="pnl"
            stroke="#6366f1"
            dot={false}
            name="pnl"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
