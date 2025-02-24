import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Bar,
  Area,
} from "recharts";
import { formatCurrency } from "../utils/formatters";
import type { ChartType } from "./ChartTypeSelector";
import type { OHLC } from "../types/stock";

interface StockChartProps {
  data: OHLC[];
  type: ChartType;
}

const CandlestickBar = (props: any) => {
  const { x, y, width, height, open, close, high, low } = props;
  const isGreen = close > open;
  const color = isGreen ? "#22c55e" : "#ef4444";
  const barWidth = Math.max(1, width - 2);

  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x + (width - barWidth) / 2}
        y={isGreen ? y : y + (height * (high - close)) / (high - low)}
        width={barWidth}
        height={Math.abs((height * (close - open)) / (high - low))}
        fill={color}
      />
    </g>
  );
};

export function StockChart({ data, type }: StockChartProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (type) {
      case "area":
        return (
          <ComposedChart {...commonProps}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis
              stroke="#6b7280"
              tickFormatter={formatCurrency}
              domain={["dataMin", "dataMax"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 rounded-lg shadow-lg border text-sm">
                    <div className="font-semibold">{data.date}</div>
                    <div>Close: {formatCurrency(data.close)}</div>
                    <div>Volume: {data.volume.toLocaleString()}</div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorClose)"
            />
          </ComposedChart>
        );

      case "bar":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis
              stroke="#6b7280"
              tickFormatter={formatCurrency}
              domain={["dataMin", "dataMax"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 rounded-lg shadow-lg border text-sm">
                    <div className="font-semibold">{data.date}</div>
                    <div>Close: {formatCurrency(data.close)}</div>
                    <div>Volume: {data.volume.toLocaleString()}</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="close" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </ComposedChart>
        );

      case "candlestick":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis
              stroke="#6b7280"
              tickFormatter={formatCurrency}
              domain={["dataMin", "dataMax"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 rounded-lg shadow-lg border text-sm">
                    <div className="font-semibold">{data.date}</div>
                    <div>Open: {formatCurrency(data.open)}</div>
                    <div>High: {formatCurrency(data.high)}</div>
                    <div>Low: {formatCurrency(data.low)}</div>
                    <div>Close: {formatCurrency(data.close)}</div>
                    <div>Volume: {data.volume.toLocaleString()}</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="high" shape={<CandlestickBar />} />
          </ComposedChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-[400px] bg-white rounded-lg shadow-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
