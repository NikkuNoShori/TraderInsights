import { useState } from "@/lib/react";
import { TradingViewDashboardChart } from "@/components/dashboard/TradingViewDashboardChart";
import { DASHBOARD_CHART_HEIGHT } from "@/config/chartConfig";

interface TradingViewMarketChartProps {
  symbol: string;
  interval?: string;
  height?: number;
  showToolbar?: boolean;
  showSideToolbar?: boolean;
  enablePublishing?: boolean;
  allowSymbolChange?: boolean;
  studies?: string[];
  chartType?: string;
  className?: string;
}

/**
 * TradingViewMarketChart - A component for displaying market data using TradingView charts
 * 
 * This component is a wrapper around TradingViewDashboardChart that provides a simpler API
 * for displaying market data.
 */
export function TradingViewMarketChart({ 
  symbol,
  interval = "D",
  height = DASHBOARD_CHART_HEIGHT,
  showToolbar = true,
  showSideToolbar = true,
  enablePublishing = false,
  allowSymbolChange = true,
  studies = ["Volume@tv-basicstudies"],
  chartType = "1", // Default to candlestick
  className = ""
}: TradingViewMarketChartProps) {
  return (
    <div className={`w-full bg-card rounded-lg border border-border ${className}`}>
      <TradingViewDashboardChart 
        symbol={symbol}
        chartType="advanced"
        interval={interval}
        height={height}
        style={chartType}
        showToolbar={showToolbar}
        showSideToolbar={showSideToolbar}
        enablePublishing={enablePublishing}
        allowSymbolChange={allowSymbolChange}
        studies={studies}
      />
    </div>
  );
} 