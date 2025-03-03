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
  Brush,
  ReferenceArea,
} from "recharts";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import { formatCurrency } from "@/utils/formatters";
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

interface ZoomDomain {
  start: string;
  end: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card dark:bg-dark-paper border border-border dark:border-dark-border rounded-lg shadow-lg p-3 backdrop-blur-sm">
      <div className="font-medium mb-1">{label}</div>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2 py-0.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="font-medium">{item.name}:</span>
          <span>{formatCurrency(item.value)}</span>
          {item.name === "Period P&L" && (
            <span className="text-xs text-muted-foreground ml-1">
              ({item.payload.trades} trade{item.payload.trades !== 1 ? "s" : ""})
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export function PnLChart({ trades, timeframe }: PnLChartProps) {
  const timeframeFilteredTrades = useTimeframeFilteredTrades(trades, timeframe);
  const [zoomDomain, setZoomDomain] = useState<ZoomDomain | null>(null);
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

  const handleExport = useCallback(() => {
    const csvContent = [
      ["Date", "Period P&L", "Cumulative P&L", "Trades"],
      ...chartData.map(d => [d.date, d.pnl, d.cumulativePnL, d.trades]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pnl_data_${timeframe}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [chartData, timeframe]);

  const handleZoomOut = useCallback(() => {
    setZoomDomain(null);
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

  const minValue = Math.min(0, ...chartData.map((d) => Math.min(d.pnl, d.cumulativePnL)));
  const maxValue = Math.max(...chartData.map((d) => Math.max(d.pnl, d.cumulativePnL)));
  const padding = Math.max((maxValue - minValue) * 0.1, 100);

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {(zoomDomain || brushDomain) && (
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
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
          <LineChart
            data={chartData}
            onMouseDown={(e) => {
              if (e && typeof e.activeLabel === "string") {
                setZoomDomain({ start: e.activeLabel, end: e.activeLabel });
              }
            }}
            onMouseMove={(e) => {
              if (zoomDomain && e && typeof e.activeLabel === "string") {
                setZoomDomain({ ...zoomDomain, end: e.activeLabel });
              }
            }}
            onMouseUp={() => {
              if (zoomDomain) {
                setBrushDomain(zoomDomain);
                setZoomDomain(null);
              }
            }}
          >
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
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
              tickFormatter={formatCurrency}
              domain={[minValue - padding, maxValue + padding]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "8px" }}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
            <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
            {zoomDomain && (
              <ReferenceArea
                x1={zoomDomain.start}
                x2={zoomDomain.end}
                strokeOpacity={0.3}
                fill="var(--primary)"
                fillOpacity={0.1}
              />
            )}
            <Line
              name="Period P&L"
              type="monotone"
              dataKey="pnl"
              stroke="var(--primary)"
              fill="url(#pnlGradient)"
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 2 }}
              animationDuration={500}
            />
            <Line
              name="Cumulative P&L"
              type="monotone"
              dataKey="cumulativePnL"
              stroke="var(--success)"
              fill="url(#cumulativeGradient)"
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 2 }}
              animationDuration={500}
            />
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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
