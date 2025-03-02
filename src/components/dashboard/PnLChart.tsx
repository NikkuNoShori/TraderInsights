import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import { formatCurrency } from "@/utils/formatters";
import { useMemo } from "@/lib/react";

interface PnLChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
}

export function PnLChart({ trades, timeframe }: PnLChartProps) {
  if (!trades || trades.length === 0) {
    return (
      <div className="text-center text-text-muted py-8">
        No trade data available for the selected timeframe.
      </div>
    );
  }

  const filteredTrades = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    switch (timeframe) {
      case "1D":
        cutoff.setDate(now.getDate() - 1);
        break;
      case "1W":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "1M":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case "YTD":
        cutoff.setMonth(0, 1); // January 1st of current year
        break;
      case "1Y":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      case "ALL":
      default:
        return trades;
    }

    return trades.filter((trade) => new Date(trade.entry_date) >= cutoff);
  }, [trades, timeframe]);

  if (filteredTrades.length === 0) {
    return (
      <div className="text-center text-text-muted py-8">
        No trade data available for the selected timeframe.
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filteredTrades}>
          <XAxis dataKey="entry_date" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Line type="monotone" dataKey="pnl" stroke="var(--primary)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
