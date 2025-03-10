import { useMemo, useState, useEffect } from "@/lib/react";
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
import { useChartStore } from "@/stores/chartStore";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { isSmallerThan } from "@/utils/responsiveUtils";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { CHART_COLORS, getRechartsConfig } from "@/config/chartConfig";

interface RechartsPnLChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
  height?: number;
}

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
    case "1Y":
    case "ALL":
      return format(date, "MMM yyyy");
    default:
      return format(date, "MMM d");
  }
};

export function RechartsPnLChart({ 
  trades, 
  timeframe,
  height
}: RechartsPnLChartProps) {
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

  // Calculate cumulative P&L for display
  const cumulativePnL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const formattedPnL = formatCurrency(cumulativePnL);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredTrades.length) return [];

    // Sort trades by date
    const sortedTrades = [...filteredTrades].sort(
      (a, b) => new Date(a.exit_date || a.entry_date).getTime() - new Date(b.exit_date || b.entry_date).getTime()
    );

    // Calculate cumulative P&L
    let runningPnL = 0;
    return sortedTrades.map(trade => {
      const pnl = trade.pnl || 0;
      runningPnL += pnl;
      return {
        date: trade.exit_date || trade.entry_date,
        pnl,
        cumulativePnL: runningPnL,
        symbol: trade.symbol,
        side: trade.side
      };
    });
  }, [filteredTrades]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    const tooltipFontSize = getTextSize('tooltip', 'dashboard');
    
    return (
      <div className="bg-card dark:bg-dark-paper border border-border dark:border-dark-border rounded-lg p-2 shadow-lg">
        <div className="font-medium" style={{ fontSize: `${tooltipFontSize}px` }}>
          {format(new Date(data.date), "MMM d, yyyy")}
        </div>
        <div className="mt-1" style={{ fontSize: `${tooltipFontSize - 1}px` }}>
          <span className="font-medium">Trade P&L: </span>
          <span className={data.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}>
            {formatCurrency(data.pnl)}
          </span>
        </div>
        <div style={{ fontSize: `${tooltipFontSize - 1}px` }}>
          <span className="font-medium">Cumulative P&L: </span>
          <span className={data.cumulativePnL >= 0 ? "text-emerald-500" : "text-rose-500"}>
            {formatCurrency(data.cumulativePnL)}
          </span>
        </div>
        <div style={{ fontSize: `${tooltipFontSize - 1}px` }}>
          <span className="font-medium">Symbol: </span>
          {data.symbol}
        </div>
        <div style={{ fontSize: `${tooltipFontSize - 1}px` }}>
          <span className="font-medium">Side: </span>
          {data.side}
        </div>
      </div>
    );
  };

  if (!filteredTrades.length) {
    return (
      <div className="w-full flex items-center justify-center text-muted-foreground" style={{ height: `${chartHeight}px` }}>
        <span style={{ fontSize: `${getTextSize('title', 'dashboard')}px` }}>No trade data available</span>
      </div>
    );
  }

  // Calculate the height for the chart container
  const chartContainerHeight = chartHeight;

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">P&L Over Time</h3>
        <div className="text-sm text-muted-foreground">
          Cumulative: <span className={cumulativePnL >= 0 ? "text-green-500" : "text-red-500"}>
            {formatCurrency(cumulativePnL)}
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={chartHeight - 40} className="mt-2">
        <ComposedChart
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
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: getTextSize('axis', 'dashboard') }}
            tickMargin={10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulativePnL"
            stroke="#10b981"
            fill="#10b98133"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="pnl" 
            stroke={isDark ? "#60a5fa" : "#3b82f6"} 
            dot={{ r: 4, fill: isDark ? "#60a5fa" : "#3b82f6", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: isDark ? "#93c5fd" : "#2563eb" }}
            name="Trade P&L"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
} 