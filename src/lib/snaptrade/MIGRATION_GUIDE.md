# Migrating from WebUll API to SnapTrade

This guide provides instructions for migrating from the unofficial WebUll API integration to the official SnapTrade API integration.

## Why Migrate?

The SnapTrade integration offers several advantages over the unofficial WebUll API:

1. **Official Service**: SnapTrade is a legitimate service designed for broker integrations, reducing risks associated with unofficial APIs.
2. **OAuth Authentication**: SnapTrade uses OAuth for authentication, which means that user credentials are never shared with our application.
3. **Multiple Broker Support**: SnapTrade supports multiple brokers, including WebUll, Alpaca, Interactive Brokers, and more.
4. **Reliability**: As an official service, SnapTrade provides more stable APIs with proper documentation and support.
5. **Security**: SnapTrade implements industry-standard security practices for handling financial data.
6. **Terms of Service Compliance**: Using SnapTrade avoids the risk of violating WebUll's terms of service.

## Migration Steps

### 1. Update Dependencies

Remove the `webull-api-ts` package and install the `snaptrade-typescript-sdk` package:

```bash
npm uninstall webull-api-ts
npm install snaptrade-typescript-sdk --save
```

### 2. Environment Variables

Update your environment variables:

```
# Remove WebUll-specific variables
# WEBULL_USERNAME=your_username
# WEBULL_PASSWORD=your_password
# WEBULL_DEVICE_ID=your_device_id
# WEBULL_TRADE_PIN=your_trade_pin

# Add SnapTrade-specific variables
NEXT_PUBLIC_SNAPTRADE_CLIENT_ID=your_client_id
NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY=your_consumer_key
NEXT_PUBLIC_SNAPTRADE_REDIRECT_URI=http://localhost:3000/snaptrade-callback
```

### 3. Code Changes

#### Authentication

**WebUll API (old):**

```typescript
import { WebullService } from '@/services/webullService';

// Login with credentials
await WebullService.login(username, password, deviceId, tradePin);

// Check if authenticated
const isAuthenticated = WebullService.isAuthenticated();
```

**SnapTrade API (new):**

```typescript
import { snapTradeService } from '@/services/snaptradeService';

// Initialize the service
await snapTradeService.init({
  clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID || '',
  consumerKey: process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY || '',
  redirectUri: process.env.NEXT_PUBLIC_SNAPTRADE_REDIRECT_URI || '',
});

// Register a user
await snapTradeService.registerUser('user123');

// Create a connection link for OAuth authentication
const connectionUrl = await snapTradeService.createConnectionLink('brokerageId');
window.open(connectionUrl, '_blank');

// Check if user is registered
const isRegistered = snapTradeService.isUserRegistered();
```

#### Fetching Account Information

**WebUll API (old):**

```typescript
import { WebullService } from '@/services/webullService';

// Fetch account information
const account = await WebullService.fetchAccount();
```

**SnapTrade API (new):**

```typescript
import { snapTradeService } from '@/services/snaptradeService';

// Get user accounts
const accounts = await snapTradeService.getUserAccounts();

// Get account balances
const balances = await snapTradeService.getAccountBalances(accountId);
```

#### Fetching Positions

**WebUll API (old):**

```typescript
import { WebullService } from '@/services/webullService';

// Fetch positions
const positions = await WebullService.fetchPositions();
```

**SnapTrade API (new):**

```typescript
import { snapTradeService } from '@/services/snaptradeService';

// Get account holdings
const holdings = await snapTradeService.getAccountHoldings(accountId);
```

#### Fetching Orders

**WebUll API (old):**

```typescript
import { WebullService } from '@/services/webullService';

// Fetch trades
const trades = await WebullService.fetchTrades();
```

**SnapTrade API (new):**

```typescript
import { snapTradeService } from '@/services/snaptradeService';

// Get account orders
const orders = await snapTradeService.getAccountOrders(accountId);
```

