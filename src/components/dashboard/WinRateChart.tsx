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
  AreaChart,
} from "recharts";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/timeframeSelector";
import { useMemo, useState, useEffect } from "@/lib/react";
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
import { useChartStore } from "@/stores/chartStore";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { isSmallerThan } from "@/utils/responsiveUtils";
import { CHART_COLORS, getRechartsConfig } from "@/config/chartConfig";

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
  const getTextSize = useChartStore.getState().getTextSize;
  const tooltipFontSize = getTextSize('tooltip', 'dashboard');
  
  return (
    <div className={`p-2 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border border-border`}>
      <div className="font-medium" style={{ fontSize: `${tooltipFontSize}px` }}>{label}</div>
      <div className="mt-1" style={{ fontSize: `${tooltipFontSize - 1}px` }}>
        <span className="font-medium">Win Rate: </span>
        <span className={data.winRate > 0.5 ? 'text-emerald-500' : 'text-rose-500'}>
          {formatTooltip(data.winRate)}
        </span>
      </div>
      <div style={{ fontSize: `${tooltipFontSize - 1}px` }}>
        <span className="font-medium">Trades: </span>
        {data.totalTrades}
      </div>
    </div>
  );
};

// Helper function to format dates based on timeframe
const formatDate = (dateStr: string, timeframe: TimeframeOption) => {
  const date = new Date(dateStr);
  switch (timeframe) {
    case "1D":
    case "1W":
      return format(date, "HH:mm");
    case "1M":
    case "3M":
      return format(date, "MMM d");
    case "6M":
    case "1Y":
    case "ALL":
      return format(date, "MMM yyyy");
    default:
      return format(date, "MMM d");
  }
};

export function WinRateChart({ 
  trades, 
  timeframe,
  height
}: WinRateChartProps) {
  const filteredTrades = useTimeframeFilteredTrades(trades, timeframe);
  const { isDark } = useThemeStore();
  const getChartHeight = useChartStore((state) => state.getChartHeight);
  const getTextSize = useChartStore((state) => state.getTextSize);
  const getComponentSpacing = useChartStore((state) => state.getComponentSpacing);
  
  // Get spacing from chart store
  const spacing = getComponentSpacing('dashboard');
  
  // Calculate chart height
  const chartHeight = height || getChartHeight("dashboard");
  
  // Track if we're on a small screen
  const [isSmallScreen, setIsSmallScreen] = useState(() => isSmallerThan('md'));
  
  // Update on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(isSmallerThan('md'));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = useMemo(() => {
    if (!filteredTrades.length) return [];

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
              ...filteredTrades.map((t) =>
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

      const periodTrades = filteredTrades.filter((trade) => {
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
  }, [filteredTrades, timeframe]);

  if (!filteredTrades.length) {
    return (
      <div className={`w-full h-[${chartHeight}px] flex items-center justify-center text-muted-foreground`}>
        No trade data available for the selected timeframe.
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className={`w-full h-[${chartHeight}px] flex items-center justify-center text-muted-foreground`}>
        No trades found in the selected time periods.
      </div>
    );
  }

  const maxWinRate = Math.max(...chartData.map((d) => d.winRate));
  const yAxisDomain = [0, Math.max(1, Math.ceil(maxWinRate * 10) / 10)];

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Win Rate</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={chartHeight - 40} className="mt-2">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: getTextSize('axis', 'dashboard') }}
            tickMargin={10}
            tickFormatter={(date) => formatDate(date, timeframe)}
          />
          <YAxis 
            tickFormatter={formatTooltip}
            tick={{ fontSize: getTextSize('axis', 'dashboard') }}
            tickMargin={10}
            domain={[0, 1]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="winRate"
            stroke="#10b981"
            fill="#10b98133"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
