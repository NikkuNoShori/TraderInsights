# API Documentation

This document provides comprehensive documentation for the API integrations used in TraderInsights.

## Overview

TraderInsights integrates with multiple external APIs to provide market data, trade information, and financial analytics:

1. **Polygon.io**: Primary source for market data
2. **Alpha Vantage**: Secondary source for financial data and analytics
3. **SnapTrade**: Integration for trade data import and broker connections
4. **Supabase**: Backend database and authentication

## Polygon.io Integration

### Overview

Polygon.io is used as the primary source for market data, providing both historical and real-time data through REST and WebSocket APIs.

### Authentication

```typescript
// Authentication is handled via API key in request headers
const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;

// Example API call with authentication
const fetchMarketData = async (symbol: string) => {
  const response = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/2023-01-01/2023-12-31?apiKey=${POLYGON_API_KEY}`
  );
  return await response.json();
};
```

### REST API Endpoints

#### Market Data

```typescript
// src/services/polygonService.ts

// Get daily price data
export const getDailyPrices = async (
  symbol: string,
  from: string,
  to: string
): Promise<PolygonAggregatesResponse> => {
  const url = `${BASE_URL}/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?apiKey=${API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch daily prices: ${response.statusText}`);
  }
  
  return await response.json();
};

// Get ticker details
export const getTickerDetails = async (
  symbol: string
): Promise<PolygonTickerDetailsResponse> => {
  const url = `${BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ticker details: ${response.statusText}`);
  }
  
  return await response.json();
};

// Search for tickers
export const searchTickers = async (
  query: string
): Promise<PolygonTickerSearchResponse> => {
  const url = `${BASE_URL}/v3/reference/tickers?search=${query}&active=true&apiKey=${API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to search tickers: ${response.statusText}`);
  }
  
  return await response.json();
};
```

#### Market News

```typescript
// Get market news
export const getMarketNews = async (
  symbol?: string,
  limit: number = 10
): Promise<PolygonNewsResponse> => {
  const url = symbol
    ? `${BASE_URL}/v2/reference/news?ticker=${symbol}&limit=${limit}&apiKey=${API_KEY}`
    : `${BASE_URL}/v2/reference/news?limit=${limit}&apiKey=${API_KEY}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch market news: ${response.statusText}`);
  }
  
  return await response.json();
};
```

### WebSocket API

```typescript
// src/services/polygonWebSocket.ts

export class PolygonWebSocket {
  private socket: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  constructor(private apiKey: string) {}
  
  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    
    this.socket = new WebSocket(`wss://socket.polygon.io/stocks`);
    
    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onerror = this.handleError.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
  }
  
  private handleOpen() {
    console.log('Polygon WebSocket connected');
    this.reconnectAttempts = 0;
    
    // Authenticate
    this.socket?.send(JSON.stringify({ action: 'auth', params: this.apiKey }));
    
    // Resubscribe to previous subscriptions
    if (this.subscriptions.size > 0) {
      const channels = Array.from(this.subscriptions);
      this.socket?.send(JSON.stringify({ action: 'subscribe', params: channels.join(',') }));
    }
  }
  
  private handleMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    
    // Handle different message types
    if (data[0]?.ev === 'status') {
      console.log('Polygon status:', data[0].message);
    }
    
    // Dispatch event for subscribers
    const customEvent = new CustomEvent('polygon-data', { detail: data });
    window.dispatchEvent(customEvent);
  }
  
  private handleError(error: Event) {
    console.error('Polygon WebSocket error:', error);
  }
  
  private handleClose() {
    console.log('Polygon WebSocket closed');
    
    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }
  
  subscribe(channel: string) {
    this.subscriptions.add(channel);
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: 'subscribe', params: channel }));
    }
  }
  
  unsubscribe(channel: string) {
    this.subscriptions.delete(channel);
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: 'unsubscribe', params: channel }));
    }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
```

### Usage with React Query

```typescript
// src/hooks/usePolygonData.ts

import { useQuery } from '@tanstack/react-query';
import { getDailyPrices, getTickerDetails } from '@/services/polygonService';

