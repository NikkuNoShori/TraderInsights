import { useEffect, useRef, useState } from "@/lib/react";
import { TradingViewDashboardChart } from "@/components/dashboard/TradingViewDashboardChart";
import { useChartStore, ChartSection } from "@/stores/chartStore";
import type { ChartType } from "./ChartTypeSelector";
import type { OHLC } from "@/types/stock";

interface TradingViewStockChartProps {
  data: OHLC[];
  type: ChartType;
  symbol?: string;
  height?: number;
  showToolbar?: boolean;
  showSideToolbar?: boolean;
  enablePublishing?: boolean;
  allowSymbolChange?: boolean;
  studies?: string[];
  section?: ChartSection;
}

/**
 * TradingViewStockChart - A component for displaying stock data using TradingView charts
 * 
 * This component is a wrapper around TradingViewDashboardChart that provides a simpler API
 * for displaying stock data.
 */
export function TradingViewStockChart({ 
  data, 
  type, 
  symbol = "NASDAQ:AAPL",
  height,
  showToolbar = false,
  showSideToolbar = false,
  enablePublishing = false,
  allowSymbolChange = true,
  studies = ["Volume@tv-basicstudies"],
  section = "dashboard"
}: TradingViewStockChartProps) {
  const getChartHeight = useChartStore((state) => state.getChartHeight);
  const chartHeight = height || getChartHeight(section);
  
  // Map chart type to TradingView chart style
  const getChartStyle = (): string => {
    switch (type) {
      case "area":
        return "3"; // Area chart
      case "bar":
        return "0"; // Bar chart
      case "candlestick":
        return "1"; // Candlestick chart
      default:
        return "1"; // Default to candlestick
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-muted-foreground" style={{ height: `${chartHeight}px` }}>
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-lg border border-border">
      <TradingViewDashboardChart 
        symbol={symbol}
        chartType="advanced"
        interval="D"
        height={chartHeight}
        style={getChartStyle()}
        showToolbar={showToolbar}
        showSideToolbar={showSideToolbar}
        enablePublishing={enablePublishing}
        allowSymbolChange={allowSymbolChange}
        studies={studies}
        section={section}
      />
    </div>
  );
} 