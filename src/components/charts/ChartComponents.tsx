import React from 'react';

export interface ChartEmptyStateProps {
  height?: number;
  message?: string;
}

export function ChartEmptyState({
  height = 300,
  message = "No trade data available for the selected timeframe."
}: ChartEmptyStateProps) {
  return (
    <div className="flex items-center justify-center text-muted-foreground" style={{ height: `${height}px` }}>
      {message}
    </div>
  );
}

export interface BaseTooltipProps {
  active: boolean;
  payload: any[];
  label: string;
}

export function BaseChartTooltip({
  children,
  active,
  payload
}: React.PropsWithChildren<BaseTooltipProps>) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card dark:bg-dark-paper border border-border dark:border-dark-border rounded-lg p-3 shadow-lg">
      {children}
    </div>
  );
}

export const CHART_COLORS = {
  profit: "hsl(142, 76%, 36%)", // Green
  loss: "hsl(346, 87%, 43%)", // Red
  primary: "hsl(221, 83%, 53%)", // Blue
  secondary: "hsl(262, 83%, 58%)", // Purple
  neutral: "hsl(215, 16%, 47%)", // Gray
  drawdown: "hsl(31, 90%, 50%)", // Orange
} as const; 