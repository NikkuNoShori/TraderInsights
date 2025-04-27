# SnapTrade Implementation Guide

## Overview
This guide details the implementation of the official SnapTrade SDK integration in TraderInsights. The integration follows SnapTrade's official documentation and best practices.

## User Registration

### User ID Requirements
The `userId` is a critical identifier in SnapTrade's system. It must meet the following requirements:

1. **Format Requirements**:
   - Must be 3-100 characters long
   - Can only contain letters, numbers, underscores, and hyphens
   - Must be unique across all users
   - Must be immutable (never change for a user)

2. **Invalid Patterns**:
   - Cannot be an email address
   - Cannot contain mutable identifiers (timestamps, random values)
   - Cannot contain special characters except underscore and hyphen

3. **Best Practices**:
   - Use a stable identifier from your system (e.g., database ID)
   - Avoid using user-visible identifiers (email, username)
   - Ensure the ID will never change for the user

### User Registration Flow
```typescript
// 1. Validate userId format
validateUserId(userId);

// 2. Register user with SnapTrade
const { userSecret } = await snaptrade.authentication.registerSnapTradeUser({
  userId,
});

// 3. Store userSecret securely
// Note: userSecret is only generated once and required for future API calls
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
   ```env
   NEXT_PUBLIC_SNAPTRADE_CLIENT_ID=your_client_id
   NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY=your_consumer_key
   ```

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

## API Endpoints

### Authentication
- `registerSnapTradeUser`: Register a new user
- `loginSnapTradeUser`: Get authentication token
- `deleteSnapTradeUser`: Remove a user

### Account Information
- `listUserAccounts`: Get all user accounts
- `getUserAccountPositions`: Get account positions
- `getUserAccountBalance`: Get account balances
- `getUserAccountOrders`: Get account orders

### Brokerage
- `listAllBrokerages`: Get available brokerages
- `listBrokerageAuthorizations`: Get user's brokerage connections 