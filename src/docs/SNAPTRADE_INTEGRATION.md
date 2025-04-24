# SnapTrade Integration

## Overview

This document describes the integration of SnapTrade's API into our application. We use the official `snaptrade-typescript-sdk` package with a custom wrapper for enhanced functionality.

## Implementation Details

### Client Layer

The client layer (`src/lib/snaptrade/client.ts`) provides a wrapper around the official SDK:

```typescript
export class SnapTradeClient {
  private client: Snaptrade;
  private isInitialized: boolean = false;

  constructor(config: SnapTradeConfig) {
    this.client = new Snaptrade({
      clientId: config.clientId,
      consumerKey: config.consumerKey,
      basePath: "https://api.snaptrade.com/api/v1"
    });
  }

  async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.client.initialize();
      this.isInitialized = true;
    }
  }

  // ... other methods
}
```

### Connection Flow

The connection flow is implemented in `src/components/broker/BrokerConnectionPortal.tsx`:

1. User selects a broker
2. Component initializes SnapTrade client
3. Gets connection URL using the connections API
4. Redirects to SnapTrade's connection portal
5. Handles callback and stores session information

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

## Usage Examples

### Initializing the Client

```typescript
const config = await StorageHelpers.getSnapTradeConfig();
const client = new SnapTradeClient(config);
await client.initialize();
```

### Connecting to a Broker

```typescript
const session = await client.getConnections(userId, userSecret);
const connectionUrl = session.redirectUrl;
// Redirect to connectionUrl
```

### Handling Callbacks

```typescript
const session = await StorageHelpers.getConnectionSession();
if (session.status === 'completed') {
  // Connection successful
} else {
  // Handle error
}
```

## Best Practices

1. **Initialization**: Always initialize the client before making API calls
2. **Error Handling**: Use try-catch blocks and handle SnapTradeError specifically
3. **Session Management**: Store session information securely
4. **Configuration**: Keep configuration in environment variables
5. **Testing**: Use mock data for development and testing

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure you're using the correct API endpoint
2. **Initialization Errors**: Check if the client is properly initialized
3. **Session Errors**: Verify session information is stored correctly
4. **Configuration Errors**: Validate all required configuration parameters

### Debugging

1. Enable detailed logging in development
2. Check network requests in browser dev tools
3. Verify session storage contents
4. Test with mock data first

## Security Considerations

1. **Authentication**: All API requests are signed with HMAC-SHA256
2. **Data Protection**: Sensitive information is stored securely
3. **Session Security**: Session information is encrypted
4. **Environment Security**: Use environment variables for configuration

## Testing

The integration includes test scripts:

```bash
# Run with mock data
npm run test:snaptrade -- --mock

# Run with real data
npm run test:snaptrade
```

## References

- [SnapTrade API Documentation](https://docs.snaptrade.com)
- [SnapTrade TypeScript SDK](https://github.com/snaptrade/snaptrade-typescript-sdk)
- [SnapTrade React SDK](https://github.com/snaptrade/snaptrade-react-sdk) 