export const useStockPrices = (symbol: string, from: string, to: string) => {
  return useQuery({
    queryKey: ['stockPrices', symbol, from, to],
    queryFn: () => getDailyPrices(symbol, from, to),
    enabled: !!symbol && !!from && !!to,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTickerDetails = (symbol: string) => {
  return useQuery({
    queryKey: ['tickerDetails', symbol],
    queryFn: () => getTickerDetails(symbol),
    enabled: !!symbol,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};
```

### Rate Limiting

Polygon.io has rate limits that need to be respected:

- **REST API**: 5 requests per minute for the free tier
- **WebSocket**: No strict limit, but excessive connections may be throttled

```typescript
// src/utils/rateLimiter.ts

export class RateLimiter {
  private timestamps: number[] = [];
  private readonly limit: number;
  private readonly interval: number;
  
  constructor(limit: number, interval: number) {
    this.limit = limit;
    this.interval = interval;
  }
  
  async throttle(): Promise<void> {
    const now = Date.now();
    
    // Remove timestamps outside the interval
    this.timestamps = this.timestamps.filter(
      timestamp => now - timestamp < this.interval
    );
    
    if (this.timestamps.length >= this.limit) {
      // Calculate time to wait
      const oldestTimestamp = this.timestamps[0];
      const timeToWait = this.interval - (now - oldestTimestamp);
      
      if (timeToWait > 0) {
        await new Promise(resolve => setTimeout(resolve, timeToWait));
      }
    }
    
    // Add current timestamp
    this.timestamps.push(Date.now());
  }
}

// Usage
const polygonRateLimiter = new RateLimiter(5, 60 * 1000); // 5 requests per minute

export const fetchWithRateLimit = async (url: string) => {
  await polygonRateLimiter.throttle();
  return fetch(url);
};
```

## Alpha Vantage Integration

### Overview

Alpha Vantage is used as a secondary source for financial data, providing fundamental data, economic indicators, and technical indicators.

### Authentication

```typescript
// Authentication is handled via API key in request parameters
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

// Example API call with authentication
const fetchFundamentalData = async (symbol: string) => {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apiKey=${ALPHA_VANTAGE_API_KEY}`
  );
  return await response.json();
};
```

### API Endpoints

```typescript
// src/services/alphaVantageService.ts

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

// Get company overview
export const getCompanyOverview = async (
  symbol: string
): Promise<AlphaVantageCompanyOverview> => {
  const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apiKey=${API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch company overview: ${response.statusText}`);
  }
  
  return await response.json();
};

// Get income statement
export const getIncomeStatement = async (
  symbol: string
): Promise<AlphaVantageIncomeStatement> => {
  const url = `${BASE_URL}?function=INCOME_STATEMENT&symbol=${symbol}&apiKey=${API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch income statement: ${response.statusText}`);
  }
  
  return await response.json();
};

// Get balance sheet
export const getBalanceSheet = async (
  symbol: string
): Promise<AlphaVantageBalanceSheet> => {
  const url = `${BASE_URL}?function=BALANCE_SHEET&symbol=${symbol}&apiKey=${API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch balance sheet: ${response.statusText}`);
  }
  
  return await response.json();
};

// Get cash flow
export const getCashFlow = async (
  symbol: string
): Promise<AlphaVantageCashFlow> => {
  const url = `${BASE_URL}?function=CASH_FLOW&symbol=${symbol}&apiKey=${API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cash flow: ${response.statusText}`);
  }
  
  return await response.json();
};
```

### Usage with React Query

```typescript
// src/hooks/useAlphaVantageData.ts

import { useQuery } from '@tanstack/react-query';
import {
  getCompanyOverview,
  getIncomeStatement,
  getBalanceSheet,
  getCashFlow,
} from '@/services/alphaVantageService';

