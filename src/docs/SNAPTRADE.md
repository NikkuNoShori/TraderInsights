# SnapTrade Integration

## Overview

This document provides comprehensive documentation for the SnapTrade integration in TraderInsights. The integration uses the official `snaptrade-typescript-sdk` package with custom wrappers for enhanced functionality and security.

## Directory Structure

```
src/lib/snaptrade/
├── client.ts           # Main SDK client implementation
├── auth.ts             # Authentication utilities
├── types.ts            # Type definitions
├── config.ts           # Configuration management
├── errors.ts           # Error handling
├── storage.ts          # Secure storage
├── rateLimiter.ts      # Rate limiting
└── README.md           # Integration documentation
```

## Core Components

### Client Implementation (`client.ts`)
The main client implementation that wraps the official SnapTrade TypeScript SDK:

```typescript
export class SnapTradeClient {
  private client: Snaptrade;
  private authApi: AuthenticationApi;
  private accountApi: AccountInformationApi;
  private referenceApi: ReferenceDataApi;
  private userId: string;
  private userSecret: string;

  constructor(config: SnapTradeConfig) {
    // Implementation details...
  }
}
```

### Authentication (`auth.ts`)
Handles authentication and security-related functionality:

```typescript
export function generateAuthHeaders(
  config: SnapTradeConfig,
  userId: string,
  userSecret: string
): Record<string, string> {
  // Implementation details...
}
```

### Configuration (`config.ts`)
Manages SnapTrade configuration:

```typescript
export interface SnapTradeConfig {
  clientId: string;
  consumerKey: string;
  baseUrl?: string;
  environment?: 'production' | 'sandbox';
}
```

### Error Handling (`errors.ts`)
Centralized error handling:

```typescript
export class ErrorHandler {
  static handleError(error: unknown, context: string): never {
    // Implementation details...
  }
}
```

### Secure Storage (`storage.ts`)
Handles secure storage of sensitive data:

```typescript
export interface StoredCredentials {
  userId: string;
  userSecret: string;
  createdAt: number;
}
```

### Rate Limiting (`rateLimiter.ts`)
Manages API rate limiting:

```typescript
export const rateLimiter = new RateLimiter({
  maxRequests: 100,
  timeWindow: 60000
});
```

## Usage Examples

### Initializing the Client
```typescript
import { configHelpers } from '@/lib/snaptrade/config';
import { SnapTradeClient } from '@/lib/snaptrade/client';

// Initialize configuration
configHelpers.initializeFromEnv();

// Create client instance
const client = new SnapTradeClient(configHelpers.getConfig());
```

### Creating a Connection
```typescript
const createConnection = async (broker: string) => {
  try {
    const response = await client.createConnectionLink({
      broker,
      immediateRedirect: true,
      customRedirect: window.location.origin + '/app/broker/connect'
    });
    
    window.location.href = response.redirectURI;
  } catch (error) {
    // Handle error using errorHelpers
  }
};
```

### Getting Account Information
```typescript
const getAccounts = async () => {
  try {
    const accounts = await client.getUserAccounts();
    return accounts;
  } catch (error) {
    // Handle error using errorHelpers
  }
};
```

## Security Considerations

1. **Authentication**
   - All API requests are signed with HMAC-SHA256
   - Credentials are stored securely using encryption
   - Session information is managed securely

2. **Data Protection**
   - Sensitive information is encrypted at rest
   - Secure storage is used for credentials
   - Rate limiting is implemented to prevent abuse

3. **Error Handling**
   - All errors are properly typed and handled
   - Sensitive information is never exposed in error messages
   - Error logging is implemented securely

## Best Practices

1. **Configuration**
   - Use environment variables for sensitive data
   - Validate configuration before use
   - Support both production and sandbox environments

2. **Error Handling**
   - Use the provided error handling utilities
   - Handle specific error types appropriately
   - Log errors securely

3. **Security**
   - Never store credentials in plain text
   - Use secure storage for sensitive data
   - Implement proper session management

4. **Rate Limiting**
   - Respect API rate limits
   - Use the provided rate limiting utilities
   - Handle rate limit errors gracefully

## Testing

The integration includes test utilities:

```typescript
describe('SnapTrade Integration', () => {
  it('should handle authentication correctly', async () => {
    // Test implementation
  });
});
```

## References

- [SnapTrade API Documentation](https://docs.snaptrade.com)
- [SnapTrade TypeScript SDK](https://github.com/passiv/snaptrade-sdks)
- [Project Security Guidelines](../SECURITY.md)
- [Error Handling Guidelines](../ERROR_HANDLING.md) 