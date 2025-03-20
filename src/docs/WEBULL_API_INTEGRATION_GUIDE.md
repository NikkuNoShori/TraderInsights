# WebUll API Integration Guide

This guide outlines the process for implementing a new WebUll API client integration to replace the existing implementations.

## Overview

The TraderInsights application needs to integrate with WebUll to import trading data. The current implementation uses a mix of unofficial packages (`webull-api-node` and `webull-api-ts`) which need to be replaced with a more reliable solution.

## Current Implementation Status

The existing WebUll integration is distributed across several parts of the codebase:

1. **API Client**: `src/lib/webull/client.ts`
2. **Type Definitions**: `src/types/webull.d.ts` and `src/lib/webull/types.ts`
3. **Service Layer**: `src/services/webullService.ts`
4. **UI Components**: `src/components/webull/WebullTest.tsx` and `src/components/trades/WebullImportForm.tsx`
5. **Utilities**: `src/utils/webullTransforms.ts`
6. **Documentation**: Various files in `src/lib/webull/`

## Step 1: Removing Existing Implementation

Before implementing the new API client, we need to clean up the existing implementation:

### Files to Delete

```
src/lib/webull/client.ts
src/lib/webull/types.ts
src/lib/webull/test.ts
src/lib/webull/storage.ts
src/lib/webull/TROUBLESHOOTING.md
src/lib/webull/TECHNICAL.md
src/lib/webull/SUMMARY.md
src/lib/webull/README.md
src/lib/webull/QUICKSTART.md
src/types/webull.d.ts
src/components/webull/WebullTest.tsx
```

### Files to Temporarily Preserve (but will need modification)

```
src/services/webullService.ts  (Will be completely rewritten)
src/utils/webullTransforms.ts  (Will be adapted to new API structure)
src/components/trades/WebullImportForm.tsx  (UI will be preserved but backend calls updated)
```

## Step 2: Setting Up the New API Client

### Required Features

The new WebUll API client should support:

1. **Authentication**
   - Login with username/password
   - Optional MFA support
   - Token management (refresh, expiry)
   - Secure credential handling

2. **Trade Data**
   - Fetching trade history
   - Filtering by date range
   - Handling pagination

3. **Account Information**
   - Retrieving account details
   - Getting current positions
   - Fetching portfolio performance

4. **Error Handling**
   - Proper error types and messages
   - Rate limit handling
   - Retry mechanisms

### Core Components to Implement

#### 1. Type Definitions (`src/types/webull.ts`)

Create a new type definitions file with clear interfaces for all WebUll entities:

```typescript
// WebUll API credentials
export interface WebullCredentials {
  username: string;
  password: string;
  mfaCode?: string;
  deviceId?: string;
}

// Authentication response
export interface WebullAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  // Other fields as needed
}

// Trade/Order data structure
export interface WebullOrder {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  quantity: number;
  filledQuantity: number;
  price?: number;
  filledPrice?: number;
  status: string;
  createTime: string;
  updateTime: string;
  // Other fields as needed
}

// Position data structure
export interface WebullPosition {
  symbol: string;
  quantity: number;
  costBasis: number;
  marketValue: number;
  // Other fields as needed
}

// Account data structure
export interface WebullAccount {
  id: string;
  accountType: string;
  cash: number;
  buyingPower: number;
  // Other fields as needed
}
```

#### 2. API Client (`src/lib/webull/api.ts`)

Create a new API client for direct communication with WebUll:

```typescript
import axios from 'axios';
import type { 
  WebullCredentials,
  WebullAuthResponse,
  WebullOrder,
  WebullPosition,
  WebullAccount 
} from '@/types/webull';

export class WebullApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(baseUrl: string = 'https://api.webull.com/v1') {
    this.baseUrl = baseUrl;
  }

  // Authentication methods
  async login(credentials: WebullCredentials): Promise<WebullAuthResponse> {
    // Implement API call to WebUll login endpoint
  }

  async refreshAccessToken(): Promise<WebullAuthResponse> {
    // Implement token refresh logic
  }

  async logout(): Promise<void> {
    // Implement logout
  }

  // Trade data methods
  async getOrders(params?: { 
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<WebullOrder[]> {
    // Implement API call to fetch orders
  }

  // Position methods
  async getPositions(): Promise<WebullPosition[]> {
    // Implement API call to fetch positions
  }

  // Account methods
  async getAccount(): Promise<WebullAccount> {
    // Implement API call to fetch account info
  }

  // Helper methods
  private async makeAuthenticatedRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    // Implement authenticated request with token refresh handling
  }
}
```

