import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";

interface TradeDistributionChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
}

export function TradeDistributionChart({
  trades,
}: TradeDistributionChartProps) {
  // Chart implementation here
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[
              {
                name: "Wins",
                value: trades.filter((t) => (t.pnl || 0) > 0).length,
              },
              {
                name: "Losses",
                value: trades.filter((t) => (t.pnl || 0) <= 0).length,
              },
            ]}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
          >
            <Cell fill="var(--success)" />
            <Cell fill="var(--error)" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
