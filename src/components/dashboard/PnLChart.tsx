import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Trade } from '../../types/trade';
import type { TimeframeOption } from '../ui/TimeframeSelector';
import { formatCurrency } from '../../utils/formatters';

interface PnLChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
}

export function PnLChart({ trades, timeframe }: PnLChartProps) {
  // Chart implementation here
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trades}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Line type="monotone" dataKey="pnl" stroke="var(--primary)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 