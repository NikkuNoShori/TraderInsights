# Chart System Documentation

This document provides a comprehensive overview of the charting system used in TraderInsights.

## Overview

TraderInsights uses a sophisticated dual charting approach with a unified configuration system to provide consistent, high-quality data visualization across the application. This approach allows us to leverage the strengths of different charting libraries while maintaining a consistent user experience.

## Unified Chart Configuration

All charts in the application use a unified configuration system defined in `src/config/chartConfig.ts`. This ensures consistent sizing, styling, and behavior across all charts.

### Configuration Structure

```typescript
// src/config/chartConfig.ts
export const CHART_SIZES = {
  small: 200,
  medium: 300,
  large: 400,
  extraLarge: 500,
  fullWidth: '100%',
};

export const CHART_ASPECT_RATIOS = {
  square: 1,
  widescreen: 16/9,
  ultrawide: 21/9,
  portrait: 3/4,
};

export const CHART_COLORS = {
  // Primary colors
  primary: '#6366f1', // Indigo
  secondary: '#0ea5e9', // Sky blue
  success: '#22c55e', // Green
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Red
  info: '#3b82f6', // Blue
  
  // Gradient stops
  primaryGradient: {
    start: 'rgba(99, 102, 241, 0.8)',
    end: 'rgba(99, 102, 241, 0.1)',
  },
  // ... other gradient definitions
};

export const CHART_MARGINS = {
  small: { top: 5, right: 5, bottom: 5, left: 5 },
  medium: { top: 10, right: 20, bottom: 20, left: 10 },
  large: { top: 20, right: 30, bottom: 30, left: 20 },
};

export const DASHBOARD_CHART_HEIGHT = 300;

export const getRechartsConfig = (isDarkMode: boolean) => ({
  colors: CHART_COLORS,
  gridColor: isDarkMode ? "#2B2B43" : "#e1e3eb",
  textColor: isDarkMode ? "#d1d4dc" : "#131722",
  margins: CHART_MARGINS.medium,
  height: DASHBOARD_CHART_HEIGHT,
});

export const getTradingViewConfig = (isDarkMode: boolean) => ({
  height: DASHBOARD_CHART_HEIGHT,
  theme: isDarkMode ? "dark" : "light",
  backgroundColor: isDarkMode ? "#1a1b1e" : "#ffffff",
  toolbarBgColor: isDarkMode ? "#1a1b1e" : "#f8f9fa",
  showToolbar: false,
  showSideToolbar: false,
});
```

### Key Features

- **Standard Chart Heights**: All dashboard charts use the `DASHBOARD_CHART_HEIGHT` constant (300px by default)
- **Consistent Color Schemes**: Predefined color palette for all charts
- **Theme-Aware Configurations**: Charts adapt to light/dark mode
- **Standardized Margins**: Consistent spacing around charts
- **Aspect Ratio Control**: Predefined aspect ratios for different chart types
- **Library-Specific Configurations**: Tailored settings for both Recharts and TradingView

## Dual Charting Approach

TraderInsights uses two different charting libraries for different purposes:

1. **Recharts for P&L and Performance Data**
   - Used for visualizing trading performance metrics
   - Better integration with custom data structures
   - More flexibility for displaying trading performance metrics
   - Lightweight and performant for custom data visualization

2. **TradingView for Market Data**
   - Used for market data visualization
   - Professional-grade financial charts
   - Advanced features like technical indicators and drawing tools
   - Real-time data visualization capabilities

### Why Two Libraries?

- **Specialized Functionality**: Each library excels at different types of visualization
- **Performance Optimization**: Using the right tool for each job improves performance
- **User Experience**: Providing professional-grade charts for market data while maintaining flexibility for custom metrics
- **Future-Proofing**: This approach allows us to enhance each visualization type independently

## Chart Components

### Performance Chart Components (Recharts)

#### RechartsPnLChart

The `RechartsPnLChart` component displays P&L (Profit and Loss) data using Recharts. It shows both individual trade P&L and cumulative P&L over time.

