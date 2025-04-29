# SnapTrade Integration

This directory contains the SnapTrade integration for TraderInsights, which allows users to connect their brokerage accounts securely using OAuth.

## Overview

SnapTrade is an official service that provides a secure API for integrating with various brokerages, including WebUll, Alpaca, Interactive Brokers, and more. Unlike the unofficial WebUll API, SnapTrade uses OAuth for authentication, which means that user credentials are never shared with our application.

## Dependencies

```json
{
  "dependencies": {
    "snaptrade-typescript-sdk": "^1.0.0",  // Official SnapTrade TypeScript SDK
    "crypto": "^1.0.1"                      // For Node.js environment
  }
}
```

## Features

- **OAuth Authentication**: Secure authentication without storing user credentials
- **Multiple Broker Support**: Connect to multiple brokerages through a single integration
- **Account Information**: Retrieve account balances, holdings, and orders
- **Secure Token Storage**: Securely store user tokens in both browser and Node.js environments
- **TypeScript Support**: Full TypeScript support with type definitions
- **Dual Environment Support**: Works in both browser and Node.js environments
- **Rate Limiting**: Built-in rate limiting support
- **Error Handling**: Comprehensive error handling and logging

## Getting Started

### Installation

```bash
npm install snaptrade-typescript-sdk --save
```

### Configuration

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SNAPTRADE_CLIENT_ID=your_client_id
NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY=your_consumer_key
# No need to specify redirect URI - it's generated dynamically by the SnapTrade SDK
```

### Authentication

The SnapTrade integration supports authentication in both browser and Node.js environments:

#### Browser Environment
```typescript
// Generate authentication headers
const headers = await generateAuthHeaders(config);

// Make API request
const response = await fetch(url, {
  headers,
  // ... other options
});
```

#### Node.js Environment
```typescript
// Generate authentication headers
const headers = await generateAuthHeaders(config);

// Make API request
const response = await fetch(url, {
  headers,
  // ... other options
});
```

### Error Handling

The integration includes comprehensive error handling:

```typescript
try {
  const response = await snapTradeService.getAccountHoldings(accountId);
} catch (error) {
  if (error instanceof SnapTradeError) {
    // Handle SnapTrade specific errors
    console.error('SnapTrade error:', error.message);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

### Rate Limiting

The integration includes built-in rate limiting:

```typescript
// Using the rate limiter
const rateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 requests per 15 minutes

export const fetchSnapTradeWithRateLimit = async (url: string) => {
  await rateLimiter.throttle();
  return fetch(url);
};
```

### Basic Usage

```typescript
import { snapTradeService } from '@/lib/snaptrade/service';

// Initialize the service
await snapTradeService.init({
  clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID || '',
  consumerKey: process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY || '',
  // No need to specify redirectUri - it's handled by the SDK
});

// Register a user
await snapTradeService.registerUser('user123');

// Get brokerages
const brokerages = await snapTradeService.getBrokerages();

// Create a connection link for OAuth authentication
const { redirectURI } = await snapTradeService.createConnectionLink(brokerages[0].id);
window.location.href = redirectURI;

// Get user connections
const connections = await snapTradeService.getUserConnections();

// Get user accounts
const accounts = await snapTradeService.getUserAccounts();

// Get account holdings
const holdings = await snapTradeService.getAccountHoldings(accounts[0].id);

// Get account balances
const balances = await snapTradeService.getAccountBalances(accounts[0].id);

// Get account orders
const orders = await snapTradeService.getAccountOrders(accounts[0].id);
```

## Testing

The SnapTrade integration includes a test script that can be run from the command line:

```bash
# Run with mock data
npm run test:snaptrade -- --mock

# Run with real data (requires environment variables)
npm run test:snaptrade
```

The test script verifies:

1. User registration
2. Brokerage listing
3. Connection management
4. Account information retrieval
5. Holdings, balances, and orders retrieval

## Security Considerations

- User credentials are never shared with our application
- User tokens are stored securely
- Sensitive information is stored in environment variables
- No credential storage in our application
- All API requests are signed with HMAC-SHA256
- Rate limiting is implemented to prevent abuse

## Troubleshooting

Common issues and solutions:

1. **Authentication Errors**
   - Check your client ID and consumer key
   - Verify the timestamp is within the allowed window
   - Ensure the signature is generated correctly

2. **Rate Limiting**
   - Check your subscription tier
   - Implement proper rate limiting in your application
   - Use caching where appropriate

3. **Environment Issues**
   - Verify environment variables are set correctly
   - Check for proper Node.js/browser environment detection
   - Ensure proper error handling

## Future Enhancements

Potential future enhancements for the SnapTrade integration include:

1. **Trading Capabilities**: Implement trading functionality through the SnapTrade API
2. **Enhanced Data Visualization**: Improve visualization of account data
3. **Performance Optimization**: Optimize data retrieval and caching
4. **Additional Broker Support**: Add support for more brokerages
5. **Advanced Authentication**: Implement more advanced authentication flows

## Components

### SnapTradeCallback

The `SnapTradeCallback` component handles the OAuth callback from SnapTrade.

```tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { snapTradeService } from '@/lib/snaptrade/service';

export default function SnapTradeCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle the OAuth callback
        await snapTradeService.handleOAuthCallback(router.query);
        setStatus('Success! You can close this window.');
        
        // Close the window after a delay
        setTimeout(() => {
          window.close();
        }, 3000);
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        setStatus('Error: ' + (error as Error).message);
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">SnapTrade Authentication</h1>
        <p className="text-gray-700">{status}</p>
      </div>
    </div>
  );
}
```

## Architecture

The SnapTrade integration consists of the following components:

### Client

The `client.ts` file provides a wrapper around the SnapTrade TypeScript SDK, handling authentication and API calls.

### Service

The `service.ts` file provides a higher-level interface for interacting with the SnapTrade API, handling user registration, authentication, and data retrieval.

### Storage

The `storage.ts` file provides a storage adapter for securely storing user tokens in both browser and Node.js environments.

### Types

The `types.ts` file provides TypeScript type definitions for the SnapTrade integration.

## Documentation

- [Security Assessment](./SECURITY_ASSESSMENT.md): Security assessment of the SnapTrade integration
- [SnapTrade Documentation](https://docs.snaptrade.com): Official SnapTrade documentation
- [SnapTrade TypeScript SDK](https://github.com/passiv/snaptrade-typescript-sdk): Official SnapTrade TypeScript SDK

## License

This integration is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

