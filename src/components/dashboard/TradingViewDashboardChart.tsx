import { useState, useEffect, useRef } from "@/lib/react";
import { useThemeStore } from "@/stores/themeStore";
import { DASHBOARD_CHART_HEIGHT, getTradingViewConfig } from "@/config/chartConfig";

interface TradingViewDashboardChartProps {
  symbol: string;
  chartType?: 'advanced' | 'technical' | 'mini' | 'symbol';
  interval?: string;
  height?: number;
  showToolbar?: boolean;
  showSideToolbar?: boolean;
  enablePublishing?: boolean;
  allowSymbolChange?: boolean;
  studies?: string[];
  style?: string;
  className?: string;
}

// Add these type definitions at the top of the file
interface TradingViewCallback {
  (): void;
}

interface TradingViewSymbolCallback {
  (symbolInfo: any): void;
}

interface TradingViewHistoryCallback {
  (bars: any[], meta: { noData: boolean }): void;
}

/**
 * TradingViewDashboardChart - A component for displaying market data in dashboard cards
 * 
 * This component is designed to be used in dashboard cards and can display different
 * types of TradingView charts based on the chartType prop.
 */
export function TradingViewDashboardChart({ 
  symbol,
  chartType = 'advanced',
  interval = "D",
  height = DASHBOARD_CHART_HEIGHT,
  showToolbar,
  showSideToolbar,
  enablePublishing = false,
  allowSymbolChange = true,
  studies = ["Volume@tv-basicstudies"],
  style = "1", // Default to candlestick
  className = ""
}: TradingViewDashboardChartProps) {
  const isDarkMode = useThemeStore((state) => state.isDark);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [chartId] = useState(`tradingview_dashboard_${Math.random().toString(36).substring(2, 9)}`);
  const widgetRef = useRef<any>(null);
  
  // Get standardized chart configuration
  const tvConfig = getTradingViewConfig(isDarkMode);
  
  // Use provided values or defaults from config
  const finalShowToolbar = showToolbar !== undefined ? showToolbar : tvConfig.showToolbar;
  const finalShowSideToolbar = showSideToolbar !== undefined ? showSideToolbar : tvConfig.showSideToolbar;

  // Use IntersectionObserver to only render the chart when it's visible
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Initialize TradingView widget
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    // Clean up any existing widget
    if (widgetRef.current) {
      try {
        // Remove any existing scripts
        const scripts = containerRef.current.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // Clear the container
        containerRef.current.innerHTML = '';
        widgetRef.current = null;
      } catch (error) {
        console.error('Error cleaning up TradingView widget:', error);
      }
    }

    // Create a new script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;

    // Configure the widget based on chartType
    let widgetConfig: any = {
      "width": "100%",
      "height": "100%",
      "symbol": symbol,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": tvConfig.theme,
      "style": style,
      "locale": "en",
      "toolbar_bg": "var(--card)",
      "enable_publishing": enablePublishing,
      "hide_top_toolbar": !finalShowToolbar,
      "hide_side_toolbar": !finalShowSideToolbar,
      "allow_symbol_change": allowSymbolChange,
      "container_id": chartId
    };

    switch (chartType) {
      case 'technical':
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
        widgetConfig = {
          ...widgetConfig,
          "colorTheme": tvConfig.theme,
          "isTransparent": true,
          "displayMode": "single"
        };
        break;
      case 'symbol':
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
        widgetConfig = {
          ...widgetConfig,
          "colorTheme": tvConfig.theme,
          "isTransparent": true
        };
        break;
      case 'mini':
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-chart.js';
        widgetConfig = {
          ...widgetConfig,
          "dateRange": "12M",
          "trendLineColor": "var(--primary)",
          "underLineColor": "var(--primary/30)",
          "isTransparent": false,
          "autosize": true,
          "largeChartUrl": ""
        };
        break;
      case 'advanced':
      default:
        script.src = 'https://s3.tradingview.com/tv.js';
        
        // For advanced chart, we need to use a different approach
        script.onload = () => {
          if (typeof window.TradingView !== 'undefined' && containerRef.current) {
            widgetRef.current = new window.TradingView.widget({
              symbol: symbol,
              interval: interval,
              container_id: chartId,
              datafeed: {
                onReady: (callback: TradingViewCallback) => {
                  setTimeout(() => callback(), 0);
                },
                resolveSymbol: (symbolName: string, onSymbolResolvedCallback: TradingViewSymbolCallback) => {
                  setTimeout(() => {
                    onSymbolResolvedCallback({
                      name: symbolName,
                      full_name: symbolName,
                      description: symbolName,
                      type: 'stock',
                      session: '24x7',
                      timezone: 'Etc/UTC',
                      minmov: 1,
                      pricescale: 100,
                      has_intraday: true,
                      supported_resolutions: ['1', '5', '15', '30', '60', 'D', 'W', 'M']
                    });
                  }, 0);
                },
                getBars: (
                  symbolInfo: any,
                  resolution: string,
                  from: number,
                  to: number,
                  onHistoryCallback: TradingViewHistoryCallback
                ) => {
                  onHistoryCallback([], { noData: true });
                },
                subscribeBars: () => {},
                unsubscribeBars: () => {}
              },
              library_path: 'https://s3.tradingview.com/charting_library/',
              locale: 'en',
              theme: tvConfig.theme,
              autosize: true,
              toolbar_bg: "var(--card)",
              enable_publishing: enablePublishing,
              hide_top_toolbar: !finalShowToolbar,
              hide_side_toolbar: !finalShowSideToolbar,
              allow_symbol_change: allowSymbolChange,
              studies: studies
            });
          }
        };
        
        // Add the script to the container
        containerRef.current.appendChild(script);
        return;
    }

    // For non-advanced charts, set the widget config as JSON in the script
    script.innerHTML = JSON.stringify(widgetConfig);
    
    // Add the script to the container
    containerRef.current.appendChild(script);
    widgetRef.current = script;

    return () => {
      // Clean up
      if (containerRef.current && widgetRef.current) {
        try {
          containerRef.current.innerHTML = '';
          widgetRef.current = null;
        } catch (error) {
          console.error('Error cleaning up TradingView widget:', error);
        }
      }
    };
  }, [isVisible, symbol, interval, isDarkMode, chartType, chartId, finalShowToolbar, finalShowSideToolbar, enablePublishing, allowSymbolChange, studies, style, tvConfig]);

  return (
    <div 
      ref={containerRef}
      id={chartId}
      style={{ width: '100%', height: `${height}px` }} 
      className={`bg-card rounded-lg border border-border ${className}`}
    />
  );
}

// Add TradingView type definition
declare global {
  interface Window {
    TradingView: any;
  }
} 