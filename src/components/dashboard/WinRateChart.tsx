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
  Area,
  ComposedChart,
} from "recharts";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/timeframeSelector";
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
import { useThemeStore } from "@/stores/themeStore";
import { CHART_COLORS, DASHBOARD_CHART_HEIGHT, getRechartsConfig } from "@/config/chartConfig";

interface WinRateChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
  height?: number;
}

const formatTooltip = (value: number) => `${(value * 100).toFixed(1)}%`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const isDarkMode = useThemeStore.getState().isDark;
  
  return (
    <div className={`p-3 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border border-border`}>
      <div className="font-medium">{label}</div>
      <div className="text-sm mt-1">
        <span className="font-medium">Win Rate:</span> {formatTooltip(data.winRate)}
      </div>
      <div className="text-sm">
        <span className="font-medium">Wins:</span> {data.wins}
      </div>
      <div className="text-sm">
        <span className="font-medium">Losses:</span> {data.losses}
      </div>
      <div className="text-sm">
        <span className="font-medium">Total Trades:</span> {data.total}
      </div>
    </div>
  );
};

export function WinRateChart({ 
  trades, 
  timeframe,
  height = DASHBOARD_CHART_HEIGHT
}: WinRateChartProps) {
  const timeframeFilteredTrades = useTimeframeFilteredTrades(trades, timeframe);
  const isDarkMode = useThemeStore((state) => state.isDark);
  const chartConfig = getRechartsConfig(isDarkMode);

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

      const wins = periodTrades.filter((t) => (t.pnl || 0) > 0).length;
      const total = periodTrades.length;
      const winRate = total > 0 ? wins / total : 0;

      return {
        date: format(intervalStart, dateFormat),
        winRate,
        wins,
        losses: total - wins,
        total,
      };
    });
  }, [timeframeFilteredTrades, timeframe]);

  if (!timeframeFilteredTrades.length) {
    return (
      <div className={`w-full h-[${height}px] flex items-center justify-center text-muted-foreground`}>
        No trade data available for the selected timeframe.
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className={`w-full h-[${height}px] flex items-center justify-center text-muted-foreground`}>
        No trades found in the selected time periods.
      </div>
    );
  }

  const maxWinRate = Math.max(...chartData.map((d) => d.winRate));
  const yAxisDomain = [0, Math.max(1, Math.ceil(maxWinRate * 10) / 10)];

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={chartConfig.margins}>
          <defs>
            <linearGradient id="colorWinRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.successGradient.start} />
              <stop offset="95%" stopColor={CHART_COLORS.successGradient.end} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
            stroke={chartConfig.textColor}
          />
          <YAxis
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            domain={yAxisDomain}
            tick={{ fontSize: 12 }}
            stroke={chartConfig.textColor}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={0.5} stroke={chartConfig.textColor} strokeDasharray="3 3" />
          <Area
            name="Win Rate"
            type="monotone"
            dataKey="winRate"
            stroke={CHART_COLORS.success}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorWinRate)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