```typescript
import { RechartsPnLChart } from "@/components/dashboard/RechartsPnLChart";

// In your component
<RechartsPnLChart 
  trades={filteredTrades} 
  timeframe="1M" 
  height={300}
/>
```

**Props:**
- `trades`: Array of trade objects
- `timeframe`: Timeframe to display (e.g., "1D", "1W", "1M")
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)

#### WinRateChart

The `WinRateChart` component displays win rate data over time using Recharts.

```typescript
import { WinRateChart } from "@/components/dashboard/WinRateChart";

// In your component
<WinRateChart 
  trades={filteredTrades} 
  timeframe="1M" 
/>
```

**Props:**
- `trades`: Array of trade objects
- `timeframe`: Timeframe to display (e.g., "1D", "1W", "1M")
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)

#### TradeDistributionChart

The `TradeDistributionChart` component displays trade distribution data using a pie chart from Recharts.

```typescript
import { TradeDistributionChart } from "@/components/dashboard/TradeDistributionChart";

// In your component
<TradeDistributionChart 
  trades={filteredTrades} 
/>
```

**Props:**
- `trades`: Array of trade objects
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)

### Market Data Chart Components (TradingView)

#### TradingViewDashboardChart

The `TradingViewDashboardChart` is the core component for displaying market data using TradingView charts.

```typescript
import { TradingViewDashboardChart } from "@/components/dashboard/TradingViewDashboardChart";

// In your component
<TradingViewDashboardChart 
  symbol="NASDAQ:AAPL" 
  interval="D"
  chartType="advanced"
  studies={["RSI", "MACD"]}
/>
```

**Props:**
- `symbol`: Symbol to display (e.g., "NASDAQ:AAPL")
- `chartType`: (Optional) Type of chart ('advanced', 'technical', 'mini', or 'symbol')
- `interval`: (Optional) Time interval (e.g., "D", "W", "M")
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)
- `showToolbar`: (Optional) Whether to show the top toolbar
- `showSideToolbar`: (Optional) Whether to show the side toolbar
- `enablePublishing`: (Optional) Whether to enable publishing
- `allowSymbolChange`: (Optional) Whether to allow symbol changes
- `studies`: (Optional) Array of studies to display
- `style`: (Optional) Chart style to display
- `className`: (Optional) Additional CSS classes

#### TradingViewMarketChart

The `TradingViewMarketChart` is a wrapper around `TradingViewDashboardChart` that provides a simpler API for displaying market data.

```typescript
import { TradingViewMarketChart } from "@/components/market/TradingViewMarketChart";

// In your component
<TradingViewMarketChart 
  symbol="NASDAQ:AAPL" 
  interval="D"
/>
```

**Props:**
- `symbol`: Symbol to display (e.g., "NASDAQ:AAPL")
- `interval`: (Optional) Time interval (e.g., "D", "W", "M")
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)
- `showToolbar`: (Optional) Whether to show the top toolbar
- `showSideToolbar`: (Optional) Whether to show the side toolbar
- `className`: (Optional) Additional CSS classes

#### TradingViewStockChart

The `TradingViewStockChart` is a wrapper around `TradingViewDashboardChart` that provides a simpler API for displaying stock data with OHLC information.

```typescript
import { TradingViewStockChart } from "@/components/TradingViewStockChart";

// In your component
<TradingViewStockChart 
  data={ohlcData} 
  type="candlestick"
  symbol="AAPL"
/>
```

**Props:**
- `data`: Array of OHLC data points
- `type`: Chart type ("area", "bar", or "candlestick")
- `symbol`: (Optional) Symbol to display
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)
- `showToolbar`: (Optional) Whether to show the top toolbar
- `showSideToolbar`: (Optional) Whether to show the side toolbar

## Integration with Dashboard Cards

The chart components are integrated into various dashboard cards:

### MarketOverviewCard

