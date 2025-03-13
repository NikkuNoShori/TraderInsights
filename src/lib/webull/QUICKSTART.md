# WebUll Integration - Quick Start Guide

This guide will help you quickly get started with the WebUll API integration in TraderInsights.

## Prerequisites

- Node.js 14+ and npm installed
- A WebUll account with API access
- TraderInsights application set up

## Installation

The WebUll integration is included in the TraderInsights application. If you're adding it to a different project, install the required dependencies:

```bash
npm install webull-api-ts dotenv
```

## Basic Usage

### 1. Initialize the WebUll Service

```typescript
import { webullService } from '@/services/webullService';

// Initialize the service (use mock mode for development)
await webullService.init(true); // true for mock mode, false for real API
```

### 2. Login to WebUll

```typescript
// Prepare credentials
const credentials = {
  username: 'your_username',
  password: 'your_password',
  // Optional fields
  deviceId: 'your_device_id', // Will be generated if not provided
  deviceName: 'TraderInsights', // Default value
  mfaCode: '123456', // Required if MFA is enabled
};

// Login
try {
  await webullService.login(credentials);
  console.log('Login successful');
} catch (error) {
  console.error('Login failed:', error);
}
```

### 3. Fetch Data

```typescript
// Sync all data (trades, positions, account)
try {
  const data = await webullService.syncAllData();
  console.log('Trades:', data.trades);
  console.log('Positions:', data.positions);
  console.log('Account:', data.account);
} catch (error) {
  console.error('Data sync failed:', error);
}

// Or fetch individual data types
const trades = await webullService.fetchTrades();
const positions = await webullService.fetchPositions();
const account = await webullService.fetchAccount();
```

### 4. Logout

```typescript
await webullService.logout();
```

## Using the Demo Component

The WebUll integration includes a demo component that you can use to test the integration:

```typescript
import WebullDemo from '@/components/WebullDemo';

// In your React component
return (
  <div>
    <h1>WebUll Integration Demo</h1>
    <WebullDemo />
  </div>
);
```

## Mock Mode

For development and testing, you can use mock mode to generate fake data:

```typescript
// Initialize in mock mode
await webullService.init(true);

// Generate mock data
const mockData = await webullService.generateMockData(5); // Generate 5 trade pairs
```

## Testing

To run the WebUll integration tests:

```bash
# Run mock tests only
npm run test:webull -- --mock-only

# Run real API tests (requires credentials)
npm run test:webull -- --real
```

## Troubleshooting

If you encounter issues, check the [Troubleshooting Guide](./TROUBLESHOOTING.md) for solutions to common problems.

## Next Steps

- Read the [Technical Documentation](./TECHNICAL.md) for detailed information about the implementation
- Explore the [WebullService API](../services/webullService.ts) for more advanced usage
- Check the [WebullDemo component](../components/WebullDemo.tsx) for UI implementation examples 