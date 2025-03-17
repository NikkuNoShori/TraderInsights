# Troubleshooting Guide

This document provides solutions for common issues encountered in the TraderInsights application and strategies for debugging problems.

## Table of Contents

1. [Common Issues](#common-issues)
   - [Application Startup Issues](#application-startup-issues)
   - [Authentication Problems](#authentication-problems)
   - [Data Loading Issues](#data-loading-issues)
   - [Chart Rendering Problems](#chart-rendering-problems)
   - [WebUll Integration Issues](#webull-integration-issues)
   - [Performance Problems](#performance-problems)
   - [Theme and UI Issues](#theme-and-ui-issues)
   - [API Connection Problems](#api-connection-problems)

2. [Debugging Strategies](#debugging-strategies)
   - [Client-Side Debugging](#client-side-debugging)
   - [Network Debugging](#network-debugging)
   - [State Management Debugging](#state-management-debugging)
   - [Performance Debugging](#performance-debugging)

3. [Error Messages Reference](#error-messages-reference)
   - [API Error Codes](#api-error-codes)
   - [Application Error Messages](#application-error-messages)

4. [Logging and Monitoring](#logging-and-monitoring)
   - [Enabling Debug Logs](#enabling-debug-logs)
   - [Using Sentry for Error Tracking](#using-sentry-for-error-tracking)
   - [Performance Monitoring](#performance-monitoring)

5. [Support Resources](#support-resources)
   - [Getting Help](#getting-help)
   - [Reporting Bugs](#reporting-bugs)

## Common Issues

### Application Startup Issues

#### Issue: Application fails to start with "Module not found" error

**Symptoms:**
- Error message in console: "Module not found: Error: Can't resolve [module-name]"
- Blank screen with no content

**Solutions:**
1. Ensure all dependencies are installed:
   ```powershell
   npm install
   ```

2. Clear node_modules and reinstall:
   ```powershell
   rm -r -fo node_modules
   rm package-lock.json
   npm install
   ```

3. Check for missing peer dependencies:
   ```powershell
   npm ls
   ```

#### Issue: Environment variables not loading

**Symptoms:**
- API calls failing with authentication errors
- Features dependent on environment variables not working

**Solutions:**
1. Verify `.env.local` file exists in the project root
2. Ensure all required variables are defined (see [Deployment Guide](./DEPLOYMENT.md))
3. Restart the development server:
   ```powershell
   npm run dev
   ```
4. For production builds, ensure environment variables are set in the deployment platform

### Authentication Problems

#### Issue: Unable to log in

**Symptoms:**
- Login form submits but returns to login screen
- Error message about invalid credentials

**Solutions:**
1. Verify Supabase credentials in environment variables
2. Check browser console for specific error messages
3. Clear browser cookies and local storage:
   ```javascript
   // In browser console
   localStorage.clear()
   ```
4. Verify the user account exists in Supabase

#### Issue: Session unexpectedly expires

**Symptoms:**
- User is suddenly logged out during active use
- "Unauthorized" errors in API calls

**Solutions:**
1. Check Supabase session duration settings
2. Verify the refresh token is being properly handled
3. Implement the session refresh logic:
   ```typescript
   // src/hooks/useAuth.ts
   useEffect(() => {
     const { data: authListener } = supabase.auth.onAuthStateChange(
       (event, session) => {
         if (session) {
           setUser(session.user);
         } else {
           setUser(null);
         }
       }
     );
     
     return () => {
       authListener.subscription.unsubscribe();
     };
   }, []);
   ```

### Data Loading Issues

#### Issue: Data not loading or displaying

**Symptoms:**
- Empty charts or tables
- Loading spinner that never resolves
- Error messages about failed data fetching

**Solutions:**
1. Check API keys for external data providers (Polygon.io, Alpha Vantage)
2. Verify network requests in browser developer tools
3. Check for rate limiting issues (common with free API tiers)
4. Implement proper error handling for API calls:
   ```typescript
   const { data, error, isLoading } = useQuery({
     queryKey: ['data', params],
     queryFn: fetchData,
     retry: 3,
     onError: (err) => {
       logger.error('Failed to fetch data', err);
       toast.error('Failed to load data. Please try again later.');
     }
   });
   ```

#### Issue: Stale data being displayed

**Symptoms:**
- Outdated information shown even after known updates
- Data doesn't refresh when expected

**Solutions:**
1. Manually invalidate React Query cache:
   ```typescript
   const queryClient = useQueryClient();
   queryClient.invalidateQueries(['queryKey']);
   ```
2. Adjust staleTime and cacheTime settings:
   ```typescript
   const { data } = useQuery({
     queryKey: ['data'],
     queryFn: fetchData,
     staleTime: 5 * 60 * 1000, // 5 minutes
     cacheTime: 10 * 60 * 1000, // 10 minutes
   });
   ```
3. Implement proper refetch intervals for real-time data:
   ```typescript
   const { data } = useQuery({
     queryKey: ['realTimeData'],
     queryFn: fetchRealTimeData,
     refetchInterval: 30000, // Refetch every 30 seconds
   });
   ```

### Chart Rendering Problems

#### Issue: Charts not rendering correctly

**Symptoms:**
- Blank or partially rendered charts
- Error messages in console related to chart libraries
- Visual glitches in chart display

**Solutions:**
1. Check if data is properly formatted for the chart library
2. Verify container dimensions (charts often need explicit width/height)
3. Implement proper loading and error states:
   ```tsx
   {isLoading && <LoadingSpinner />}
   {error && <ErrorMessage message="Failed to load chart data" />}
   {data && !isLoading && !error && <Chart data={data} />}
   ```
4. Check for theme-related issues (dark/light mode compatibility)

#### Issue: Chart performance issues

**Symptoms:**
- Slow rendering or updates
- Browser lag when interacting with charts
- High CPU usage

**Solutions:**
1. Reduce data points for large datasets:
   ```typescript
   const optimizedData = useMemo(() => {
     if (data.length > 1000) {
       return downsampleData(data, 500); // Reduce to 500 points
     }
     return data;
   }, [data]);
   ```
2. Use memoization to prevent unnecessary re-renders:
   ```typescript
   const chartOptions = useMemo(() => ({
     // Chart options
   }), [dependencies]);
   ```
3. Consider using a more performant chart library for large datasets

### WebUll Integration Issues

#### Issue: Unable to import WebUll data

**Symptoms:**
- Import process fails or times out
- Error messages about invalid data format
- Incomplete data after import

**Solutions:**
1. Verify WebUll API credentials
2. Check the format of the import file
3. Implement proper validation for imported data:
   ```typescript
   const validateTradeData = (data: unknown): data is WebullTrade[] => {
     if (!Array.isArray(data)) return false;
     return data.every(item => 
       typeof item.symbol === 'string' &&
       typeof item.quantity === 'number' &&
       typeof item.price === 'number'
     );
   };
   ```
4. See [WebUll Integration](./WEBULL_INTEGRATION.md) for detailed troubleshooting

### Performance Problems

#### Issue: Slow application performance

**Symptoms:**
- Laggy UI interactions
- Slow page transitions
- High memory usage

**Solutions:**
1. Implement code splitting for routes and heavy components
2. Use virtualization for long lists:
   ```tsx
   import { useVirtualizer } from '@tanstack/react-virtual';
   
   function VirtualizedList({ items }) {
     const parentRef = useRef(null);
     
     const virtualizer = useVirtualizer({
       count: items.length,
       getScrollElement: () => parentRef.current,
       estimateSize: () => 50,
     });
     
     return (
       <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
         <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
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
               {items[virtualItem.index].content}
             </div>
           ))}
         </div>
       </div>
     );
   }
   ```
3. Optimize React renders with memoization:
   ```tsx
   const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
     // Custom comparison logic
     return prevProps.id === nextProps.id;
   });
   ```
4. See [Performance Guide](./PERFORMANCE.md) for detailed optimization strategies

### Theme and UI Issues

#### Issue: Theme not applying correctly

**Symptoms:**
- Inconsistent colors or styles
- Theme doesn't change when toggled
- Visual elements not respecting dark/light mode

**Solutions:**
1. Verify theme class is being applied to the HTML element:
   ```typescript
   // src/stores/themeStore.ts
   const updateThemeClass = (theme: Theme) => {
     if (theme === 'dark' || (theme === 'system' && prefersDarkMode)) {
       document.documentElement.classList.add('dark');
     } else {
       document.documentElement.classList.remove('dark');
     }
   };
   ```
2. Check CSS variables in theme.css
3. Ensure components are using theme-aware classes:
   ```tsx
   <div className="bg-default text-default">
     Content
   </div>
   ```
4. Verify Tailwind dark mode configuration:
   ```javascript
   // tailwind.config.js
   module.exports = {
     darkMode: 'class',
     // ...
   };
   ```

#### Issue: UI components not rendering as expected

**Symptoms:**
- Misaligned elements
- Styling inconsistencies
- Responsive design issues

**Solutions:**
1. Check for CSS conflicts
2. Verify correct Tailwind classes are being used
3. Use browser developer tools to inspect element styles
4. Test on different screen sizes and browsers

### API Connection Problems

#### Issue: API requests failing

**Symptoms:**
- Network errors in console
- "Failed to fetch" errors
- Timeout errors

**Solutions:**
1. Verify API endpoints are correct
2. Check for CORS issues:
   ```typescript
   // Server-side CORS configuration
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization'],
   }));
   ```
3. Implement proper error handling and retries:
   ```typescript
   const fetchWithRetry = async (url: string, options: RequestInit, retries = 3) => {
     try {
       return await fetch(url, options);
     } catch (error) {
       if (retries <= 0) throw error;
       await new Promise(resolve => setTimeout(resolve, 1000));
       return fetchWithRetry(url, options, retries - 1);
     }
   };
   ```
4. Check for rate limiting issues with external APIs

## Debugging Strategies

### Client-Side Debugging

#### Using Browser Developer Tools

1. **Console Debugging**:
   - Use `console.log()`, `console.error()`, and `console.warn()` for basic debugging
   - Use `console.table()` for structured data
   - Use `console.group()` and `console.groupEnd()` for grouped logs

2. **React DevTools**:
   - Install the React Developer Tools browser extension
   - Use the Components tab to inspect component props and state
   - Use the Profiler tab to identify performance bottlenecks

3. **Breakpoint Debugging**:
   - Set breakpoints in the Sources tab
   - Use conditional breakpoints for specific scenarios
   - Step through code execution

#### Debugging React Components

1. **Component Rendering**:
   - Add console logs in render functions and useEffect hooks
   - Use the `why-did-you-render` library to track re-renders:
     ```typescript
     // src/wdyr.ts
     import React from 'react';
     
     if (process.env.NODE_ENV === 'development') {
       const whyDidYouRender = require('@welldone-software/why-did-you-render');
       whyDidYouRender(React, {
         trackAllComponents: true,
       });
     }
     ```

2. **Props and State**:
   - Log props and state changes
   - Use React DevTools to inspect component tree
   - Implement debug render props:
     ```tsx
     <Component
       {...props}
       debug={process.env.NODE_ENV === 'development'}
     />
     ```

### Network Debugging

1. **Inspecting Network Requests**:
   - Use the Network tab in browser developer tools
   - Filter requests by type (XHR, Fetch, WebSocket)
   - Examine request/response headers and payloads

2. **Mocking API Responses**:
   - Use MSW (Mock Service Worker) for local development:
     ```typescript
     // src/mocks/handlers.ts
     import { rest } from 'msw';
     
     export const handlers = [
       rest.get('/api/data', (req, res, ctx) => {
         return res(
           ctx.status(200),
           ctx.json({ data: 'mocked data' })
         );
       }),
     ];
     ```

3. **Debugging CORS Issues**:
   - Check for CORS errors in console
   - Verify server CORS configuration
   - Use browser extensions to temporarily disable CORS for testing

### State Management Debugging

1. **Zustand Store Debugging**:
   - Use the Redux DevTools extension with Zustand:
     ```typescript
     // src/stores/store.ts
     import { devtools } from 'zustand/middleware';
     
     export const useStore = create(
       devtools(
         (set) => ({
           // Store state and actions
         }),
         { name: 'AppStore' }
       )
     );
     ```
   - Log state changes with middleware:
     ```typescript
     const logMiddleware = (config) => (set, get, api) => 
       config(
         (...args) => {
           console.log('Previous state:', get());
           set(...args);
           console.log('Next state:', get());
         },
         get,
         api
       );
     
     export const useStore = create(
       devtools(
         logMiddleware((set) => ({
           // Store state and actions
         }))
       )
     );
     ```

2. **React Query Debugging**:
   - Use React Query DevTools:
     ```tsx
     // src/App.tsx
     import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
     
     function App() {
       return (
         <QueryClientProvider client={queryClient}>
           {/* App components */}
           <ReactQueryDevtools initialIsOpen={false} />
         </QueryClientProvider>
       );
     }
     ```
   - Enable detailed logging:
     ```typescript
     const queryClient = new QueryClient({
       logger: {
         log: console.log,
         warn: console.warn,
         error: console.error,
       },
     });
     ```

### Performance Debugging

1. **React Profiler**:
   - Use React DevTools Profiler to record and analyze renders
   - Identify components that render too frequently
   - Look for cascading renders

2. **Lighthouse Audits**:
   - Run Lighthouse audits in Chrome DevTools
   - Focus on Performance, Accessibility, and Best Practices
   - Implement suggested improvements

3. **Memory Leaks**:
   - Use Chrome DevTools Memory tab to take heap snapshots
   - Look for growing memory usage over time
   - Check for unmounted component subscriptions:
     ```typescript
     useEffect(() => {
       const subscription = subscribe();
       
       return () => {
         // Clean up subscription to prevent memory leaks
         subscription.unsubscribe();
       };
     }, []);
     ```

## Error Messages Reference

### API Error Codes

| Code | Description | Troubleshooting Steps |
|------|-------------|----------------------|
| 400  | Bad Request | Check request parameters and payload format |
| 401  | Unauthorized | Verify authentication token is valid and not expired |
| 403  | Forbidden | Check user permissions for the requested resource |
| 404  | Not Found | Verify the resource exists and the URL is correct |
| 429  | Too Many Requests | Implement rate limiting handling and backoff strategy |
| 500  | Internal Server Error | Check server logs for detailed error information |
| 503  | Service Unavailable | Verify service health and implement retry logic |

### Application Error Messages

| Error Message | Possible Causes | Solutions |
|---------------|----------------|-----------|
| "Failed to fetch" | Network issues, CORS, server down | Check network connection, verify CORS settings, check server status |
| "Invalid API key" | Incorrect or expired API key | Update API key in environment variables |
| "User not authenticated" | Missing or expired auth token | Re-authenticate user, implement token refresh |
| "Rate limit exceeded" | Too many requests to external API | Implement rate limiting, caching, and backoff strategy |
| "Invalid data format" | Malformed data from API or user input | Validate data with Zod or similar, add error handling |
| "Chart data processing error" | Issues with data transformation | Check data format, implement error boundaries |

## Logging and Monitoring

### Enabling Debug Logs

To enable detailed logging:

1. Set the log level in environment variables:
   ```
   VITE_LOG_LEVEL=debug
   ```

2. Use the logger utility for consistent logging:
   ```typescript
   import { logger } from '@/utils/logger';
   
   logger.debug('Detailed information', { data });
   logger.info('General information');
   logger.warn('Warning message');
   logger.error('Error message', error);
   ```

3. View logs in browser console or server logs

### Using Sentry for Error Tracking

1. Configure Sentry in your application:
   ```typescript
   // src/main.tsx
   import * as Sentry from '@sentry/react';
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     integrations: [new Sentry.BrowserTracing()],
     tracesSampleRate: 0.2,
   });
   ```

2. Capture specific errors:
   ```typescript
   try {
     // Risky operation
   } catch (error) {
     logger.error('Operation failed', error);
     Sentry.captureException(error);
   }
   ```

3. Add context to errors:
   ```typescript
   Sentry.configureScope((scope) => {
     scope.setUser({ id: user.id });
     scope.setTag('feature', 'charts');
   });
   ```

### Performance Monitoring

1. Track web vitals:
   ```typescript
   // src/utils/webVitals.ts
   import { ReportHandler } from 'web-vitals';
   
   export function reportWebVitals(onPerfEntry?: ReportHandler) {
     if (onPerfEntry && onPerfEntry instanceof Function) {
       import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
         getCLS(onPerfEntry);
         getFID(onPerfEntry);
         getFCP(onPerfEntry);
         getLCP(onPerfEntry);
         getTTFB(onPerfEntry);
       });
     }
   }
   ```

2. Custom performance measurements:
   ```typescript
   // Measure operation duration
   const start = performance.now();
   // Perform operation
   const duration = performance.now() - start;
   logger.debug(`Operation took ${duration}ms`);
   ```

3. React Query performance optimization:
   ```typescript
   const { data, isLoading } = useQuery({
     queryKey: ['data'],
     queryFn: fetchData,
     staleTime: 5 * 60 * 1000, // 5 minutes
     cacheTime: 30 * 60 * 1000, // 30 minutes
   });
   ```

## Support Resources

### Getting Help

If you encounter issues not covered in this guide:

1. **Internal Documentation**:
   - Review other documentation files in the `/docs` directory
   - Check for specific component documentation

2. **External Resources**:
   - React Query documentation: https://tanstack.com/query/latest/docs/react/overview
   - Zustand documentation: https://github.com/pmndrs/zustand
   - Tailwind CSS documentation: https://tailwindcss.com/docs

3. **Community Support**:
   - Stack Overflow with relevant tags
   - React community Discord
   - GitHub discussions

### Reporting Bugs

When reporting bugs:

1. **Provide Clear Steps to Reproduce**:
   - Detailed steps to reproduce the issue
   - Expected vs. actual behavior
   - Environment information (browser, OS, app version)

2. **Include Relevant Information**:
   - Screenshots or screen recordings
   - Console errors
   - Network request/response data
   - User actions that triggered the issue

3. **Use the Issue Template**:
   - Fill out all sections of the bug report template
   - Tag the issue appropriately
   - Link to related issues if applicable 