The `MarketOverviewCard` component displays market overview data using `TradingViewMarketChart`.

```typescript
import { MarketOverviewCard } from "@/components/dashboard/MarketOverviewCard";

// In your component
<MarketOverviewCard />
```

### TechnicalAnalysisCard

The `TechnicalAnalysisCard` component displays technical analysis data using `TradingViewDashboardChart`.

```typescript
import { TechnicalAnalysisCard } from "@/components/dashboard/TechnicalAnalysisCard";

// In your component
<TechnicalAnalysisCard symbol="NASDAQ:AAPL" />
```

## Best Practices

1. **Always use the unified configuration**:
   ```typescript
   import { DASHBOARD_CHART_HEIGHT } from "@/config/chartConfig";
   ```

2. **Respect theme settings**:
   ```typescript
   const isDarkMode = useTheme().isDarkMode;
   const config = getRechartsConfig(isDarkMode);
   ```

3. **Use the appropriate chart for the data type**:
   - Use Recharts for performance data
   - Use TradingView for market data

4. **Maintain consistent heights**:
   - Use `DASHBOARD_CHART_HEIGHT` for dashboard charts
   - Use `CHART_SIZES` for other chart sizes

5. **Leverage wrapper components**:
   - Use `TradingViewMarketChart` for simple market data display
   - Use `TradingViewStockChart` for OHLC data display

## Troubleshooting

### Common Issues

1. **Chart not rendering**: Ensure the container has a defined width and height
2. **TradingView widget not loading**: Check that the symbol is valid and the API key is set
3. **Inconsistent chart sizes**: Make sure to use the unified configuration constants

### Performance Optimization

1. **Memoize chart components** to prevent unnecessary re-renders
2. **Limit the number of data points** displayed at once
3. **Use appropriate time intervals** for the data being displayed

## Future Enhancements

1. **Additional chart types** for specialized analysis
2. **Enhanced interactivity** between different chart components
3. **Custom indicator development** for proprietary trading strategies
4. **Saved chart configurations** for user preferences 
# Chart System Documentation

This document provides a comprehensive overview of the charting system used in TraderInsights.

## Overview

TraderInsights uses a sophisticated dual charting approach with a unified configuration system to provide consistent, high-quality data visualization across the application. This approach allows us to leverage the strengths of different charting libraries while maintaining a consistent user experience.

## Unified Chart Configuration

All charts in the application use a unified configuration system defined in `src/config/chartConfig.ts`. This ensures consistent sizing, styling, and behavior across all charts.

### Configuration Structure

```typescript
// src/config/chartConfig.ts
export const CHART_SIZES = {
  small: 200,
  medium: 300,
  large: 400,
  extraLarge: 500,
  fullWidth: '100%',
};

export const CHART_ASPECT_RATIOS = {
  square: 1,
  widescreen: 16/9,
  ultrawide: 21/9,
  portrait: 3/4,
};

export const CHART_COLORS = {
  // Primary colors
  primary: '#6366f1', // Indigo
  secondary: '#0ea5e9', // Sky blue
  success: '#22c55e', // Green
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Red
  info: '#3b82f6', // Blue
  
  // Gradient stops
  primaryGradient: {
    start: 'rgba(99, 102, 241, 0.8)',
    end: 'rgba(99, 102, 241, 0.1)',
  },
  // ... other gradient definitions
};

export const CHART_MARGINS = {
  small: { top: 5, right: 5, bottom: 5, left: 5 },
  medium: { top: 10, right: 20, bottom: 20, left: 10 },
  large: { top: 20, right: 30, bottom: 30, left: 20 },
};

export const DASHBOARD_CHART_HEIGHT = 300;

export const getRechartsConfig = (isDarkMode: boolean) => ({
  colors: CHART_COLORS,
  gridColor: isDarkMode ? "#2B2B43" : "#e1e3eb",
  textColor: isDarkMode ? "#d1d4dc" : "#131722",
  margins: CHART_MARGINS.medium,
  height: DASHBOARD_CHART_HEIGHT,
});

export const getTradingViewConfig = (isDarkMode: boolean) => ({
  height: DASHBOARD_CHART_HEIGHT,
  theme: isDarkMode ? "dark" : "light",
  backgroundColor: isDarkMode ? "#1a1b1e" : "#ffffff",
  toolbarBgColor: isDarkMode ? "#1a1b1e" : "#f8f9fa",
  showToolbar: false,
  showSideToolbar: false,
});
```

