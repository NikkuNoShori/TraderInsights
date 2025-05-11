# Broker Dashboard Documentation

## Overview
The Broker Dashboard is a key feature of TraderInsights that allows users to connect to various brokerages through the SnapTrade integration. It provides a unified interface for managing broker connections, viewing accounts, and accessing trading data.

## Implementation
The current implementation has been optimized for reliability and proper error handling, especially around authentication flows with SnapTrade.

### Key Files
- **src/views/BrokerDashboard.tsx**: Main dashboard component
- **src/components/broker/SnapTradeConnection.tsx**: Component for managing SnapTrade integration
- **src/stores/brokerDataStore.ts**: State management for broker accounts and data
- **src/stores/authStore.ts**: Authentication including SnapTrade credentials
- **src/server/api/snaptrade/proxy.ts**: Server-side proxy for secure SnapTrade API calls

## Architecture

### Authentication Flow
1. User credentials are managed through authStore
2. SnapTrade registration happens through SnapTradeConnection component
3. After registration, broker connections are established
4. Account data is fetched through brokerDataStore

### Data Flow
1. Broker accounts are fetched once credentials are available
2. Account data (positions, balances) is fetched for the selected account
3. UI components display the account data in appropriate sections

### Proxy Server
The implementation uses a server-side proxy to handle SnapTrade API calls securely:
- x-api-key headers for general endpoints
- POST requests with credentials in the body for account endpoints
- Consistent clientId inclusion

## Troubleshooting

### Common Issues
- **401 Unauthorized errors**: Usually related to authentication configuration in the proxy
- **Missing accounts**: Check that the broker connection was completed successfully
- **Broker listing works but accounts fail**: Authentication method mismatch between endpoints

### Debug Tips
1. Use browser console to check for errors
2. Server logs provide detailed authentication information
3. Check `brokerDataStore.ts` fallback mechanisms when proxy fails

## Rules and Guidelines
For detailed rules on modifying the Broker Dashboard, see:
- [BROKER_DASHBOARD_RULES.md](./BROKER_DASHBOARD_RULES.md)
- [BROKER_DASHBOARD_CUSTOM_RULES.md](./BROKER_DASHBOARD_CUSTOM_RULES.md) 