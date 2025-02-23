import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Scatter
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import type { Trade } from '../../types/portfolio';

interface ChartData {
  date: string;
  value: number;
  cumulativeReturn: number;
  drawdown: number;
  volatility: number;
  volume: number;
}

interface AdvancedChartsProps {
  trades: Trade[];
  timeframe?: '1M' | '3M' | '6M' | '1Y' | 'ALL';
}

export function AdvancedCharts({ trades, timeframe = '1Y' }: AdvancedChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'returns' | 'drawdown' | 'volatility'>('returns');

  const calculateVolatility = (returns: number[]) => {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length);
  };

  const processData = (): ChartData[] => {
    let runningValue = 0;
    let peak = 0;
    let returns: number[] = [];
    
    const sortedTrades = trades
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sortedTrades.map((trade, index) => {
      const tradeValue = trade.type === 'sell' 
        ? trade.price * trade.shares 
        : -(trade.price * trade.shares);
      
      runningValue += tradeValue;
      peak = Math.max(peak, runningValue);
      
      // Calculate daily return if we have a previous value
      if (index > 0) {
        const prevValue = runningValue - tradeValue;
        const dailyReturn = (runningValue - prevValue) / Math.abs(prevValue);
        returns.push(dailyReturn);
      }

      const drawdown = peak > 0 ? ((peak - runningValue) / peak) * 100 : 0;
      const volatility = calculateVolatility(returns.slice(-20)); // 20-day volatility

      return {
        date: trade.date.split('T')[0],
        value: tradeValue,
        cumulativeReturn: runningValue,
        drawdown: -drawdown,
        volatility: volatility * 100,
        volume: Math.abs(trade.shares),
      };
    });
  };

  const chartData = processData();

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${Math.abs(value).toFixed(1)}%`;

  const renderChart = () => {
    switch (selectedMetric) {
      case 'returns':
        return (
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatCurrency} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(30 41 59)',
                border: 'none',
                borderRadius: '0.375rem',
                color: '#f1f5f9'
              }}
              formatter={(value: number) => [formatCurrency(value), 'Value']}
            />
            <Area
              type="monotone"
              dataKey="cumulativeReturn"
              fill="url(#colorValue)"
              stroke="#0ea5e9"
              fillOpacity={0.1}
            />
            <Bar dataKey="volume" fill="#6366f1" opacity={0.3} />
          </ComposedChart>
        );

      case 'drawdown':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatPercent} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(30 41 59)',
                border: 'none',
                borderRadius: '0.375rem',
                color: '#f1f5f9'
              }}
              formatter={(value: number) => [formatPercent(value), 'Drawdown']}
            />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#e11d48"
              fill="url(#colorDrawdown)"
              fillOpacity={0.1}
            />
          </AreaChart>
        );

      case 'volatility':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatPercent} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(30 41 59)',
                border: 'none',
                borderRadius: '0.375rem',
                color: '#f1f5f9'
              }}
              formatter={(value: number) => [formatPercent(value), 'Volatility']}
            />
            <Line
              type="monotone"
              dataKey="volatility"
              stroke="#8b5cf6"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          {[
            { value: 'returns', label: 'Returns & Volume' },
            { value: 'drawdown', label: 'Drawdown' },
            { value: 'volatility', label: '20-Day Volatility' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedMetric(value as typeof selectedMetric)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedMetric === value
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-dark-muted dark:hover:text-dark-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 