import { useEffect, useRef } from "@/lib/react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  CandlestickData,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import { formatCurrency } from "@/utils/formatters";
import { useTimeframeFilteredTrades } from "@/hooks/useTimeframeFilteredTrades";
import { useThemeStore } from "@/stores/themeStore";

interface PnLChartProps {
  trades: Trade[];
  timeframe: TimeframeOption;
}

export function PnLChart({ trades, timeframe }: PnLChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const timeframeFilteredTrades = useTimeframeFilteredTrades(trades, timeframe);
  const isDarkMode = useThemeStore((state) => state.isDark);

  useEffect(() => {
    if (!chartContainerRef.current || !timeframeFilteredTrades.length) return;

    // Transform trade data first
    const candleData: CandlestickData<UTCTimestamp>[] = timeframeFilteredTrades
      .filter(trade => trade.entry_price && trade.exit_price)
      .map(trade => ({
        time: (new Date(trade.entry_date).getTime() / 1000) as UTCTimestamp,
        open: trade.entry_price!,
        high: Math.max(trade.entry_price!, trade.exit_price!),
        low: Math.min(trade.entry_price!, trade.exit_price!),
        close: trade.exit_price!,
      }));

    // Calculate cumulative P&L
    let cumulativePnL = 0;
    const lineData: LineData<UTCTimestamp>[] = timeframeFilteredTrades
      .filter(trade => trade.pnl !== undefined)
      .map(trade => {
        cumulativePnL += trade.pnl || 0;
        return {
          time: (new Date(trade.entry_date).getTime() / 1000) as UTCTimestamp,
          value: cumulativePnL,
        };
      });

    if (!candleData.length && !lineData.length) return;

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDarkMode ? "#1a1b1e" : "#ffffff" },
        textColor: isDarkMode ? "#d1d4dc" : "#131722",
      },
      grid: {
        vertLines: { color: isDarkMode ? "#2B2B43" : "#e1e3eb" },
        horzLines: { color: isDarkMode ? "#2B2B43" : "#e1e3eb" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: isDarkMode ? "#2B2B43" : "#e1e3eb",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: isDarkMode ? "#2B2B43" : "#e1e3eb",
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    // Add candlestick series if we have data
    if (candleData.length > 0) {
      const candlestickSeries = chart.addSeries({
        type: 'Candlestick',
        upColor: "#26a69a",
        downColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
        borderVisible: false,
      } as any);
      candlestickSeries.setData(candleData);
    }

    // Add line series if we have data
    if (lineData.length > 0) {
      const lineSeries = chart.addSeries({
        type: 'Line',
        color: "#2962FF",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      } as any);
      lineSeries.setData(lineData);
    }

    // Fit content
    chart.timeScale().fitContent();

    // Store chart reference for cleanup
    chartRef.current = chart;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [timeframeFilteredTrades, isDarkMode]);

  if (!timeframeFilteredTrades.length) {
    return (
      <div className="w-full h-[400px] rounded-lg border border-border bg-card p-4 flex items-center justify-center text-muted-foreground">
        No trade data available for the selected timeframe.
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg border border-border bg-card p-4">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
