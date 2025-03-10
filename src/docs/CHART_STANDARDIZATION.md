# Chart Size Standardization

This document outlines the standardized approach to chart sizes across different sections of the TraderInsights application.

## Overview

Each section of the application (Dashboard, Journal, Performance, Account) has its own set of standardized chart sizes to ensure consistency within that section. This approach allows for section-specific design requirements while maintaining a unified look within each section.

## Implementation

The chart size standardization is implemented using a Zustand store (`chartStore.ts`) that manages chart sizes for different sections of the application.

### Chart Store

The chart store provides:

- Standardized sizes for each section
- Methods to get the appropriate chart height for a section
- Ability to customize sizes per section

### Usage

To use the standardized chart sizes in a component:

```tsx
import { useChartStore } from "@/stores/chartStore";

function MyComponent() {
  const getChartHeight = useChartStore((state) => state.getChartHeight);
  
  // Get the default chart height for the current section
  const chartHeight = getChartHeight();
  
  // Or specify a section
  const dashboardChartHeight = getChartHeight("dashboard");
  const journalChartHeight = getChartHeight("journal");
  
  return (
    <div style={{ height: `${chartHeight}px` }}>
      {/* Chart content */}
    </div>
  );
}
```

### Chart Sizes by Section

| Section     | Small | Medium | Large | Default |
|-------------|-------|--------|-------|---------|
| Dashboard   | 200px | 300px  | 400px | 300px   |
| Journal     | 250px | 350px  | 450px | 350px   |
| Performance | 300px | 400px  | 500px | 400px   |
| Account     | 250px | 350px  | 450px | 350px   |

## TradingView Charts

TradingView charts use the standardized sizes through the `TradingViewDashboardChart` and `TradingViewStockChart` components, which accept a `section` prop to specify which section's sizing to use.

Example:

```tsx
<TradingViewStockChart
  data={stockData}
  type="candlestick"
  section="journal"
/>
```

## Recharts Components

For Recharts components, use the chart store directly:

```tsx
<div style={{ height: `${getChartHeight("performance")}px` }}>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      {/* Chart content */}
    </LineChart>
  </ResponsiveContainer>
</div>
```

## Customization

To customize chart sizes for a specific section, use the `setSectionSize` method:

```tsx
const setSectionSize = useChartStore((state) => state.setSectionSize);

// Set the journal section to use large charts
setSectionSize("journal", "large");
```

## Best Practices

1. Always use the chart store for chart heights instead of hardcoding values
2. Specify the correct section when using chart components
3. For one-off custom sizes, pass a `height` prop directly to the chart component
4. Maintain aspect ratios appropriate for the data being displayed 