# Performance Guide

This document outlines performance optimization strategies and best practices implemented in TraderInsights.

## Overview

Performance is a critical aspect of TraderInsights, especially when dealing with large datasets, real-time updates, and complex visualizations. This guide covers various performance optimization techniques implemented across different layers of the application.

## Key Performance Metrics

TraderInsights focuses on the following key performance metrics:

1. **Initial Load Time**: Time to first meaningful paint and time to interactive
2. **Rendering Performance**: Frame rate and smoothness of animations
3. **Data Loading Speed**: Time to fetch and process data
4. **Memory Usage**: Efficient memory management
5. **Network Efficiency**: Minimizing network requests and payload size

## Code Splitting

### Route-Based Splitting

TraderInsights implements route-based code splitting to reduce the initial bundle size:

```typescript
// src/routes/index.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy-loaded components
const Dashboard = lazy(() => import('@/views/Dashboard'));
const TradeJournal = lazy(() => import('@/views/TradeJournal'));
const MarketData = lazy(() => import('@/views/MarketData'));
const Settings = lazy(() => import('@/views/Settings'));
const Profile = lazy(() => import('@/views/Profile'));

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'journal',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TradeJournal />
          </Suspense>
        ),
      },
      {
        path: 'market',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <MarketData />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Settings />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Profile />
          </Suspense>
        ),
      },
    ],
  },
]);
```

### Component-Based Splitting

Heavy components are also lazy-loaded to improve performance:

```typescript
// src/components/dashboard/DashboardCards.tsx
import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy-loaded chart components
const PnLChart = lazy(() => import('@/components/charts/PnLChart'));
const WinRateChart = lazy(() => import('@/components/charts/WinRateChart'));
const TradeDistributionChart = lazy(() => import('@/components/charts/TradeDistributionChart'));

export function DashboardCards({ trades, timeframe }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <PnLChart trades={trades} timeframe={timeframe} />
          </Suspense>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <WinRateChart trades={trades} timeframe={timeframe} />
          </Suspense>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Trade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <TradeDistributionChart trades={trades} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
```

## React Optimization

### Memoization

Components are memoized to prevent unnecessary re-renders:

```typescript
// src/components/trades/TradeCard.tsx
import { memo } from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface TradeCardProps {
  trade: Trade;
  onSelect: (tradeId: string) => void;
}

function TradeCardComponent({ trade, onSelect }: TradeCardProps) {
  const profit = trade.exit_price * trade.quantity - trade.entry_price * trade.quantity;
  const profitPercentage = ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100;
  
  return (
    <div 
      className={`p-4 rounded-lg border ${profit >= 0 ? 'border-success/30' : 'border-danger/30'}`}
      onClick={() => onSelect(trade.id)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{trade.symbol}</h3>
        <span className={`font-bold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
          {formatCurrency(profit)} ({profitPercentage.toFixed(2)}%)
        </span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Entry: {formatCurrency(trade.entry_price)}</span>
          <span>Exit: {formatCurrency(trade.exit_price)}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Quantity: {trade.quantity}</span>
          <span>Date: {formatDate(trade.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const TradeCard = memo(TradeCardComponent);
```

### useMemo and useCallback

`useMemo` and `useCallback` are used to optimize expensive calculations and event handlers:

```typescript
// src/hooks/useTradeAnalytics.ts
import { useMemo } from 'react';
import { Trade } from '@/types/trade';

export function useTradeAnalytics(trades: Trade[]) {
  // Memoize expensive calculations
  const analytics = useMemo(() => {
    if (!trades.length) return null;
    
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => 
      (trade.exit_price - trade.entry_price) * (trade.side === 'Long' ? 1 : -1) > 0
    ).length;
    
    const totalPnL = trades.reduce((sum, trade) => {
      const tradeValue = (trade.exit_price - trade.entry_price) * trade.quantity;
      return sum + (trade.side === 'Long' ? tradeValue : -tradeValue);
    }, 0);
    
    const winRate = (winningTrades / totalTrades) * 100;
    const averagePnL = totalPnL / totalTrades;
    
    return {
      totalTrades,
      winningTrades,
      losingTrades: totalTrades - winningTrades,
      winRate,
      totalPnL,
      averagePnL,
    };
  }, [trades]);
  
  return analytics;
}
```

```typescript
// src/components/trades/TradeList.tsx
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TradeCard } from './TradeCard';

export function TradeList({ trades }) {
  const navigate = useNavigate();
  
  // Memoize event handler
  const handleSelectTrade = useCallback((tradeId: string) => {
    navigate(`/journal/trade/${tradeId}`);
  }, [navigate]);
  
  return (
    <div className="space-y-4">
      {trades.map(trade => (
        <TradeCard 
          key={trade.id} 
          trade={trade} 
          onSelect={handleSelectTrade} 
        />
      ))}
    </div>
  );
}
```

## Data Fetching Optimization

### React Query Caching

TraderInsights uses React Query for efficient data fetching and caching:

```typescript
// src/hooks/useTrades.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTrades } from '@/services/tradeService';

export function useTrades(userId: string | undefined, filters: TradeFilters = {}) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['trades', userId, filters],
    queryFn: () => getTrades(userId!, filters),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      // Pre-populate individual trade queries
      data.forEach(trade => {
        queryClient.setQueryData(['trade', trade.id], trade);
      });
    },
  });
}
```

### Pagination

Pagination is implemented for large datasets:

```typescript
// src/hooks/usePaginatedTrades.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { getPaginatedTrades } from '@/services/tradeService';

