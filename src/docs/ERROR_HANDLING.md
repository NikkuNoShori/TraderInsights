# Error Handling

This document outlines the error handling strategy implemented in TraderInsights.

## Overview

TraderInsights implements a comprehensive error handling strategy with multiple layers:

1. **Error Boundaries**: React error boundaries to catch and display UI errors
2. **API Error Handling**: Consistent handling of API errors
3. **Form Validation**: Client-side validation with Zod
4. **Global Error Handling**: Window-level error handlers

## Error Boundaries

### Implementation

The application uses React's Error Boundary feature to catch and handle errors in the component tree:

```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="p-6 bg-error/10 rounded-lg">
          <div className="flex items-center gap-2 text-error">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>
          <p className="mt-2 text-error">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-error text-white rounded-md hover:opacity-90"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error Boundary Hierarchy

The application implements error boundaries at different levels:

1. **Root Level**: Catches application-wide errors
2. **Route Level**: Catches errors within specific routes
3. **Component Level**: Catches errors within specific components

### Specialized Error Boundaries

The application provides specialized error boundaries for different UI contexts:

```typescript
// src/components/ErrorBoundaries.tsx
export const errorBoundaries = {
  page: withErrorBoundary(ErrorBoundary, <PageErrorFallback />),
  card: withErrorBoundary(ErrorBoundary, <CardErrorFallback />),
  input: withErrorBoundary(ErrorBoundary, <InputErrorFallback />),
  button: withErrorBoundary(ErrorBoundary, <ButtonErrorFallback />),
};
```

### Higher-Order Component

A higher-order component is provided for easy integration:

```typescript
// src/components/hoc/withErrorBoundary.tsx
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode,
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
```

## API Error Handling

### Consistent Error Structure

API errors are handled consistently throughout the application:

```typescript
try {
  const { data, error } = await supabase.from("trades").select("*");
  if (error) throw error;
  return data;
} catch (error) {
  console.error("Error fetching trades:", error);
  throw error; // Re-throw for React Query or other handlers
}
```

### React Query Integration

React Query provides built-in error handling:

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ["trades"],
  queryFn: fetchTrades,
  onError: (error) => {
    toast.error(`Failed to fetch trades: ${error.message}`);
  },
});

if (error) {
  return <ErrorDisplay error={error} />;
}
```

## Form Validation

### Zod Integration

The application uses Zod for form validation:

```typescript
const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  quantity: z.number().positive("Quantity must be positive"),
  entry_price: z.number().positive("Entry price must be positive"),
  // Additional fields...
});

// In a component
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(tradeSchema),
});
```

## Global Error Handling

### Window Error Handlers

The application sets up global error handlers:

```typescript
// src/main.tsx
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error("[Window Error]", { msg, url, lineNo, columnNo, error });
  return false;
};

window.onunhandledrejection = function (event) {
  console.error("[Unhandled Promise Rejection]", event.reason);
};
```

## Error Reporting

### Console Logging

Errors are currently logged to the console:

```typescript
console.error("[API Error]", error);
```

### Toast Notifications

User-facing errors are displayed using toast notifications:

```typescript
import { toast } from "react-hot-toast";

try {
  await addTrade(tradeData);
  toast.success("Trade added successfully");
} catch (error) {
  console.error("Error adding trade:", error);
  toast.error("Failed to add trade");
}
```

## Future Improvements

1. **Error Tracking Service**: Integrate with an error tracking service like Sentry
2. **Error Analytics**: Collect and analyze error patterns
3. **Improved Error Recovery**: Implement more sophisticated recovery mechanisms
4. **Offline Error Queueing**: Queue failed operations for retry when online 
# Error Handling

This document outlines the error handling strategy implemented in TraderInsights.

## Overview

TraderInsights implements a comprehensive error handling strategy with multiple layers:

1. **Error Boundaries**: React error boundaries to catch and display UI errors
2. **API Error Handling**: Consistent handling of API errors
3. **Form Validation**: Client-side validation with Zod
4. **Global Error Handling**: Window-level error handlers

## Error Boundaries

### Implementation

The application uses React's Error Boundary feature to catch and handle errors in the component tree:

```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="p-6 bg-error/10 rounded-lg">
          <div className="flex items-center gap-2 text-error">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>
          <p className="mt-2 text-error">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-error text-white rounded-md hover:opacity-90"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Error Boundary Hierarchy

The application implements error boundaries at different levels:

1. **Root Level**: Catches application-wide errors
2. **Route Level**: Catches errors within specific routes
3. **Component Level**: Catches errors within specific components

### Specialized Error Boundaries

The application provides specialized error boundaries for different UI contexts:

```typescript
// src/components/ErrorBoundaries.tsx
export const errorBoundaries = {
  page: withErrorBoundary(ErrorBoundary, <PageErrorFallback />),
  card: withErrorBoundary(ErrorBoundary, <CardErrorFallback />),
  input: withErrorBoundary(ErrorBoundary, <InputErrorFallback />),
  button: withErrorBoundary(ErrorBoundary, <ButtonErrorFallback />),
};
```

### Higher-Order Component

A higher-order component is provided for easy integration:

```typescript
// src/components/hoc/withErrorBoundary.tsx
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode,
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
```

## API Error Handling

### Consistent Error Structure

API errors are handled consistently throughout the application:

```typescript
try {
  const { data, error } = await supabase.from("trades").select("*");
  if (error) throw error;
  return data;
} catch (error) {
  console.error("Error fetching trades:", error);
  throw error; // Re-throw for React Query or other handlers
}
```

### React Query Integration

React Query provides built-in error handling:

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ["trades"],
  queryFn: fetchTrades,
  onError: (error) => {
    toast.error(`Failed to fetch trades: ${error.message}`);
  },
});

if (error) {
  return <ErrorDisplay error={error} />;
}
```

## Form Validation

### Zod Integration

The application uses Zod for form validation:

```typescript
const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  quantity: z.number().positive("Quantity must be positive"),
  entry_price: z.number().positive("Entry price must be positive"),
  // Additional fields...
});

// In a component
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(tradeSchema),
});
```

## Global Error Handling

### Window Error Handlers

The application sets up global error handlers:

```typescript
// src/main.tsx
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error("[Window Error]", { msg, url, lineNo, columnNo, error });
  return false;
};

window.onunhandledrejection = function (event) {
  console.error("[Unhandled Promise Rejection]", event.reason);
};
```

## Error Reporting

### Console Logging

Errors are currently logged to the console:

```typescript
console.error("[API Error]", error);
```

### Toast Notifications

User-facing errors are displayed using toast notifications:

```typescript
import { toast } from "react-hot-toast";

try {
  await addTrade(tradeData);
  toast.success("Trade added successfully");
} catch (error) {
  console.error("Error adding trade:", error);
  toast.error("Failed to add trade");
}
```

## Future Improvements

1. **Error Tracking Service**: Integrate with an error tracking service like Sentry
2. **Error Analytics**: Collect and analyze error patterns
3. **Improved Error Recovery**: Implement more sophisticated recovery mechanisms
4. **Offline Error Queueing**: Queue failed operations for retry when online 