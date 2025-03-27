import { useMemo } from "@/lib/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/timeframeSelector";
import { useTimeframeFilteredTrades } from "@/hooks/useTimeframeFilteredTrades";
import { useThemeStore } from "@/stores/themeStore";
import { formatCurrency } from "@/utils/formatters";
import { format, parseISO } from "date-fns";
import { CHART_COLORS, DASHBOARD_CHART_HEIGHT, getRechartsConfig } from "@/config/chartConfig";

interface RechartsPnLChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
  height?: number;
}

export function RechartsPnLChart({ 
  trades, 
  timeframe,
  height = DASHBOARD_CHART_HEIGHT
}: RechartsPnLChartProps) {
  const timeframeFilteredTrades = useTimeframeFilteredTrades(trades, timeframe);
  const isDarkMode = useThemeStore((state) => state.isDark);
  const chartConfig = getRechartsConfig(isDarkMode);

  // Calculate cumulative P&L for display
  const cumulativePnL = timeframeFilteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const formattedPnL = formatCurrency(cumulativePnL);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!timeframeFilteredTrades.length) return [];

    // Sort trades by date
    const sortedTrades = [...timeframeFilteredTrades].sort(
      (a, b) => new Date(a.exit_date || a.entry_date).getTime() - new Date(b.exit_date || b.entry_date).getTime()
    );

    // Calculate cumulative P&L
    let runningPnL = 0;
    return sortedTrades.map(trade => {
      const tradePnL = trade.pnl || 0;
      runningPnL += tradePnL;
      
      return {
        date: format(new Date(trade.exit_date || trade.entry_date), 'MMM dd'),
        pnl: tradePnL,
        cumulativePnL: runningPnL,
        // Include additional data for tooltip
        symbol: trade.symbol,
        side: trade.side,
        rawDate: trade.exit_date || trade.entry_date
      };
    });
  }, [timeframeFilteredTrades]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border border-border`}>
          <p className="font-medium">{format(new Date(data.rawDate), 'MMM dd, yyyy')}</p>
          <p className="text-sm">
            <span className="font-medium">Trade P&L:</span> {formatCurrency(data.pnl)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Cumulative P&L:</span> {formatCurrency(data.cumulativePnL)}
          </p>
          {data.symbol && (
            <p className="text-sm">
              <span className="font-medium">Symbol:</span> {data.symbol}
            </p>
          )}
          {data.side && (
            <p className="text-sm">
              <span className="font-medium">Side:</span> {data.side}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!timeframeFilteredTrades.length) {
    return (
      <div className={`w-full h-[${height}px] rounded-lg border border-border bg-card p-4 flex items-center justify-center text-muted-foreground`}>
        No trade data available for the selected timeframe.
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex justify-between items-center">
        <h4 className="text-sm font-medium">Cumulative P&L: {formattedPnL}</h4>
      </div>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={chartConfig.margins}>
            <defs>
              <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primaryGradient.start} />
                <stop offset="95%" stopColor={CHART_COLORS.primaryGradient.end} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />
            <XAxis 
              dataKey="date" 
              stroke={chartConfig.textColor} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke={chartConfig.textColor} 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke={chartConfig.textColor} strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="cumulativePnL"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPnL)"
            />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke={CHART_COLORS.success}
              strokeWidth={1}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 
import { useMemo } from "@/lib/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/timeframeSelector";
import { useTimeframeFilteredTrades } from "@/hooks/useTimeframeFilteredTrades";
import { useThemeStore } from "@/stores/themeStore";
import { formatCurrency } from "@/utils/formatters";
import { format, parseISO } from "date-fns";
import { CHART_COLORS, DASHBOARD_CHART_HEIGHT, getRechartsConfig } from "@/config/chartConfig";

interface RechartsPnLChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
  height?: number;
}

export function RechartsPnLChart({ 
  trades, 
  timeframe,
  height = DASHBOARD_CHART_HEIGHT
}: RechartsPnLChartProps) {
  const timeframeFilteredTrades = useTimeframeFilteredTrades(trades, timeframe);
  const isDarkMode = useThemeStore((state) => state.isDark);
  const chartConfig = getRechartsConfig(isDarkMode);

  // Calculate cumulative P&L for display
  const cumulativePnL = timeframeFilteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const formattedPnL = formatCurrency(cumulativePnL);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!timeframeFilteredTrades.length) return [];

    // Sort trades by date
    const sortedTrades = [...timeframeFilteredTrades].sort(
      (a, b) => new Date(a.exit_date || a.entry_date).getTime() - new Date(b.exit_date || b.entry_date).getTime()
    );

    // Calculate cumulative P&L
    let runningPnL = 0;
    return sortedTrades.map(trade => {
      const tradePnL = trade.pnl || 0;
      runningPnL += tradePnL;
      
      return {
        date: format(new Date(trade.exit_date || trade.entry_date), 'MMM dd'),
        pnl: tradePnL,
        cumulativePnL: runningPnL,
        // Include additional data for tooltip
        symbol: trade.symbol,
        side: trade.side,
        rawDate: trade.exit_date || trade.entry_date
      };
    });
  }, [timeframeFilteredTrades]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border border-border`}>
          <p className="font-medium">{format(new Date(data.rawDate), 'MMM dd, yyyy')}</p>
          <p className="text-sm">
            <span className="font-medium">Trade P&L:</span> {formatCurrency(data.pnl)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Cumulative P&L:</span> {formatCurrency(data.cumulativePnL)}
          </p>
          {data.symbol && (
            <p className="text-sm">
              <span className="font-medium">Symbol:</span> {data.symbol}
            </p>
          )}
          {data.side && (
            <p className="text-sm">
              <span className="font-medium">Side:</span> {data.side}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!timeframeFilteredTrades.length) {
    return (
      <div className={`w-full h-[${height}px] rounded-lg border border-border bg-card p-4 flex items-center justify-center text-muted-foreground`}>
        No trade data available for the selected timeframe.
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex justify-between items-center">
        <h4 className="text-sm font-medium">Cumulative P&L: {formattedPnL}</h4>
      </div>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={chartConfig.margins}>
            <defs>
              <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primaryGradient.start} />
                <stop offset="95%" stopColor={CHART_COLORS.primaryGradient.end} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />
            <XAxis 
              dataKey="date" 
              stroke={chartConfig.textColor} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke={chartConfig.textColor} 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke={chartConfig.textColor} strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="cumulativePnL"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPnL)"
            />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke={CHART_COLORS.success}
              strokeWidth={1}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 