#### 3. Service Layer (`src/services/webullService.ts`)

Reimplement the service layer to use the new API client:

```typescript
import { WebullApiClient } from '@/lib/webull/api';
import type {
  WebullCredentials,
  WebullOrder,
  WebullPosition,
  WebullAccount
} from '@/types/webull';

class WebullService {
  private static instance: WebullService;
  private apiClient: WebullApiClient | null = null;
  private isInitialized = false;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): WebullService {
    if (!WebullService.instance) {
      WebullService.instance = new WebullService();
    }
    return WebullService.instance;
  }

  // Initialize the service
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.apiClient = new WebullApiClient();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize WebUll service:', error);
      throw new Error('Failed to initialize WebUll service');
    }
  }

  // Authentication methods
  public async login(credentials: WebullCredentials): Promise<void> {
    if (!this.apiClient) await this.init();
    
    try {
      await this.apiClient!.login(credentials);
    } catch (error) {
      console.error('Failed to login to WebUll:', error);
      throw new Error('Failed to login to WebUll');
    }
  }

  public async logout(): Promise<void> {
    if (!this.apiClient) return;
    
    try {
      await this.apiClient.logout();
    } catch (error) {
      console.error('Failed to logout from WebUll:', error);
    }
  }

  // Data fetching methods
  public async fetchTrades(): Promise<WebullOrder[]> {
    if (!this.apiClient) {
      throw new Error('WebUll client not initialized');
    }
    
    try {
      return await this.apiClient.getOrders();
    } catch (error) {
      console.error('Failed to fetch trades from WebUll:', error);
      throw new Error('Failed to fetch trades from WebUll');
    }
  }

  // Mock data methods for development (optional)
  public async generateMockTrades(count: number = 5): Promise<WebullOrder[]> {
    // Implement mock data generation for testing
  }
}

export const webullService = WebullService.getInstance();
```

#### 4. Data Transformation (`src/utils/webullTransforms.ts`)

Update the transformation utilities to handle the new data structure:

```typescript
import type { WebullOrder } from '@/types/webull';
import type { Trade } from '@/types/trade';

// Transform a single WebUll order to our Trade format
export function transformWebullTrade(webullOrder: WebullOrder): Partial<Trade> {
  // Implement transformation logic based on new API response structure
}

// Transform multiple WebUll orders to our Trade format
export function transformWebullTrades(webullOrders: WebullOrder[]): Partial<Trade>[] {
  // Implement batch transformation logic
}
```

## Step 3: Integration with UI Components

Update the WebUll import form to use the new API client:

```typescript
// In src/components/trades/WebullImportForm.tsx
import { webullService } from '@/services/webullService';
import { transformWebullTrades } from '@/utils/webullTransforms';

// The UI can largely remain the same, just update the API calls
```

## Step 4: Testing the New Integration

Create test utilities for the new API client:

```typescript
// In src/lib/webull/test.ts
import { WebullApiClient } from './api';

export async function testWebullApiClient() {
  // Implement test scenarios
}
```

## Step 5: Documentation

Create new documentation for the WebUll API integration:

```
src/docs/WEBULL_API.md - API documentation
src/docs/WEBULL_INTEGRATION.md - Integration guide
```

## Implementation Considerations

### Security

- Never store passwords or sensitive credentials in local storage
- Use secure token storage
- Implement proper token refresh mechanisms
- Handle session timeout gracefully

### Error Handling

- Implement robust error handling for API failures
- Add retry mechanisms for transient errors
- Provide clear error messages to users

### Performance

- Minimize API calls by implementing caching
- Optimize data transformation for large datasets
- Consider implementing pagination for large trade histories

### Extensibility

- Design the API client to be extensible for future WebUll API features
- Use interfaces to maintain a consistent API contract
- Separate core API functionality from application-specific logic

## Timeline

1. **Week 1**: Remove old implementation and set up new type definitions
2. **Week 2**: Implement core API client and authentication
3. **Week 3**: Implement trade data fetching and transformations
4. **Week 4**: Update UI components and test end-to-end integration

## Resources

- [WebUll API Documentation](https://example.com/webull-api-docs)
- [Authentication Best Practices](https://example.com/auth-best-practices)
- [React Query for API State Management](https://tanstack.com/query/latest) 