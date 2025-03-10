import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { Trade } from "@/types/trade";
import { useMemo, useState, useEffect, useRef } from "@/lib/react";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useThemeStore } from "@/stores/themeStore";
import { useChartStore } from "@/stores/chartStore";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { isSmallerThan } from "@/utils/responsiveUtils";
import { getRechartsConfig } from "@/config/chartConfig";

interface TradeDistributionChartProps {
  trades: Trade[];
  height?: number;
}

interface TradeDistributionData {
  name: string;
  value: number;
  pnl: number;
  color: string;
  percentage: number;
}

const COLORS = {
  bigWin: "hsl(142, 76%, 36%)", // Green
  win: "hsl(142, 76%, 46%)",
  smallWin: "hsl(142, 76%, 56%)",
  breakeven: "hsl(215, 16%, 47%)", // Gray
  smallLoss: "hsl(346, 87%, 63%)",
  loss: "hsl(346, 87%, 53%)",
  bigLoss: "hsl(346, 87%, 43%)", // Red
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const isDarkMode = useThemeStore.getState().isDark;
  const getTextSize = useChartStore.getState().getTextSize;
  const tooltipFontSize = getTextSize('tooltip', 'dashboard');
  
  return (
    <div className={`p-2 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border border-border`}>
      <div className="font-medium text-base" style={{ fontSize: `${tooltipFontSize}px` }}>{data.name}</div>
      <div className="space-y-1 mt-1" style={{ fontSize: `${tooltipFontSize - 1}px` }}>
        <div>
          <span className="font-medium">Count:</span> {data.value}
        </div>
        <div>
          <span className="font-medium">P&L:</span> {formatCurrency(data.pnl)}
        </div>
        <div>
          <span className="font-medium">Percentage:</span> {formatPercent(data.percentage)}
        </div>
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }: any) => {
  if (!payload || !payload.length) return null;
  
  const getTextSize = useChartStore.getState().getTextSize;
  const legendFontSize = getTextSize('legend', 'dashboard');
  
  return (
    <div className="flex flex-col space-y-1 p-2">
      <h3 className="text-sm font-medium mb-1" style={{ fontSize: `${legendFontSize + 1}px` }}>Distribution</h3>
      <div className="grid grid-cols-1 gap-1">
        {payload.map((entry: any, index: number) => {
          // Get the original data item from the entry
          const item = entry.payload || entry;
          
          return (
            <div key={`legend-${index}`} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color || entry.color }}
              />
              <span className="font-medium" style={{ fontSize: `${legendFontSize}px` }}>{item.name || entry.value}</span>
              {item.percentage !== undefined && (
                <span className="text-muted-foreground" style={{ fontSize: `${legendFontSize - 1}px` }}>
                  ({formatPercent(item.percentage)})
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Define RADIAN constant
const RADIAN = Math.PI / 180;

export function TradeDistributionChart({
  trades,
  height
}: TradeDistributionChartProps) {
  const filteredTrades = useFilteredTrades(trades);
  const { isDark } = useThemeStore();
  const getChartHeight = useChartStore((state) => state.getChartHeight);
  const getTextSize = useChartStore((state) => state.getTextSize);
  const getComponentSpacing = useChartStore((state) => state.getComponentSpacing);
  
  const [chartWidth, setChartWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Get spacing from chart store
  const spacing = getComponentSpacing('dashboard');
  
  // Calculate chart height
  const chartHeight = height || getChartHeight("dashboard") - 24; // Reduce height to account for spacing
  
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

    // Count trades by category
    const categories = {
      bigWin: { count: 0, pnl: 0, color: COLORS.bigWin },
      win: { count: 0, pnl: 0, color: COLORS.win },
      smallWin: { count: 0, pnl: 0, color: COLORS.smallWin },
      breakeven: { count: 0, pnl: 0, color: COLORS.breakeven },
      smallLoss: { count: 0, pnl: 0, color: COLORS.smallLoss },
      loss: { count: 0, pnl: 0, color: COLORS.loss },
      bigLoss: { count: 0, pnl: 0, color: COLORS.bigLoss },
    };

    // Categorize trades
    filteredTrades.forEach(trade => {
      const pnl = trade.pnl || 0;
      const absValue = Math.abs(pnl);

      if (pnl > 0) {
        if (absValue > 1000) {
          categories.bigWin.count++;
          categories.bigWin.pnl += pnl;
        } else if (absValue > 100) {
          categories.win.count++;
          categories.win.pnl += pnl;
        } else {
          categories.smallWin.count++;
          categories.smallWin.pnl += pnl;
        }
      } else if (pnl < 0) {
        if (absValue > 1000) {
          categories.bigLoss.count++;
          categories.bigLoss.pnl += pnl;
        } else if (absValue > 100) {
          categories.loss.count++;
          categories.loss.pnl += pnl;
        } else {
          categories.smallLoss.count++;
          categories.smallLoss.pnl += pnl;
        }
      } else {
        categories.breakeven.count++;
      }
    });

    // Convert to chart data format
    const total = filteredTrades.length;
    const result: TradeDistributionData[] = [
      { name: "Big Win", value: categories.bigWin.count, pnl: categories.bigWin.pnl, color: COLORS.bigWin, percentage: categories.bigWin.count / total },
      { name: "Win", value: categories.win.count, pnl: categories.win.pnl, color: COLORS.win, percentage: categories.win.count / total },
      { name: "Small Win", value: categories.smallWin.count, pnl: categories.smallWin.pnl, color: COLORS.smallWin, percentage: categories.smallWin.count / total },
      { name: "Breakeven", value: categories.breakeven.count, pnl: categories.breakeven.pnl, color: COLORS.breakeven, percentage: categories.breakeven.count / total },
      { name: "Small Loss", value: categories.smallLoss.count, pnl: categories.smallLoss.pnl, color: COLORS.smallLoss, percentage: categories.smallLoss.count / total },
      { name: "Loss", value: categories.loss.count, pnl: categories.loss.pnl, color: COLORS.loss, percentage: categories.loss.count / total },
      { name: "Big Loss", value: categories.bigLoss.count, pnl: categories.bigLoss.pnl, color: COLORS.bigLoss, percentage: categories.bigLoss.count / total },
    ];

    // Filter out categories with no trades
    return result.filter(item => item.value > 0);
  }, [filteredTrades]);

  // Custom label renderer for pie chart
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null; // Don't show labels for small segments
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={isDark ? "#fff" : "#000"}
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={getTextSize('tooltip', 'dashboard')}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!filteredTrades.length) {
    return (
      <div className="w-full flex items-center justify-center text-muted-foreground" style={{ height: `${chartHeight}px` }}>
        <span style={{ fontSize: `${getTextSize('title', 'dashboard')}px` }}>No trade data available</span>
      </div>
    );
  }
  
  return (
    <div ref={chartRef} className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Distribution</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={chartHeight} className="mt-2">
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={chartHeight / 2.5}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={<CustomLegend />}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '16px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
