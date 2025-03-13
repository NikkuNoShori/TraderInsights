# State Management

This document outlines the state management approach used in TraderInsights, including the migration from React Context to Zustand and the implementation of React Query for data fetching.

## Overview

TraderInsights uses a hybrid state management approach:

1. **Zustand**: For global application state
2. **React Query**: For server state and data fetching
3. **Local Component State**: For component-specific state

## Zustand Implementation

### Core Stores

The application uses several Zustand stores to manage different aspects of the application state:

#### Auth Store (`authStore.ts`)

Manages authentication state, including user information, profile data, and authentication actions.

```typescript
// Example from src/stores/authStore.ts
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // State
  user: null,
  profile: null,
  isInitialized: false,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  signIn: async (email, password) => {
    // Implementation
  },
  
  // Other actions...
}));
```

#### Dashboard Store (`dashboardStore.ts`)

Manages dashboard layout and configuration, including dashboard profiles and layouts.

```typescript
// Example from src/stores/dashboardStore.ts
export const useDashboardStore = create(
  persist<DashboardState & DashboardActions>(
    (set, get) => ({
      // State and actions implementation
    }),
    {
      name: "dashboard-storage",
    }
  )
);
```

#### Filter Store (`filterStore.ts`)

Manages filter state for trades and other data.

```typescript
// Example from src/stores/filterStore.ts
export const useFilterStore = create(
  persist<FilterState & FilterActions>(
    (set) => ({
      // State and actions implementation
    }),
    {
      name: "filter-storage",
    }
  )
);
```

#### Trade Store (`tradeStore.ts`)

Manages trade data and operations.

```typescript
// Example from src/stores/tradeStore.ts
export const useTradeStore = create<TradeState & TradeActions>((set, get) => ({
  // State and actions implementation
}));
```

### Best Practices

1. **Separation of Concerns**: Each store focuses on a specific domain
2. **Type Safety**: All stores use TypeScript for type safety
3. **Persistence**: Some stores use the `persist` middleware for local storage persistence
4. **Immutability**: State updates follow immutability principles

## React Query Implementation

React Query is used for server state management and data fetching.

### Setup

```typescript
// src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

// In the app component
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Custom Hooks

The application uses custom hooks that leverage React Query for data fetching:

```typescript
// Example from src/hooks/useTrade.ts
export function useTrade(id?: string) {
  return useQuery({
    queryKey: ["trade", id],
    queryFn: async () => {
      if (!id) throw new Error("Trade ID is required");

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Trade;
    },
    enabled: !!id,
  });
}
```

### Benefits

1. **Caching**: Automatic caching of API responses
2. **Deduplication**: Preventing duplicate requests
3. **Background Refreshing**: Keeping data fresh while minimizing user impact
4. **Pagination Support**: Built-in support for paginated data
5. **Optimistic Updates**: Updating the UI before the server responds

## Integration with Components

Components access state through hooks:

```typescript
// Example component using both Zustand and React Query
function TradeList() {
  const { user } = useAuthStore();
  const { filters } = useFilterStore();
  const { data, isLoading, error } = useTrades(user?.id, filters);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data.trades.map(trade => (
        <TradeCard key={trade.id} trade={trade} />
      ))}
    </div>
  );
}
```

## Migration from Context

The application has successfully migrated from React Context to Zustand:

1. **Context Removal**: All context providers have been removed
2. **Hook Replacement**: Custom hooks now use Zustand stores
3. **Simplified Provider Structure**: Fewer providers in the component tree
4. **Improved Performance**: More efficient updates with Zustand

## Future Improvements

1. **Selector Optimization**: Further optimize selectors to prevent unnecessary re-renders
2. **Middleware Expansion**: Add more middleware for logging, validation, etc.
3. **State Persistence Strategy**: Refine what state should be persisted
4. **Server State Synchronization**: Improve synchronization between client and server state 