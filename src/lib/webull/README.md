# WebUll API Integration

This directory contains the WebUll API integration for TraderInsights. It provides a client for interacting with the WebUll API to fetch trades, positions, and account information.

## Overview

The WebUll integration consists of the following components:

- `client.ts`: The WebUll API client implementation
- `types.ts`: Type definitions for WebUll data
- `storage.ts`: Storage adapter for cross-environment compatibility
- `test.ts`: Test functions for verifying the WebUll integration

## Usage

### Basic Usage

```typescript
import { createWebullClient, type WebullCredentials } from '@/lib/webull/client';

// Create a client
const client = createWebullClient();

// Login
const credentials: WebullCredentials = {
  username: 'your_username',
  password: 'your_password',
  deviceId: 'your_device_id', // Optional
  deviceName: 'TraderInsights', // Optional
  mfaCode: '123456', // Optional
};

const authResponse = await client.login(credentials);

// Get account information
const account = await client.getAccount();

// Get positions
const positions = await client.getPositions();

// Get orders
const orders = await client.getOrders();

// Logout
await client.logout();
```

### Using the WebullService

The `WebullService` provides a higher-level interface for interacting with the WebUll API. It handles authentication, caching, and data transformation.

```typescript
import { webullService } from '@/services/webullService';

// Initialize the service
await webullService.init();

// Login
const credentials = {
  username: 'your_username',
  password: 'your_password',
};

await webullService.login(credentials);

// Sync all data
const data = await webullService.syncAllData();
console.log(data.trades);
console.log(data.positions);
console.log(data.account);

// Logout
await webullService.logout();
```

### Storage Adapter

The integration includes a storage adapter (`storage.ts`) that provides a consistent interface for storage operations in both browser and Node.js environments:

```typescript
import { StorageHelpers, STORAGE_KEYS } from '@/lib/webull/storage';

// Get data from storage
const trades = StorageHelpers.getTrades();
const auth = StorageHelpers.getAuth();
const positions = StorageHelpers.getPositions();
const account = StorageHelpers.getAccount();

// Save data to storage
StorageHelpers.saveTrade(trade);
StorageHelpers.saveAuth(auth);
StorageHelpers.savePositions(positions);
StorageHelpers.saveAccount(account);

// Clear data
StorageHelpers.clearAuth();
StorageHelpers.clearTrades();
StorageHelpers.clearAllData();
```

The storage adapter automatically detects the environment and uses:
- `localStorage` in browser environments
- In-memory storage and file-based storage in Node.js environments

This ensures that the integration works correctly in both environments, making it more robust and easier to test.

### Mock Mode

For development and testing, you can use the mock mode to generate fake data:

```typescript
// Create a mock client
const mockClient = createWebullClient(true);

// Or initialize the service in mock mode
await webullService.init(true);

// Generate mock data
const mockData = await webullService.generateMockData(5);
```

## Testing

To run the WebUll integration tests:

```bash
# Run mock tests only
npm run test:webull -- --mock-only

# Run real API tests (requires credentials)
npm run test:webull -- --real
```

You can also set the following environment variables to avoid entering credentials interactively:

```
WEBULL_USERNAME=your_username
WEBULL_PASSWORD=your_password
WEBULL_DEVICE_ID=your_device_id
WEBULL_DEVICE_NAME=TraderInsights
WEBULL_MFA_CODE=123456
```

### Node.js Environment Setup

When running tests in a Node.js environment, the integration automatically sets up the necessary environment:

1. The storage adapter (`storage.ts`) detects the Node.js environment and uses appropriate storage mechanisms
2. The test script (`test.ts`) includes setup code for the Node.js environment

This ensures that tests can run correctly in both browser and Node.js environments without any manual configuration.

## Type Mapping

The WebUll API client maps WebUll types to internal types as follows:

| WebUll Type | Internal Type |
|-------------|---------------|
| Order       | WebullOrder   |
| Position    | WebullPosition|
| Account     | WebullAccount |

These types are then transformed into the application's internal types using the transformation utilities in `src/utils/webullTransforms.ts`.

## Components

### WebullDemo Component

The integration includes a React component (`src/components/WebullDemo.tsx`) that demonstrates the WebUll integration:

- Login form with fields for username, password, device ID, and MFA code
- Buttons for logging in, logging out, syncing data, and generating mock data
- Display of account information, positions, and trades
- Environment detection to handle server-side rendering gracefully

## Dependencies

This integration uses the `webull-api-ts` package, which is an unofficial JavaScript SDK for interacting with WebUll API endpoints. Note that the API endpoints are not officially documented and may change at any time. 