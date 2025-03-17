# WebUll API Data Reference

This document provides a comprehensive overview of the data that can be retrieved from the WebUll API using the `webull-api-ts` package in our integration. It also addresses security considerations and best practices.

## Available Data

The WebUll integration allows you to retrieve the following types of data:

### Authentication Data

```typescript
interface WebullAuthResponse {
  accessToken: string;      // Token used for API requests
  refreshToken: string;     // Token used to refresh the access token
  tokenExpiry: number;      // Timestamp when the token expires
  uuid: string;             // User's unique identifier
}
```

### Account Information

```typescript
interface WebullAccount {
  accountId: string;        // WebUll account ID
  accountType: string;      // Account type (e.g., "MARGIN", "CASH")
  currency: string;         // Account currency (e.g., "USD")
  dayTrader: boolean;       // Whether the account is flagged as a day trader
  netLiquidation: number;   // Total account value
  totalCash: number;        // Available cash
  buyingPower: number;      // Available buying power
  totalPositionValue: number; // Total value of all positions
}
```

### Positions

```typescript
interface WebullPosition {
  symbol: string;           // Stock symbol
  quantity: number;         // Number of shares
  avgCost: number;          // Average cost per share
  marketValue: number;      // Current market value of the position
  lastPrice: number;        // Last price of the stock
  unrealizedPnl: number;    // Unrealized profit/loss
  unrealizedPnlRate: number; // Unrealized profit/loss as a percentage
  lastUpdated: string;      // Timestamp of last update
}
```

### Orders

```typescript
interface WebullOrder {
  orderId: string;          // Order ID
  symbol: string;           // Stock symbol
  action: "BUY" | "SELL";   // Order action
  orderType: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT"; // Order type
  timeInForce: "GTC" | "DAY" | "IOC"; // Time in force
  quantity: number;         // Number of shares
  filledQuantity: number;   // Number of shares filled
  price?: number;           // Order price (for limit orders)
  filledPrice?: number;     // Execution price
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED" | "PARTIAL_FILLED"; // Order status
  createTime: string;       // Order creation timestamp
  updateTime: string;       // Order update timestamp
  commission?: number;      // Commission paid
  fees?: number;            // Additional fees
}
```

### Trades (Extended Orders)

```typescript
interface WebullTrade extends WebullOrder {
  exchange: string;         // Exchange where the trade was executed
  // Plus all fields from WebullOrder
}
```

## API Methods

The WebUll client provides the following methods for retrieving data:

### Authentication

```typescript
// Login to WebUll
login(credentials: WebullCredentials): Promise<WebullAuthResponse>;

// Logout from WebUll
logout(): Promise<void>;

// Refresh the authentication token
refreshToken(refreshToken: string): Promise<WebullAuthResponse>;
```

### Account and Positions

```typescript
// Get account information
getAccount(): Promise<WebullAccount>;

// Get positions
getPositions(): Promise<WebullPosition[]>;
```

### Orders

```typescript
// Get orders with optional filtering
getOrders(params?: {
  status?: string;
  startTime?: string;
  endTime?: string;
}): Promise<WebullOrder[]>;
```

## Data Not Currently Available

The current integration does not provide access to the following data, which may be available in the WebUll API but is not implemented in our client:

1. **Market Data**: Real-time quotes, historical data, and market news
2. **Watchlists**: User's watchlists and saved symbols
3. **Options Data**: Options chains and positions
4. **Order Placement**: Ability to place new orders
5. **Order Cancellation**: Ability to cancel existing orders
6. **Account Settings**: User preferences and settings

## Security Considerations

### Package Security

The `webull-api-ts` package we're using is an unofficial API client for WebUll. Here are important security considerations:

1. **Unofficial Status**: This is not an official WebUll API client. It's a third-party package created by the community.

2. **GitHub Repository**: The package is hosted on GitHub at [edmundpf/webull-api-ts](https://github.com/edmundpf/webull-api-ts) with 25 stars and 11 forks, indicating moderate community interest and validation.

3. **Package Maturity**: The package is marked as BETA, with tests not yet implemented. This indicates it's not production-ready and may have undiscovered issues.

4. **License**: The package is open-source, allowing you to inspect the code for security issues.

5. **Dependencies**: The package may have dependencies that could introduce security vulnerabilities.

### Credential Handling

Our integration implements several security measures for handling credentials:

1. **No Credential Storage**: Credentials are never stored in plain text. Only authentication tokens are stored.

2. **Token Refresh**: The integration automatically refreshes tokens before they expire.

3. **Secure Storage**: Authentication tokens are stored using the storage adapter, which provides secure storage in both browser and Node.js environments.

4. **Automatic Logout**: The integration clears authentication data on logout.

### Best Practices

To ensure secure use of the WebUll integration:

1. **Use Mock Mode for Development**: Use the mock client for development and testing to avoid using real credentials.

2. **Implement Rate Limiting**: Avoid making too many API calls in a short period to prevent account lockouts.

3. **Handle Errors Gracefully**: Implement proper error handling to prevent exposing sensitive information.

4. **Secure Environment Variables**: Store real credentials in secure environment variables, not in code.

5. **Regular Updates**: Keep the `webull-api-ts` package updated to get security fixes.

6. **User Consent**: Always get explicit user consent before accessing their WebUll account.

7. **Data Minimization**: Only request and store the data you need.

## Risk Assessment

Using an unofficial API client like `webull-api-ts` comes with certain risks:

1. **API Changes**: WebUll may change their API at any time, breaking the client.

2. **Account Lockouts**: Excessive API calls or suspicious activity may lead to account lockouts.

3. **Security Vulnerabilities**: The package may have undiscovered security vulnerabilities.

4. **Terms of Service**: Using unofficial APIs may violate WebUll's terms of service.

To mitigate these risks:

1. **Monitor for Updates**: Regularly check for updates to the `webull-api-ts` package.

2. **Implement Fallbacks**: Have fallback mechanisms in case the API client stops working.

3. **Test Thoroughly**: Test the integration thoroughly before using it in production.

4. **Review WebUll's Terms**: Review WebUll's terms of service to ensure compliance.

## Conclusion

The WebUll integration provides access to account information, positions, and orders through the `webull-api-ts` package. While it offers valuable functionality, it's important to be aware of the security considerations and risks associated with using an unofficial API client. By following best practices and implementing proper security measures, you can minimize these risks and safely integrate WebUll data into your application.

## References

- [webull-api-ts GitHub Repository](https://github.com/edmundpf/webull-api-ts)
- [WebUll Official Website](https://www.webull.com/)
- [TraderInsights WebUll Integration Documentation](./README.md) 