### Key Features

- **Standard Chart Heights**: All dashboard charts use the `DASHBOARD_CHART_HEIGHT` constant (300px by default)
- **Consistent Color Schemes**: Predefined color palette for all charts
- **Theme-Aware Configurations**: Charts adapt to light/dark mode
- **Standardized Margins**: Consistent spacing around charts
- **Aspect Ratio Control**: Predefined aspect ratios for different chart types
- **Library-Specific Configurations**: Tailored settings for both Recharts and TradingView

## Dual Charting Approach

TraderInsights uses two different charting libraries for different purposes:

1. **Recharts for P&L and Performance Data**
   - Used for visualizing trading performance metrics
   - Better integration with custom data structures
   - More flexibility for displaying trading performance metrics
   - Lightweight and performant for custom data visualization

2. **TradingView for Market Data**
   - Used for market data visualization
   - Professional-grade financial charts
   - Advanced features like technical indicators and drawing tools
   - Real-time data visualization capabilities

### Why Two Libraries?

- **Specialized Functionality**: Each library excels at different types of visualization
- **Performance Optimization**: Using the right tool for each job improves performance
- **User Experience**: Providing professional-grade charts for market data while maintaining flexibility for custom metrics
- **Future-Proofing**: This approach allows us to enhance each visualization type independently

## Chart Components

### Performance Chart Components (Recharts)

#### RechartsPnLChart

The `RechartsPnLChart` component displays P&L (Profit and Loss) data using Recharts. It shows both individual trade P&L and cumulative P&L over time.

```typescript
import { RechartsPnLChart } from "@/components/dashboard/RechartsPnLChart";

// In your component
<RechartsPnLChart 
  trades={filteredTrades} 
  timeframe="1M" 
  height={300}
/>
```

**Props:**
- `trades`: Array of trade objects
- `timeframe`: Timeframe to display (e.g., "1D", "1W", "1M")
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)

#### WinRateChart

The `WinRateChart` component displays win rate data over time using Recharts.

```typescript
import { WinRateChart } from "@/components/dashboard/WinRateChart";

// In your component
<WinRateChart 
  trades={filteredTrades} 
  timeframe="1M" 
/>
```

**Props:**
- `trades`: Array of trade objects
- `timeframe`: Timeframe to display (e.g., "1D", "1W", "1M")
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)

#### TradeDistributionChart

The `TradeDistributionChart` component displays trade distribution data using a pie chart from Recharts.

```typescript
import { TradeDistributionChart } from "@/components/dashboard/TradeDistributionChart";

// In your component
<TradeDistributionChart 
  trades={filteredTrades} 
/>
```

**Props:**
- `trades`: Array of trade objects
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)

### Market Data Chart Components (TradingView)

#### TradingViewDashboardChart

The `TradingViewDashboardChart` is the core component for displaying market data using TradingView charts.

```typescript
import { TradingViewDashboardChart } from "@/components/dashboard/TradingViewDashboardChart";

// In your component
<TradingViewDashboardChart 
  symbol="NASDAQ:AAPL" 
  interval="D"
  chartType="advanced"
  studies={["RSI", "MACD"]}
/>
```