export const useCompanyOverview = (symbol: string) => {
  return useQuery({
    queryKey: ['companyOverview', symbol],
    queryFn: () => getCompanyOverview(symbol),
    enabled: !!symbol,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const useFinancialStatements = (symbol: string) => {
  const incomeStatement = useQuery({
    queryKey: ['incomeStatement', symbol],
    queryFn: () => getIncomeStatement(symbol),
    enabled: !!symbol,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
  
  const balanceSheet = useQuery({
    queryKey: ['balanceSheet', symbol],
    queryFn: () => getBalanceSheet(symbol),
    enabled: !!symbol,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
  
  const cashFlow = useQuery({
    queryKey: ['cashFlow', symbol],
    queryFn: () => getCashFlow(symbol),
    enabled: !!symbol,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
  
  return {
    incomeStatement,
    balanceSheet,
    cashFlow,
    isLoading: incomeStatement.isLoading || balanceSheet.isLoading || cashFlow.isLoading,
    isError: incomeStatement.isError || balanceSheet.isError || cashFlow.isError,
  };
};
```

### Rate Limiting

Alpha Vantage has strict rate limits:

- **Free Tier**: 5 API requests per minute and 500 requests per day
- **Premium Tier**: Higher limits based on subscription

```typescript
// Using the same rate limiter as Polygon.io
const alphaVantageRateLimiter = new RateLimiter(5, 60 * 1000); // 5 requests per minute

export const fetchAlphaVantageWithRateLimit = async (url: string) => {
  await alphaVantageRateLimiter.throttle();
  return fetch(url);
};
```

## SnapTrade Integration

The SnapTrade integration uses the official `snaptrade-typescript-sdk` package. We have implemented a custom wrapper around the SDK that provides additional benefits:

1. **Consistent Error Handling**: The wrapper standardizes error handling across all SnapTrade API calls
2. **Type Safety**: Enhanced type safety through custom type definitions
3. **Centralized Configuration**: Single source of truth for SDK configuration
4. **Easy SDK Implementation Switching**: Ability to switch SDK implementations if needed

### SDK Configuration

The SDK is configured in `src/lib/snaptrade/client.ts`:

```typescript
const snaptrade = new Snaptrade({
  clientId: config.clientId,
  consumerKey: config.consumerKey,
  basePath: "https://api.snaptrade.com/api/v1" // Production endpoint
});
```

### Connection Flow

The connection flow is implemented in `src/components/broker/BrokerConnectionPortal.tsx`:

1. Initialize the SnapTrade client with configuration
2. Store session information for tracking
3. Get connection URL using the connections API
4. Redirect to the SnapTrade connection portal

### Error Handling

All SnapTrade errors are handled through our custom `SnapTradeError` type:

```typescript
interface SnapTradeError {
  message: string;
  code?: string;
  status?: number;
}
```

### Session Management

Connection sessions are managed through `StorageHelpers`:

```typescript
interface ConnectionSession {
  sessionId: string;
  userId: string;
  userSecret: string;
  brokerId: string;
  redirectUrl: string;
  createdAt: number;
  status: 'pending' | 'completed' | 'failed';
}
```

## Supabase Integration

### Overview

Supabase is used for authentication, database storage, and real-time updates.

### Authentication

```typescript
// src/services/supabaseService.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign up
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

// Sign in
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};
```

### Database Operations

```typescript
// src/services/tradeService.ts

import { supabase } from './supabaseService';
import { Trade } from '@/types/trade';

// Get trades
export const getTrades = async (userId: string): Promise<Trade[]> => {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Get trade by ID
export const getTradeById = async (tradeId: string): Promise<Trade> => {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('id', tradeId)
    .single();
  
  if (error) throw error;
  return data;
};

// Create trade
export const createTrade = async (trade: Omit<Trade, 'id' | 'created_at' | 'updated_at'>): Promise<Trade> => {
  const { data, error } = await supabase
    .from('trades')
    .insert(trade)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Update trade
export const updateTrade = async (tradeId: string, updates: Partial<Trade>): Promise<Trade> => {
  const { data, error } = await supabase
    .from('trades')
    .update(updates)
    .eq('id', tradeId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Delete trade
export const deleteTrade = async (tradeId: string): Promise<void> => {
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', tradeId);
  
  if (error) throw error;
};
```

### Real-time Subscriptions

```typescript
// src/hooks/useRealtimeSubscription.ts

import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseService';

export const useRealtimeSubscription = <T>(
  table: string,
  userId: string | undefined,
  callback?: (payload: T) => void
) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    // Create a channel
    const channel = supabase
      .channel(`public:${table}:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          if (callback) {
            callback(payload.new as T);
          }
        }
      )
      .subscribe();
    
    setChannel(channel);
    
    return () => {
      channel.unsubscribe();
    };
  }, [table, userId, callback]);
  
  return channel;
};

// Usage
const TradeList = () => {
  const { user } = useAuthStore();
  const { trades, setTrades } = useTradeStore();
  
  // Set up real-time subscription
  useRealtimeSubscription('trades', user?.id, (newTrade) => {
    setTrades([newTrade, ...trades.filter(t => t.id !== newTrade.id)]);
  });
  
  // Rest of component
};
```

## Error Handling

### API Error Handling

```typescript
// src/utils/apiErrorHandler.ts

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    // Handle specific API errors
    switch (error.status) {
      case 401:
        // Handle unauthorized
        break;
      case 403:
        // Handle forbidden
        break;
      case 404:
        // Handle not found
        break;
      case 429:
        // Handle rate limit
        break;
      default:
        // Handle other errors
        break;
    }
  } else if (error instanceof Error) {
    // Handle generic errors
    console.error('API Error:', error.message);
  } else {
    // Handle unknown errors
    console.error('Unknown API Error:', error);
  }
};
```

### React Query Error Handling

```typescript
// src/hooks/usePolygonData.ts

export const useStockPrices = (symbol: string, from: string, to: string) => {
  return useQuery({
    queryKey: ['stockPrices', symbol, from, to],
    queryFn: () => getDailyPrices(symbol, from, to),
    enabled: !!symbol && !!from && !!to,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching stock prices:', error);
      toast.error(`Failed to fetch stock prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
};
```

## Best Practices

### API Call Patterns

1. **Centralized Services**: All API calls are centralized in service files
2. **Error Handling**: Consistent error handling across all API calls
3. **Type Safety**: Strong typing for all API requests and responses
4. **Rate Limiting**: Respect API rate limits to avoid throttling
5. **Caching**: Use React Query for efficient caching and state management

### Security Considerations

1. **API Keys**: Store API keys in environment variables
2. **Authentication**: Use secure authentication methods
3. **CORS**: Handle CORS issues properly
4. **Data Validation**: Validate all API responses before use
5. **Error Handling**: Don't expose sensitive information in error messages

## Future Improvements

1. **API Gateway**: Implement an API gateway to centralize API calls
2. **Caching Strategy**: Refine caching strategy for better performance
3. **Error Reporting**: Implement centralized error reporting
4. **Rate Limit Handling**: Improve rate limit handling with backoff strategies
5. **API Versioning**: Handle API versioning gracefully

# SnapTrade API Documentation

This document provides detailed information about the SnapTrade API integration in TraderInsights.

## SDK Types and Interfaces

The SnapTrade integration uses the official `snaptrade-typescript-sdk` package. Here are the key types and interfaces:

### SnapTradeConfig

Configuration for the SnapTrade integration.

```typescript
interface SnapTradeConfig {
  clientId: string;          // SnapTrade client ID
  consumerKey: string;       // SnapTrade consumer key (used for authentication)
  redirectUri?: string;      // OAuth redirect URI
  isDemo?: boolean;          // Flag indicating if using demo credentials
}
```

### SnapTradeAccount

Represents a user's brokerage account.

```typescript
interface SnapTradeAccount {
  id: string;               // Unique account identifier
  name: string;             // Account name
  type: string;             // Account type (e.g., "MARGIN", "CASH")
  institution: string;      // Brokerage institution name
  status: string;           // Account status
  balances: SnapTradeBalance[];  // Account balances
  holdings: SnapTradeHolding[];  // Account holdings
  orders: SnapTradeOrder[];      // Account orders
}
```

### SnapTradeBalance

Represents an account balance.

```typescript
interface SnapTradeBalance {
  currency: string;         // Currency code (e.g., "USD")
  cash: number;            // Cash balance
  marketValue: number;     // Market value of holdings
  totalValue: number;      // Total account value
  buyingPower: number;     // Available buying power
}
```

### SnapTradeHolding

Represents a position in an account.

```typescript
interface SnapTradeHolding {
  symbol: string;          // Security symbol
  quantity: number;        // Number of shares/units
  averagePrice: number;    // Average purchase price
  marketValue: number;     // Current market value
  unrealizedPnl: number;   // Unrealized profit/loss
  realizedPnl: number;     // Realized profit/loss
}
```

### SnapTradeOrder

Represents an order in an account.

```typescript
interface SnapTradeOrder {
  id: string;              // Unique order identifier
  symbol: string;          // Security symbol
  side: "BUY" | "SELL";   // Order side
  type: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";  // Order type
  quantity: number;        // Order quantity
  price?: number;          // Order price (for limit orders)
  status: string;          // Order status
  filledQuantity: number;  // Filled quantity
  filledPrice?: number;    // Average fill price
  createdAt: string;       // Order creation timestamp
  updatedAt: string;       // Last update timestamp
}
```

## API Methods

### Authentication

#### generateSnapTradeAuth

Generates authentication credentials for SnapTrade.

```typescript
async function generateSnapTradeAuth(config: SnapTradeConfig): Promise<{
  clientId: string;
  timestamp: string;
  signature: string;
}>
```

#### createSnapTradeClient

Creates a SnapTrade client instance.

```typescript
async function createSnapTradeClient(config: SnapTradeConfig): Promise<Snaptrade>
```

### User Management

#### registerUser

Registers a new user with SnapTrade.

```typescript
async function registerUser(userId: string): Promise<string>
```

#### login

Logs in a user with SnapTrade.

```typescript
async function login(userId: string, userSecret: string): Promise<void>
```

### Account Management

#### getBrokerages

Retrieves available brokerages.

```typescript
async function getBrokerages(): Promise<Brokerage[]>
```

#### createConnectionLink

Creates a connection link for OAuth authentication.

```typescript
async function createConnectionLink(brokerageId: string): Promise<string>
```

#### getUserConnections

Retrieves user's brokerage connections.

```typescript
async function getUserConnections(): Promise<SnapTradeConnection[]>
```

#### getUserAccounts

Retrieves user's accounts.

```