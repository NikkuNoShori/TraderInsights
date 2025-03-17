# SnapTrade Integration

This directory contains the SnapTrade integration for TraderInsights, which allows users to connect their brokerage accounts securely using OAuth.

## Overview

SnapTrade is an official service that provides a secure API for integrating with various brokerages, including WebUll, Alpaca, Interactive Brokers, and more. Unlike the unofficial WebUll API, SnapTrade uses OAuth for authentication, which means that user credentials are never shared with our application.

## Features

- **OAuth Authentication**: Secure authentication without storing user credentials
- **Multiple Broker Support**: Connect to multiple brokerages through a single integration
- **Account Information**: Retrieve account balances, holdings, and orders
- **Secure Token Storage**: Securely store user tokens in both browser and Node.js environments
- **TypeScript Support**: Full TypeScript support with type definitions

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
NEXT_PUBLIC_SNAPTRADE_REDIRECT_URI=http://localhost:3000/snaptrade-callback
```

### Basic Usage

```typescript
import { snapTradeService } from '@/lib/snaptrade/service';

// Initialize the service
await snapTradeService.init({
  clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID || '',
  consumerKey: process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY || '',
  redirectUri: process.env.NEXT_PUBLIC_SNAPTRADE_REDIRECT_URI || '',
});

// Register a user
await snapTradeService.registerUser('user123');

// Get brokerages
const brokerages = await snapTradeService.getBrokerages();

// Create a connection link for OAuth authentication
const connectionUrl = await snapTradeService.createConnectionLink(brokerages[0].id);
window.open(connectionUrl, '_blank');

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

## Components

### SnapTradeDemo

The `SnapTradeDemo` component provides a user interface for connecting to brokerages and viewing account information.

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

## Security

The SnapTrade integration is designed with security in mind:

- **OAuth Authentication**: User credentials are never shared with our application
- **Secure Token Storage**: User tokens are stored securely
- **Environment Variables**: Sensitive information is stored in environment variables
- **No Credential Storage**: User credentials are never stored by our application

For more information about security, see the [Security Assessment](./SECURITY_ASSESSMENT.md).

## Testing

The SnapTrade integration includes a test page that can be used to test the integration with mock or real data.

```tsx
import { useState } from 'react';
import Layout from '@/components/Layout';

export default function SnapTradeTestPage() {
  const [output, setOutput] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runTest = async (useMockData: boolean) => {
    setLoading(true);
    setOutput(['Running test...']);

    try {
      const response = await fetch(`/api/run-snaptrade-test?mock=${useMockData}`);
      const data = await response.json();
      
      setOutput(data.logs || ['No logs returned from the API']);
    } catch (error) {
      setOutput([`Error: ${(error as Error).message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-8">SnapTrade Test</h1>
        
        <div className="flex space-x-4 mb-8">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={() => runTest(true)}
            disabled={loading}
          >
            Run with Mock Data
          </button>
          
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            onClick={() => runTest(false)}
            disabled={loading}
          >
            Run with Real Data
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Output:</h2>
          <pre className="whitespace-pre-wrap">
            {output.join('\n')}
          </pre>
        </div>
      </div>
    </Layout>
  );
}
```

## Documentation

- [Migration Guide](./MIGRATION_GUIDE.md): Guide for migrating from the WebUll API to SnapTrade
- [Security Assessment](./SECURITY_ASSESSMENT.md): Security assessment of the SnapTrade integration
- [SnapTrade Documentation](https://docs.snaptrade.com): Official SnapTrade documentation
- [SnapTrade TypeScript SDK](https://github.com/passiv/snaptrade-typescript-sdk): Official SnapTrade TypeScript SDK

## License

This integration is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details. 