**Props:**
- `symbol`: Symbol to display (e.g., "NASDAQ:AAPL")
- `chartType`: (Optional) Type of chart ('advanced', 'technical', 'mini', or 'symbol')
- `interval`: (Optional) Time interval (e.g., "D", "W", "M")
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)
- `showToolbar`: (Optional) Whether to show the top toolbar
- `showSideToolbar`: (Optional) Whether to show the side toolbar
- `enablePublishing`: (Optional) Whether to enable publishing
- `allowSymbolChange`: (Optional) Whether to allow symbol changes
- `studies`: (Optional) Array of studies to display
- `style`: (Optional) Chart style to display
- `className`: (Optional) Additional CSS classes

#### TradingViewMarketChart

The `TradingViewMarketChart` is a wrapper around `TradingViewDashboardChart` that provides a simpler API for displaying market data.

```typescript
import { TradingViewMarketChart } from "@/components/market/TradingViewMarketChart";

// In your component
<TradingViewMarketChart 
  symbol="NASDAQ:AAPL" 
  interval="D"
/>
```

**Props:**
- `symbol`: Symbol to display (e.g., "NASDAQ:AAPL")
- `interval`: (Optional) Time interval (e.g., "D", "W", "M")
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)
- `showToolbar`: (Optional) Whether to show the top toolbar
- `showSideToolbar`: (Optional) Whether to show the side toolbar
- `className`: (Optional) Additional CSS classes

#### TradingViewStockChart

The `TradingViewStockChart` is a wrapper around `TradingViewDashboardChart` that provides a simpler API for displaying stock data with OHLC information.

```typescript
import { TradingViewStockChart } from "@/components/TradingViewStockChart";

// In your component
<TradingViewStockChart 
  data={ohlcData} 
  type="candlestick"
  symbol="AAPL"
/>
```

**Props:**
- `data`: Array of OHLC data points
- `type`: Chart type ("area", "bar", or "candlestick")
- `symbol`: (Optional) Symbol to display
- `height`: (Optional) Chart height in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)
- `showToolbar`: (Optional) Whether to show the top toolbar
- `showSideToolbar`: (Optional) Whether to show the side toolbar

## Integration with Dashboard Cards

The chart components are integrated into various dashboard cards:

### MarketOverviewCard

The `MarketOverviewCard` component displays market overview data using `TradingViewMarketChart`.

```typescript
import { MarketOverviewCard } from "@/components/dashboard/MarketOverviewCard";

// In your component
<MarketOverviewCard />
```

### TechnicalAnalysisCard

The `TechnicalAnalysisCard` component displays technical analysis data using `TradingViewDashboardChart`.

```typescript
import { TechnicalAnalysisCard } from "@/components/dashboard/TechnicalAnalysisCard";

// In your component
<TechnicalAnalysisCard symbol="NASDAQ:AAPL" />
```

## Best Practices

1. **Always use the unified configuration**:
   ```typescript
   import { DASHBOARD_CHART_HEIGHT } from "@/config/chartConfig";
   ```

2. **Respect theme settings**:
   ```typescript
   const isDarkMode = useTheme().isDarkMode;
   const config = getRechartsConfig(isDarkMode);
   ```

3. **Use the appropriate chart for the data type**:
   - Use Recharts for performance data
   - Use TradingView for market data

4. **Maintain consistent heights**:
   - Use `DASHBOARD_CHART_HEIGHT` for dashboard charts
   - Use `CHART_SIZES` for other chart sizes

5. **Leverage wrapper components**:
   - Use `TradingViewMarketChart` for simple market data display
   - Use `TradingViewStockChart` for OHLC data display

## Troubleshooting

### Common Issues

1. **Chart not rendering**: Ensure the container has a defined width and height
2. **TradingView widget not loading**: Check that the symbol is valid and the API key is set
3. **Inconsistent chart sizes**: Make sure to use the unified configuration constants

### Performance Optimization

1. **Memoize chart components** to prevent unnecessary re-renders
2. **Limit the number of data points** displayed at once
3. **Use appropriate time intervals** for the data being displayed

## Future Enhancements

1. **Additional chart types** for specialized analysis
2. **Enhanced interactivity** between different chart components
3. **Custom indicator development** for proprietary trading strategies
4. **Saved chart configurations** for user preferences 