### 4. UI Components

Replace the `WebullDemo` component with the `SnapTradeDemo` component:

**WebUll Demo (old):**

```tsx
import { WebullDemo } from '@/components/WebullDemo';

export default function WebullPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">WebUll Integration</h1>
      <WebullDemo />
    </div>
  );
}
```

**SnapTrade Demo (new):**

```tsx
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';

// Import the SnapTradeDemo component with dynamic loading to avoid SSR issues
const SnapTradeDemo = dynamic(() => import('@/components/SnapTradeDemo'), {
  ssr: false,
});

export default function SnapTradePage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-8">SnapTrade Integration</h1>
        <SnapTradeDemo />
      </div>
    </Layout>
  );
}
```

### 5. Testing

Update your tests to use the SnapTrade API:

**WebUll Test (old):**

```typescript
import { WebullService } from '@/services/webullService';

// Test with mock data
WebullService.useMockData = true;

// Login
await WebullService.login('test', 'test', 'test', 'test');

// Fetch data
const account = await WebullService.fetchAccount();
const positions = await WebullService.fetchPositions();
const trades = await WebullService.fetchTrades();
```

**SnapTrade Test (new):**

```typescript
import { snapTradeService } from '@/services/snaptradeService';

// Initialize with test configuration
await snapTradeService.init({
  clientId: 'test-client-id',
  consumerKey: 'test-consumer-key',
  redirectUri: 'http://localhost:3000/snaptrade-callback',
});

// Register a test user
await snapTradeService.registerUser('test-user');

// Get user accounts
const accounts = await snapTradeService.getUserAccounts();

// Get account details
const holdings = await snapTradeService.getAccountHoldings(accounts[0].id);
const balances = await snapTradeService.getAccountBalances(accounts[0].id);
const orders = await snapTradeService.getAccountOrders(accounts[0].id);
```

## Data Mapping

Here's how data from the WebUll API maps to the SnapTrade API:

| WebUll API | SnapTrade API | Notes |
|------------|---------------|-------|
| `WebullService.fetchAccount()` | `snapTradeService.getUserAccounts()` | SnapTrade returns an array of accounts |
| `WebullService.fetchPositions()` | `snapTradeService.getAccountHoldings(accountId)` | SnapTrade requires an account ID |
| `WebullService.fetchTrades()` | `snapTradeService.getAccountOrders(accountId)` | SnapTrade requires an account ID |
| `WebullService.isAuthenticated()` | `snapTradeService.isUserRegistered()` | SnapTrade uses a different authentication model |
| `WebullService.login()` | `snapTradeService.createConnectionLink()` | SnapTrade uses OAuth instead of direct login |

## Troubleshooting

### OAuth Redirect Issues

If you encounter issues with the OAuth redirect, check the following:

1. Ensure that the `NEXT_PUBLIC_SNAPTRADE_REDIRECT_URI` environment variable is set correctly.
2. Verify that the redirect URI is registered in your SnapTrade application settings.
3. Check that the callback page is properly handling the OAuth parameters.

### API Key Issues

If you encounter issues with the API keys, check the following:

1. Ensure that the `NEXT_PUBLIC_SNAPTRADE_CLIENT_ID` and `NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY` environment variables are set correctly.
2. Verify that your SnapTrade account is active and that your application is properly configured.

### Data Synchronization Issues

If you encounter issues with data synchronization, check the following:

1. Ensure that the user is properly registered with SnapTrade.
2. Verify that the user has connected their brokerage account through the OAuth flow.
3. Check that the account ID is valid when fetching account-specific data.

## Additional Resources

