# SnapTrade Integration

## Overview
This document provides an overview of the SnapTrade integration in TraderInsights. The integration uses the official SnapTrade TypeScript SDK to provide brokerage connectivity and trading capabilities.

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_SNAPTRADE_CLIENT_ID=your_client_id
NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY=your_consumer_key
```

### API Configuration
```typescript
const config = {
  clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID,
  consumerKey: process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY,
  basePath: "https://api.snaptrade.com/api/v1",
};
```

## Authentication

### User Registration
```typescript
const { userSecret } = await snaptrade.authentication.registerSnapTradeUser({
  userId: "unique_user_id",
});
```

### User Login
```typescript
const { redirectURI } = await snaptrade.authentication.loginSnapTradeUser({
  userId: "unique_user_id",
  userSecret: "user_secret",
});
```

## Account Management

### List Accounts
```typescript
const accounts = await snaptrade.accountInformation.listUserAccounts({
  userId: "unique_user_id",
  userSecret: "user_secret",
});
```

### Get Account Positions
```typescript
const positions = await snaptrade.accountInformation.getUserAccountPositions({
  userId: "unique_user_id",
  userSecret: "user_secret",
  accountId: "account_id",
});
```

## Error Handling

### Error Types
```typescript
enum SnapTradeErrorCode {
  INITIALIZATION_ERROR = "INITIALIZATION_ERROR",
  REGISTRATION_ERROR = "REGISTRATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  ACCOUNTS_ERROR = "ACCOUNTS_ERROR",
  POSITIONS_ERROR = "POSITIONS_ERROR",
  BALANCES_ERROR = "BALANCES_ERROR",
  ORDERS_ERROR = "ORDERS_ERROR"
}
```

### Error Handling Pattern
```typescript
try {
  // API call
} catch (error) {
  const err = new Error(`Failed to perform operation: ${error}`) as SnapTradeError;
  err.code = "ERROR_CODE";
  err.details = error;
  throw err;
}
```

## Development Guidelines

1. **Environment Setup**:
   - Set up environment variables
   - Configure API endpoints
   - Initialize SnapTrade client

2. **Testing**:
   - Use test environment for development
   - Test with mock data
   - Implement proper error handling
   - Test both success and failure scenarios

3. **Code Organization**:
   - Keep SnapTrade related code in `src/lib/snaptrade/`
   - Use TypeScript for type safety
   - Follow project conventions
   - Document all public methods

## References

- [SnapTrade API Documentation](https://docs.snaptrade.com)
- [SnapTrade TypeScript SDK](https://github.com/passiv/snaptrade-sdks)
- [Project Conventions](../CONVENTIONS.md) 