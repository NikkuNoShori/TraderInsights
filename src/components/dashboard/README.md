# Chart Components

This directory contains chart components used throughout the application.

## Unified Chart Configuration

All charts in the application use a unified configuration system defined in `src/config/chartConfig.ts`. This ensures consistent sizing, styling, and behavior across all charts.

Key features of the unified chart configuration:
- Standard chart heights
- Consistent color schemes
- Standardized margins and spacing
- Theme-aware configurations (light/dark mode)
- Shared configuration for both Recharts and TradingView components

## Dual Charting Approach

We use a dual approach for charting in the application:

1. **Recharts for P&L and Performance Data**: We use Recharts for visualizing P&L and performance data because it provides better integration with our custom data structures and offers more flexibility for displaying trading performance metrics.

2. **TradingView for Market Data**: We use TradingView charts for market data visualization because they provide professional-grade financial charts with advanced features like technical indicators, drawing tools, and real-time data.

## P&L Chart Components

### RechartsPnLChart

The `RechartsPnLChart` component is used for displaying P&L (Profit and Loss) data using Recharts. It shows both individual trade P&L and cumulative P&L over time.

#### Props

- `trades`: An array of trade objects
- `timeframe`: The timeframe to display (e.g., "1D", "1W", "1M", etc.)
- `height`: (Optional) The height of the chart in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)

#### Example

```tsx
import { RechartsPnLChart } from "@/components/dashboard/RechartsPnLChart";

// In your component
<RechartsPnLChart 
  trades={filteredTrades} 
  timeframe="1M" 
  height={300}
/>
```

### WinRateChart

The `WinRateChart` component displays win rate data over time using Recharts.

#### Props

- `trades`: An array of trade objects
- `timeframe`: The timeframe to display (e.g., "1D", "1W", "1M", etc.)
- `height`: (Optional) The height of the chart in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)

### TradeDistributionChart

The `TradeDistributionChart` component displays trade distribution data using a pie chart from Recharts.

#### Props

- `trades`: An array of trade objects
- `height`: (Optional) The height of the chart in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)

## Market Data Chart Components

### TradingViewDashboardChart

The `TradingViewDashboardChart` component is the core component for displaying market data using TradingView charts. It supports multiple chart types and configurations.

#### Props

- `symbol`: The symbol to display (e.g., "NASDAQ:AAPL")
- `chartType`: (Optional) The type of chart to display ('advanced', 'technical', 'mini', or 'symbol')
- `interval`: (Optional) The time interval (e.g., "D", "W", "M")
- `height`: (Optional) The height of the chart in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)
- `showToolbar`: (Optional) Whether to show the top toolbar
- `showSideToolbar`: (Optional) Whether to show the side toolbar
- `enablePublishing`: (Optional) Whether to enable publishing
- `allowSymbolChange`: (Optional) Whether to allow symbol changes
- `studies`: (Optional) An array of studies to display
- `style`: (Optional) The chart style to display
- `className`: (Optional) Additional CSS classes to apply

### TradingViewMarketChart

The `TradingViewMarketChart` component is a wrapper around `TradingViewDashboardChart` that provides a simpler API for displaying market data.

#### Props

- `symbol`: The symbol to display (e.g., "NASDAQ:AAPL")
- `interval`: (Optional) The time interval (e.g., "D", "W", "M")
- `height`: (Optional) The height of the chart in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)
- `showToolbar`: (Optional) Whether to show the top toolbar
- `showSideToolbar`: (Optional) Whether to show the side toolbar
- `enablePublishing`: (Optional) Whether to enable publishing
- `allowSymbolChange`: (Optional) Whether to allow symbol changes
- `studies`: (Optional) An array of studies to display
- `chartType`: (Optional) The chart style to display
- `className`: (Optional) Additional CSS classes to apply

### TradingViewStockChart

The `TradingViewStockChart` component is a wrapper around `TradingViewDashboardChart` that provides a simpler API for displaying stock data with OHLC information.

#### Props

- `data`: An array of OHLC data points
- `type`: The chart type to display ("area", "bar", or "candlestick")
- `symbol`: (Optional) The symbol to display
- `height`: (Optional) The height of the chart in pixels (defaults to `DASHBOARD_CHART_HEIGHT`)
- `showToolbar`: (Optional) Whether to show the top toolbar
- `showSideToolbar`: (Optional) Whether to show the side toolbar
- `enablePublishing`: (Optional) Whether to enable publishing
- `allowSymbolChange`: (Optional) Whether to allow symbol changes
- `studies`: (Optional) An array of studies to display

## Benefits of This Approach

- **Unified Appearance**: All charts have consistent sizing, styling, and behavior
- **Best of Both Worlds**: We get the flexibility of Recharts for custom data visualization and the power of TradingView for market data
- **Performance**: Recharts is lightweight and performs well for our P&L data needs
- **Professional Features**: TradingView provides professional-grade charting capabilities for market data
- **Future-Proof**: This approach allows us to easily enhance our market data visualization in the future while maintaining optimal P&L visualization
- **Maintainability**: Chart configuration is centralized, making it easy to update all charts at once 