- [SnapTrade Documentation](https://docs.snaptrade.com)
- [SnapTrade TypeScript SDK](https://github.com/passiv/snaptrade-typescript-sdk)
- [SnapTrade API Reference](https://docs.snaptrade.com/reference)
- [SnapTrade Integration Guide](./README.md)
- [SnapTrade Security Assessment](./SECURITY_ASSESSMENT.md) 
# Migrating from WebUll API to SnapTrade

This guide provides instructions for migrating from the unofficial WebUll API integration to the official SnapTrade API integration.

## Why Migrate?

The SnapTrade integration offers several advantages over the unofficial WebUll API:

1. **Official Service**: SnapTrade is a legitimate service designed for broker integrations, reducing risks associated with unofficial APIs.
2. **OAuth Authentication**: SnapTrade uses OAuth for authentication, which means that user credentials are never shared with our application.
3. **Multiple Broker Support**: SnapTrade supports multiple brokers, including WebUll, Alpaca, Interactive Brokers, and more.
4. **Reliability**: As an official service, SnapTrade provides more stable APIs with proper documentation and support.
5. **Security**: SnapTrade implements industry-standard security practices for handling financial data.
6. **Terms of Service Compliance**: Using SnapTrade avoids the risk of violating WebUll's terms of service.

## Migration Steps

### 1. Update Dependencies

Remove the `webull-api-ts` package and install the `snaptrade-typescript-sdk` package:

```bash
npm uninstall webull-api-ts
npm install snaptrade-typescript-sdk --save
```

### 2. Environment Variables

Update your environment variables:

```
# Remove WebUll-specific variables
# WEBULL_USERNAME=your_username
# WEBULL_PASSWORD=your_password
# WEBULL_DEVICE_ID=your_device_id
# WEBULL_TRADE_PIN=your_trade_pin

# Add SnapTrade-specific variables
NEXT_PUBLIC_SNAPTRADE_CLIENT_ID=your_client_id
NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY=your_consumer_key
NEXT_PUBLIC_SNAPTRADE_REDIRECT_URI=http://localhost:3000/snaptrade-callback
```

### 3. Code Changes

#### Authentication

**WebUll API (old):**

```typescript
import { WebullService } from '@/services/webullService';

// Login with credentials
await WebullService.login(username, password, deviceId, tradePin);

// Check if authenticated
const isAuthenticated = WebullService.isAuthenticated();
```

**SnapTrade API (new):**

```typescript
import { snapTradeService } from '@/services/snaptradeService';

// Initialize the service
await snapTradeService.init({
  clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID || '',
  consumerKey: process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY || '',
  redirectUri: process.env.NEXT_PUBLIC_SNAPTRADE_REDIRECT_URI || '',
});

// Register a user
await snapTradeService.registerUser('user123');

// Create a connection link for OAuth authentication
const connectionUrl = await snapTradeService.createConnectionLink('brokerageId');
window.open(connectionUrl, '_blank');

// Check if user is registered
const isRegistered = snapTradeService.isUserRegistered();
```

#### Fetching Account Information

**WebUll API (old):**

```typescript
import { WebullService } from '@/services/webullService';

// Fetch account information
const account = await WebullService.fetchAccount();
```

**SnapTrade API (new):**

```typescript
import { snapTradeService } from '@/services/snaptradeService';

// Get user accounts
const accounts = await snapTradeService.getUserAccounts();

// Get account balances
const balances = await snapTradeService.getAccountBalances(accountId);
```

#### Fetching Positions

**WebUll API (old):**

```typescript
import { WebullService } from '@/services/webullService';

// Fetch positions
const positions = await WebullService.fetchPositions();
```

**SnapTrade API (new):**

```typescript
import { snapTradeService } from '@/services/snaptradeService';

// Get account holdings
const holdings = await snapTradeService.getAccountHoldings(accountId);
```

#### Fetching Orders

**WebUll API (old):**

```typescript
import { WebullService } from '@/services/webullService';

// Fetch trades
const trades = await WebullService.fetchTrades();
```

**SnapTrade API (new):**

```typescript
import { snapTradeService } from '@/services/snaptradeService';

// Get account orders
const orders = await snapTradeService.getAccountOrders(accountId);
```

### 4. UI Components

Replace the `WebullDemo` component with the `SnapTradeDemo` component:

**WebUll Demo (old):**

```tsx
import { WebullDemo } from '@/components/WebullDemo';

export default function WebullPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">WebUll Integration</h1>
      <WebullDemo />
    </div>
  );
}
```

**SnapTrade Demo (new):**

```tsx
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';

// Import the SnapTradeDemo component with dynamic loading to avoid SSR issues
const SnapTradeDemo = dynamic(() => import('@/components/SnapTradeDemo'), {
  ssr: false,
});

export default function SnapTradePage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-8">SnapTrade Integration</h1>
        <SnapTradeDemo />
      </div>
    </Layout>
  );
}
```

### 5. Testing

Update your tests to use the SnapTrade API:

**WebUll Test (old):**

```typescript
import { WebullService } from '@/services/webullService';

// Test with mock data
WebullService.useMockData = true;

// Login
await WebullService.login('test', 'test', 'test', 'test');

// Fetch data
const account = await WebullService.fetchAccount();
const positions = await WebullService.fetchPositions();
const trades = await WebullService.fetchTrades();
```

**SnapTrade Test (new):**

```typescript
import { snapTradeService } from '@/services/snaptradeService';

// Initialize with test configuration
await snapTradeService.init({
  clientId: 'test-client-id',
  consumerKey: 'test-consumer-key',
  redirectUri: 'http://localhost:3000/snaptrade-callback',
});

// Register a test user
await snapTradeService.registerUser('test-user');

// Get user accounts
const accounts = await snapTradeService.getUserAccounts();

// Get account details
const holdings = await snapTradeService.getAccountHoldings(accounts[0].id);
const balances = await snapTradeService.getAccountBalances(accounts[0].id);
const orders = await snapTradeService.getAccountOrders(accounts[0].id);
```

## Data Mapping

Here's how data from the WebUll API maps to the SnapTrade API:

| WebUll API | SnapTrade API | Notes |
|------------|---------------|-------|
| `WebullService.fetchAccount()` | `snapTradeService.getUserAccounts()` | SnapTrade returns an array of accounts |
| `WebullService.fetchPositions()` | `snapTradeService.getAccountHoldings(accountId)` | SnapTrade requires an account ID |
| `WebullService.fetchTrades()` | `snapTradeService.getAccountOrders(accountId)` | SnapTrade requires an account ID |
| `WebullService.isAuthenticated()` | `snapTradeService.isUserRegistered()` | SnapTrade uses a different authentication model |
| `WebullService.login()` | `snapTradeService.createConnectionLink()` | SnapTrade uses OAuth instead of direct login |

## Troubleshooting

### OAuth Redirect Issues

If you encounter issues with the OAuth redirect, check the following:

1. Ensure that the `NEXT_PUBLIC_SNAPTRADE_REDIRECT_URI` environment variable is set correctly.
2. Verify that the redirect URI is registered in your SnapTrade application settings.
3. Check that the callback page is properly handling the OAuth parameters.

### API Key Issues

If you encounter issues with the API keys, check the following:

1. Ensure that the `NEXT_PUBLIC_SNAPTRADE_CLIENT_ID` and `NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY` environment variables are set correctly.
2. Verify that your SnapTrade account is active and that your application is properly configured.

### Data Synchronization Issues

If you encounter issues with data synchronization, check the following:

1. Ensure that the user is properly registered with SnapTrade.
2. Verify that the user has connected their brokerage account through the OAuth flow.
3. Check that the account ID is valid when fetching account-specific data.

## Additional Resources

- [SnapTrade Documentation](https://docs.snaptrade.com)
- [SnapTrade TypeScript SDK](https://github.com/passiv/snaptrade-typescript-sdk)
- [SnapTrade API Reference](https://docs.snaptrade.com/reference)
- [SnapTrade Integration Guide](./README.md)
- [SnapTrade Security Assessment](./SECURITY_ASSESSMENT.md) 