export function usePaginatedTrades(userId: string | undefined, pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['paginatedTrades', userId, pageSize],
    queryFn: ({ pageParam = 0 }) => getPaginatedTrades(userId!, pageParam, pageSize),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

```typescript
// src/components/trades/PaginatedTradeList.tsx
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { usePaginatedTrades } from '@/hooks/usePaginatedTrades';
import { TradeCard } from './TradeCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function PaginatedTradeList({ userId }) {
  const { ref, inView } = useInView();
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    isLoading,
  } = usePaginatedTrades(userId);
  
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-4">
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.map(trade => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      ))}
      
      {hasNextPage && (
        <div ref={ref} className="flex justify-center p-4">
          {isFetchingNextPage ? <LoadingSpinner /> : <div>Load more</div>}
        </div>
      )}
    </div>
  );
}
```

## Virtualization

For large lists, virtualization is used to render only visible items:

```typescript
// src/components/trades/VirtualizedTradeList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { TradeCard } from './TradeCard';

export function VirtualizedTradeList({ trades }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated height of each item
    overscan: 5, // Number of items to render outside of the visible area
  });
  
  return (
    <div 
      ref={parentRef} 
      className="h-[600px] overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <TradeCard trade={trades[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Image Optimization

Images are optimized to reduce load time:

```typescript
// src/components/ui/Image.tsx
import { useState } from 'react';
import { cn } from '@/utils/cn';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function Image({ src, alt, className, fallback = '/placeholder.png', ...props }: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      
      <img
        src={error ? fallback : src}
        alt={alt}
        className={cn('w-full h-full object-cover transition-opacity', 
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        {...props}
      />
    </div>
  );
}
```

## Bundle Optimization

### Tree Shaking

Tree shaking is enabled to eliminate unused code:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts', 'lightweight-charts'],
          utils: ['date-fns', 'lodash-es'],
        },
      },
    },
  },
});
```

### Asset Optimization

Static assets are optimized using Vite's built-in optimizations:

```javascript
// vite.config.js (continued)
export default defineConfig({
  // ... other config
  build: {
    // ... other build config
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    cssCodeSplit: true, // Split CSS into chunks
    sourcemap: false, // Disable sourcemaps in production
    chunkSizeWarningLimit: 500, // Warn when chunks exceed 500kb
  },
});
```

## Server-Side Optimization

### API Response Compression

API responses are compressed to reduce payload size:

```typescript
// server/index.ts
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { apiRoutes } from './routes';

const app = express();

// Enable compression
app.use(compression());

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  })
);

// API routes
app.use('/api', apiRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Response Caching

API responses are cached to improve performance:

```typescript
// server/middleware/cache.ts
import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL

export const cacheMiddleware = (ttl: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      return res.send(cachedResponse);
    }
    
    const originalSend = res.send;
    res.send = function(body) {
      cache.set(key, body, ttl);
      return originalSend.call(this, body);
    };
    
    next();
  };
};
```

## Performance Monitoring

### Client-Side Monitoring

Performance is monitored on the client side using the Performance API:

```typescript
// src/utils/performance.ts
export const measurePerformance = (metricName: string) => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    
    console.log(`[Performance] ${metricName}: ${duration.toFixed(2)}ms`);
    
    // Report to analytics
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: metricName,
        duration,
      });
    }
    
    return duration;
  };
};

// Usage
const endMeasure = measurePerformance('data_processing');
// ... perform operation
const duration = endMeasure();
```

### React Profiler

The React Profiler is used to identify performance bottlenecks:

```typescript
// src/components/PerformanceWrapper.tsx
import { Profiler, ProfilerOnRenderCallback, ReactNode } from 'react';

interface PerformanceWrapperProps {
  id: string;
  children: ReactNode;
}

export function PerformanceWrapper({ id, children }: PerformanceWrapperProps) {
  const handleRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Profiler] ${id}:`, {
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
      });
    }
  };
  
  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
}
```

## Best Practices

### Component Best Practices

1. **Avoid Inline Functions**: Define event handlers outside of render
2. **Use Proper Keys**: Always use stable, unique keys for lists
3. **Avoid Prop Drilling**: Use context or state management for deep props
4. **Lazy Load Components**: Use lazy loading for heavy components
5. **Optimize Renders**: Use memoization to prevent unnecessary renders

### State Management Best Practices

1. **Minimize State**: Keep state as minimal as possible
2. **Use Selectors**: Use selectors to access only needed state
3. **Batch Updates**: Batch state updates when possible
4. **Normalize Data**: Normalize complex data structures
5. **Use Immutable Updates**: Always use immutable patterns for updates

### CSS Best Practices

1. **Use Tailwind Utilities**: Prefer Tailwind classes over custom CSS
2. **Minimize CSS-in-JS**: Avoid runtime CSS-in-JS when possible
3. **Use CSS Variables**: Use CSS variables for theming
4. **Optimize Animations**: Use `will-change` and `transform` for animations
5. **Reduce Layout Shifts**: Minimize layout shifts during loading

## Future Improvements

1. **Server-Side Rendering**: Implement SSR for improved initial load
2. **Web Workers**: Offload heavy computations to web workers
3. **Progressive Web App**: Implement PWA features for offline support
4. **Preloading**: Implement intelligent preloading for common paths
5. **Performance Budget**: Establish and enforce a performance budget 