import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import type { Trade as PortfolioTrade } from "@/types/portfolio";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import { useMemo } from "@/lib/react";
import { format } from "date-fns";
import { 
  getTimeframeConfig, 
  getIntervalEnd,
  formatCurrency,
  formatPercent,
  calculateYAxisDomain
} from "@/utils/chartUtils";
import { 
  ChartEmptyState, 
  BaseChartTooltip,
  CHART_COLORS 
} from "../charts/ChartComponents";
import { useTradeCalculations } from "@/hooks/useTradeCalculations";

interface ChartData {
  date: string;
  pnl: number;
  cumulativePnL: number;
  drawdown: number;
  trades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
}

interface PerformanceChartsProps {
  trades: (Trade | PortfolioTrade)[];
  timeframe: TimeframeOption;
}

export function PerformanceCharts({ trades, timeframe }: PerformanceChartsProps) {
  const { normalizedTrades } = useTradeCalculations(trades);

  const processData = useMemo(() => {
    if (!normalizedTrades.length) return [];

    const { start, end, dateFormat, intervals } = getTimeframeConfig(timeframe);

    let cumulativePnL = 0;
    let peak = 0;

    return intervals.map((intervalStart) => {
      try {
        const intervalEnd = getIntervalEnd(intervalStart, timeframe);

        const periodTrades = normalizedTrades.filter(trade => {
          const tradeDate = new Date(trade.entry_date);
          return tradeDate >= intervalStart && tradeDate < intervalEnd;
        });

        // Calculate period statistics
        const winningTrades = periodTrades.filter(t => t.pnl > 0);
        const losingTrades = periodTrades.filter(t => t.pnl < 0);
        
        const periodPnL = periodTrades.reduce((sum, trade) => sum + trade.pnl, 0);
        const winRate = periodTrades.length > 0 ? winningTrades.length / periodTrades.length : 0;
        
        const avgWin = winningTrades.length > 0
          ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
          : 0;
          
        const avgLoss = losingTrades.length > 0
          ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0)) / losingTrades.length
          : 0;

        cumulativePnL += periodPnL;
        peak = Math.max(peak, cumulativePnL);
        const drawdown = peak > 0 ? ((peak - cumulativePnL) / peak) * 100 : 0;

        return {
          date: format(intervalStart, dateFormat),
          pnl: periodPnL,
          cumulativePnL,
          drawdown,
          trades: periodTrades.length,
          winRate,
          avgWin,
          avgLoss
        };
      } catch (error) {
        console.error("Error processing interval:", error, intervalStart);
        return {
          date: format(intervalStart, dateFormat),
          pnl: 0,
          cumulativePnL: 0,
          drawdown: 0,
          trades: 0,
          winRate: 0,
          avgWin: 0,
          avgLoss: 0
        };
      }
    });
  }, [normalizedTrades, timeframe]);

  if (!trades.length) {
    return <ChartEmptyState />;
  }

  if (!processData.length) {
    return <ChartEmptyState message="No trades found in the selected time periods." />;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <BaseChartTooltip active={active} payload={payload} label={label}>
        <div className="font-medium text-base">Date: {label}</div>
        <div className="space-y-1 mt-2 text-sm">
          {payload.map((item: any, index: number) => (
            <div key={index} style={{ color: item.color }}>
              {item.name}: {item.name.includes("Drawdown") || item.name.includes("Win Rate")
                ? formatPercent(item.value)
                : formatCurrency(item.value)
              }
            </div>
          ))}
          <div className="text-muted-foreground">
            Trades: {data.trades}
            {data.trades > 0 && (
              <>
                <br />
                Win Rate: {formatPercent(data.winRate * 100)}
                <br />
                Avg Win: {formatCurrency(data.avgWin)}
                <br />
                Avg Loss: {formatCurrency(data.avgLoss)}
              </>
            )}
          </div>
        </div>
      </BaseChartTooltip>
    );
  };

  // Calculate Y-axis domain
  const allValues = processData.reduce((acc, data) => {
    if (isFinite(data.pnl)) acc.push(data.pnl);
    if (isFinite(data.cumulativePnL)) acc.push(data.cumulativePnL);
    return acc;
  }, [] as number[]);

  const yAxisDomain = calculateYAxisDomain(allValues);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card dark:bg-dark-paper p-6 rounded-lg border border-border dark:border-dark-border">
        <h3 className="text-lg font-medium mb-4">P&L Over Time</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processData}>
              <defs>
                <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={yAxisDomain}
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
              <Line
                name="Period P&L"
                type="monotone"
                dataKey="pnl"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={false}
                fill="url(#colorPnL)"
              />
              <Line
                name="Cumulative P&L"
                type="monotone"
                dataKey="cumulativePnL"
                stroke={CHART_COLORS.secondary}
                strokeWidth={2}
                dot={false}
                fill="url(#colorCumulative)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card dark:bg-dark-paper p-6 rounded-lg border border-border dark:border-dark-border">
        <h3 className="text-lg font-medium mb-4">Drawdown Analysis</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processData}>
              <defs>
                <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.drawdown} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={CHART_COLORS.drawdown} stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={formatPercent}
                tick={{ fontSize: 12 }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                name="Drawdown %"
                type="monotone"
                dataKey="drawdown"
                stroke={CHART_COLORS.drawdown}
                strokeWidth={2}
                dot={false}
                fill="url(#colorDrawdown)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
