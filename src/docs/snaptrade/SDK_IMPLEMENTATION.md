# SnapTrade SDK Implementation

## Overview

This document details our implementation of the SnapTrade SDK in TraderInsights. Our implementation follows strict conventions and rules to ensure consistency, security, and maintainability.

## Core Files

### `src/lib/snaptrade/client.ts`
The main client implementation that wraps the official SnapTrade TypeScript SDK.

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

### `src/lib/snaptrade/auth.ts`
Handles authentication and security-related functionality.

```typescript
export function generateAuthHeaders(
  config: SnapTradeConfig,
  userId: string,
  userSecret: string
): Record<string, string> {
  // Implementation details...
}
```

### `src/lib/snaptrade/types.ts`
Defines all types used in our SnapTrade integration.

```typescript
export interface SnapTradeConfig {
  clientId: string;
  consumerKey: string;
}

export enum SnapTradeErrorCode {
  // Error codes...
}
```

## Implementation Rules

### SDK Usage
- ONLY use the official `snaptrade-typescript-sdk`
- NEVER make direct API calls outside the SDK
- ALWAYS use the SDK's built-in types and methods
- NEVER implement custom authentication handling

### Error Handling
- Use `SnapTradeError` for all error cases
- Include proper error codes from `SnapTradeErrorCode`
- Provide detailed error messages
- Handle errors at the appropriate level

### Authentication
- Use `generateAuthHeaders` for all API requests
- Validate credentials before making requests
- Store sensitive information securely
- Never expose secrets in logs or responses

### Type Safety
- Use SDK types whenever possible
- Extend SDK types only when necessary
- Document all custom types
- Maintain type safety throughout the codebase

## Usage Examples

### Initializing the Client
```typescript
import snaptradeClient from '@/lib/snaptrade/client';

// The client is already initialized with environment variables
// No need for additional setup
```

### Creating a Connection
```typescript
const createConnection = async (broker: string) => {
  try {
    const response = await snaptradeClient.createConnectionLink({
      broker,
      immediateRedirect: true,
      customRedirect: window.location.origin + '/app/broker/connect'
    });
    
    window.location.href = response.redirectURI;
  } catch (error) {
    if (error instanceof SnapTradeError) {
      // Handle specific error cases
      switch (error.code) {
        case SnapTradeErrorCode.NOT_AUTHENTICATED:
          // Handle authentication error
          break;
        case SnapTradeErrorCode.API_ERROR:
          // Handle API error
          break;
        default:
          // Handle other errors
      }
    }
  }
};
```

### Getting Account Information
```typescript
const getAccounts = async () => {
  try {
    const accounts = await snaptradeClient.getUserAccounts();
    return accounts;
  } catch (error) {
    if (error instanceof SnapTradeError) {
      // Handle error
    }
  }
};
```

## Best Practices

### 1. Error Handling
- Always use try-catch blocks
- Handle specific error types
- Provide meaningful error messages
- Log errors appropriately

### 2. Authentication
- Validate credentials before use
- Use secure storage for secrets
- Implement proper session management
- Handle token expiration

### 3. Type Safety
- Use TypeScript's strict mode
- Validate input parameters
- Use proper type assertions
- Document type requirements

### 4. Security
- Never expose sensitive data
- Use environment variables
- Implement proper CORS
- Follow security best practices

## Common Issues and Solutions

### 1. Authentication Errors
**Problem**: Invalid or expired credentials
**Solution**: 
- Validate credentials before use
- Implement proper error handling
- Provide clear error messages

### 2. API Errors
**Problem**: API requests failing
**Solution**:
- Check error codes
- Validate input parameters
- Implement retry logic
- Handle rate limiting

### 3. Type Errors
**Problem**: Type mismatches
**Solution**:
- Use proper type definitions
- Validate input types
- Use type guards
- Document type requirements

## Testing

### Unit Tests
```typescript
describe('SnapTradeClient', () => {
  it('should handle authentication errors', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('SnapTrade Integration', () => {
  it('should connect to broker successfully', async () => {
    // Test implementation
  });
});
```

## Maintenance

### Version Updates
- Keep SDK version up to date
- Test new versions thoroughly
- Update documentation
- Handle breaking changes

### Code Review
- Follow implementation rules
- Check for security issues
- Validate error handling
- Ensure type safety

## References

- [SnapTrade API Documentation](https://docs.snaptrade.com)
- [SnapTrade TypeScript SDK](https://github.com/passiv/snaptrade-sdks)
- [Project Conventions](../CONVENTIONS.md)
- [Security Guidelines](../SECURITY.md) 