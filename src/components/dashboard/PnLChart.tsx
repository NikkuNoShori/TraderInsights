import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import { formatCurrency } from "@/utils/formatters";
import { useMemo } from "@/lib/react";
import {
  format,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  eachHourOfInterval,
  addHours,
} from "date-fns";
import { useTimeframeFilteredTrades } from "@/hooks/useTimeframeFilteredTrades";

interface PnLChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
}

interface PnLData {
  date: string;
  pnl: number;
  cumulativePnL: number;
  trades: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card dark:bg-dark-paper border border-border rounded-md p-2 text-sm">
      <div className="font-medium">Date: {label}</div>
      {payload.map((item: any, index: number) => (
        <div key={index} style={{ color: item.color }}>
          {item.name}: {formatCurrency(item.value)}
          {item.name === "Period P&L" && (
            <span className="text-xs ml-1">
              ({item.payload.trades} trade{item.payload.trades !== 1 ? "s" : ""}
              )
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export function PnLChart({ trades, timeframe }: PnLChartProps) {
  const timeframeFilteredTrades = useTimeframeFilteredTrades(trades, timeframe);

  const chartData = useMemo(() => {
    if (!timeframeFilteredTrades.length) return [];

    const now = new Date();
    let start: Date;
    let end: Date;
    let dateFormat: string;
    let intervals: Date[];

    // Determine the start date and date format based on timeframe
    switch (timeframe) {
      case "1D":
        start = startOfDay(subDays(now, 1));
        end = endOfDay(start);
        dateFormat = "HH:mm";
        intervals = eachHourOfInterval({ start, end });
        break;
      case "1W":
        start = startOfDay(subDays(now, 7));
        end = endOfDay(now);
        dateFormat = "EEE";
        intervals = eachDayOfInterval({ start, end });
        break;
      case "1M":
        start = startOfDay(subMonths(now, 1));
        end = endOfDay(now);
        dateFormat = "MMM d";
        intervals = eachDayOfInterval({ start, end });
        break;
      case "3M":
        start = startOfMonth(subMonths(now, 3));
        end = endOfMonth(now);
        dateFormat = "MMM yyyy";
        intervals = eachMonthOfInterval({ start, end });
        break;
      case "YTD":
        start = new Date(now.getFullYear(), 0, 1);
        end = endOfMonth(now);
        dateFormat = "MMM yyyy";
        intervals = eachMonthOfInterval({ start, end });
        break;
      case "1Y":
        start = startOfMonth(subMonths(now, 12));
        end = endOfMonth(now);
        dateFormat = "MMM yyyy";
        intervals = eachMonthOfInterval({ start, end });
        break;
      case "ALL":
      default:
        start = startOfMonth(
          new Date(
            Math.min(
              ...timeframeFilteredTrades.map((t) =>
                new Date(t.entry_date).getTime(),
              ),
            ),
          ),
        );
        end = endOfMonth(now);
        dateFormat = "MMM yyyy";
        intervals = eachMonthOfInterval({ start, end });
    }

    let cumulativePnL = 0;

    // Create data points for each interval
    return intervals.map((intervalStart) => {
      let intervalEnd;
      switch (timeframe) {
        case "1D":
          intervalEnd = addHours(intervalStart, 1);
          break;
        case "1W":
        case "1M":
          intervalEnd = endOfDay(intervalStart);
          break;
        case "3M":
        case "YTD":
        case "1Y":
        case "ALL":
          intervalEnd = endOfMonth(intervalStart);
          break;
        default:
          intervalEnd = endOfDay(intervalStart);
      }

      const periodTrades = timeframeFilteredTrades.filter((trade) => {
        const tradeDate = new Date(trade.entry_date);
        return tradeDate >= intervalStart && tradeDate < intervalEnd;
      });

      const periodPnL = periodTrades.reduce(
        (sum, trade) => sum + (trade.pnl || 0),
        0,
      );
      cumulativePnL += periodPnL;

      return {
        date: format(intervalStart, dateFormat),
        pnl: periodPnL,
        cumulativePnL,
        trades: periodTrades.length,
      };
    });
  }, [timeframeFilteredTrades, timeframe]);

  if (!timeframeFilteredTrades.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No trade data available for the selected timeframe.
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No trades found in the selected time periods.
      </div>
    );
  }

  const minValue = Math.min(
    0,
    ...chartData.map((d) => Math.min(d.pnl, d.cumulativePnL)),
  );
  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.pnl, d.cumulativePnL)),
  );
  const padding = Math.max((maxValue - minValue) * 0.1, 100); // Ensure minimum padding

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatCurrency}
            domain={[minValue - padding, maxValue + padding]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
          <Line
            name="Period P&L"
            type="monotone"
            dataKey="pnl"
            stroke="var(--primary)"
            dot={false}
            strokeWidth={2}
          />
          <Line
            name="Cumulative P&L"
            type="monotone"
            dataKey="cumulativePnL"
            stroke="var(--success)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
