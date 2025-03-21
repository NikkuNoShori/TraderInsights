import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { Trade } from "@/types/trade";
import { useMemo } from "@/lib/react";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useThemeStore } from "@/stores/themeStore";
import { DASHBOARD_CHART_HEIGHT, getRechartsConfig } from "@/config/chartConfig";

interface TradeDistributionChartProps {
  trades: Trade[];
  height?: number;
}

interface TradeDistributionData {
  name: string;
  value: number;
  pnl: number;
  color: string;
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
  
  return (
    <div className={`p-3 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border border-border`}>
      <div className="font-medium text-base">{data.name}</div>
      <div className="space-y-1 mt-2 text-sm">
        <div>
          <span className="font-medium">Count:</span> {data.value}
        </div>
        <div>
          <span className="font-medium">P&L:</span> {formatCurrency(data.pnl)}
        </div>
        <div>
          <span className="font-medium">Percentage:</span> {formatPercent(data.percentage)}
        </div>
        <div className="text-muted-foreground">
          <span className="font-medium">Avg P&L per Trade:</span> {formatCurrency(data.pnl / data.value)}
        </div>
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-sm mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-medium">{entry.value}</span>
          <span className="text-muted-foreground">
            ({formatPercent(entry.payload.percentage)})
          </span>
        </div>
      ))}
    </div>
  );
};

export function TradeDistributionChart({
  trades,
  height = DASHBOARD_CHART_HEIGHT
}: TradeDistributionChartProps) {
  const filteredTrades = useFilteredTrades(trades);
  const isDarkMode = useThemeStore((state) => state.isDark);
  const chartConfig = getRechartsConfig(isDarkMode);

  const chartData = useMemo(() => {
    if (!filteredTrades.length) return [];

    // Calculate average P&L for categorization
    const avgPnL =
      filteredTrades.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0) /
      filteredTrades.length;

    // Categorize trades
    const categories = filteredTrades.reduce(
      (acc, trade) => {
        const pnl = trade.pnl || 0;

        let category;
        if (pnl > avgPnL * 2) category = "bigWin";
        else if (pnl > avgPnL) category = "win";
        else if (pnl > 0) category = "smallWin";
        else if (pnl === 0) category = "breakeven";
        else if (pnl > -avgPnL) category = "smallLoss";
        else if (pnl > -avgPnL * 2) category = "loss";
        else category = "bigLoss";

        if (!acc[category]) {
          acc[category] = { count: 0, pnl: 0 };
        }
        acc[category].count++;
        acc[category].pnl += pnl;
        return acc;
      },
      {} as Record<string, { count: number; pnl: number }>,
    );

    // Convert to chart data format
    const data: TradeDistributionData[] = [
      {
        name: "Big Wins (>2x Avg)",
        value: categories.bigWin?.count || 0,
        pnl: categories.bigWin?.pnl || 0,
        color: COLORS.bigWin,
      },
      {
        name: "Wins (1-2x Avg)",
        value: categories.win?.count || 0,
        pnl: categories.win?.pnl || 0,
        color: COLORS.win,
      },
      {
        name: "Small Wins (<1x Avg)",
        value: categories.smallWin?.count || 0,
        pnl: categories.smallWin?.pnl || 0,
        color: COLORS.smallWin,
      },
      {
        name: "Breakeven",
        value: categories.breakeven?.count || 0,
        pnl: categories.breakeven?.pnl || 0,
        color: COLORS.breakeven,
      },
      {
        name: "Small Losses (<1x Avg)",
        value: categories.smallLoss?.count || 0,
        pnl: categories.smallLoss?.pnl || 0,
        color: COLORS.smallLoss,
      },
      {
        name: "Losses (1-2x Avg)",
        value: categories.loss?.count || 0,
        pnl: categories.loss?.pnl || 0,
        color: COLORS.loss,
      },
      {
        name: "Big Losses (>2x Avg)",
        value: categories.bigLoss?.count || 0,
        pnl: categories.bigLoss?.pnl || 0,
        color: COLORS.bigLoss,
      },
    ].filter((d) => d.value > 0);

    // Calculate percentages
    const total = data.reduce((sum, d) => sum + d.value, 0);
    return data.map((d) => ({
      ...d,
      percentage: d.value / total,
    }));
  }, [filteredTrades]);

  if (!filteredTrades.length) {
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

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="45%"
            outerRadius="80%"
            paddingAngle={3}
            animationDuration={500}
            animationBegin={0}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={chartConfig.gridColor}
                strokeWidth={1}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ outline: "none" }}
          />
          <Legend
            content={<CustomLegend />}
            verticalAlign="bottom"
            height={72}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
