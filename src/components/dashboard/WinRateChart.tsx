import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Brush,
  Cell,
} from "recharts";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import { useMemo, useState, useCallback } from "@/lib/react";
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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface WinRateChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
}

interface WinRateData {
  date: string;
  winRate: number;
  wins: number;
  losses: number;
  total: number;
}

interface ZoomDomain {
  start: string;
  end: string;
}

const formatTooltip = (value: number) => `${(value * 100).toFixed(1)}%`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-card dark:bg-dark-paper border border-border dark:border-dark-border rounded-lg shadow-lg p-3 backdrop-blur-sm">
      <div className="font-medium mb-1">{label}</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/80" />
          <span className="font-medium">Win Rate:</span>
          <span>{formatTooltip(data.winRate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success/80" />
          <span className="font-medium">Wins:</span>
          <span>{data.wins}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive/80" />
          <span className="font-medium">Losses:</span>
          <span>{data.losses}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Total Trades: {data.total}
        </div>
      </div>
    </div>
  );
};

export function WinRateChart({ trades, timeframe }: WinRateChartProps) {
  const timeframeFilteredTrades = useTimeframeFilteredTrades(trades, timeframe);
  const [brushDomain, setBrushDomain] = useState<ZoomDomain | null>(null);

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

  const handleExport = useCallback(() => {
    const csvContent = [
      ["Date", "Win Rate", "Wins", "Losses", "Total Trades"],
      ...chartData.map(d => [
        d.date,
        formatTooltip(d.winRate),
        d.wins,
        d.losses,
        d.total
      ]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `winrate_data_${timeframe}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [chartData, timeframe]);

  const handleResetZoom = useCallback(() => {
    setBrushDomain(null);
  }, []);

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

  const maxWinRate = Math.max(...chartData.map((d) => d.winRate));
  const yAxisDomain = [0, Math.max(1, Math.ceil(maxWinRate * 10) / 10)];

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {brushDomain && (
          <Button variant="outline" size="sm" onClick={handleResetZoom}>
            Reset Zoom
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="winRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
              domain={brushDomain ? [brushDomain.start, brushDomain.end] : ["auto", "auto"]}
            />
            <YAxis
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              domain={yAxisDomain}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "var(--muted)", opacity: 0.1 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "8px" }}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
            <Bar
              name="Win Rate"
              dataKey="winRate"
              fill="url(#winRateGradient)"
              radius={[4, 4, 0, 0]}
              animationDuration={500}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.winRate >= 0.5 ? "url(#winRateGradient)" : "var(--muted)"}
                />
              ))}
            </Bar>
            <Brush
              dataKey="date"
              height={30}
              stroke="var(--border)"
              fill="var(--background)"
              startIndex={0}
              endIndex={chartData.length - 1}
              onChange={({ startIndex, endIndex }) => {
                if (typeof startIndex === "number" && typeof endIndex === "number") {
                  setBrushDomain({
                    start: chartData[startIndex].date,
                    end: chartData[endIndex].date,
                  });
                }
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
