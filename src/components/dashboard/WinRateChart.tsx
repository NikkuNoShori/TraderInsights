import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Trade } from "../../types/trade";
import type { TimeframeOption } from "../ui/TimeframeSelector";

interface WinRateChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
}

export function WinRateChart({ trades, timeframe }: WinRateChartProps) {
  // Chart implementation here
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={trades}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="winRate" fill="var(--primary)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
