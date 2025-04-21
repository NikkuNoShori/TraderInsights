# Broker Components Documentation

## Overview

The broker integration system allows users to connect their brokerage accounts through SnapTrade's API. This document outlines the key components and their relationships.

## Components

### BrokerDashboard (`src/components/BrokerDashboard.tsx`)
- **Purpose**: Main interface for managing broker connections
- **Route**: `/app/broker-dashboard`
- **Features**:
  - Displays available brokers in a grid layout
  - Handles broker connection initialization
  - Manages SnapTrade user registration
  - Supports demo/test mode
  - Includes debug tools and logging
  - Persists session state

### BrokerConnectionPortal (`src/components/broker-connection-portal.tsx`)
- **Purpose**: Handles OAuth flow for broker connections
- **Usage**: Modal component used across the application
- **Features**:
  - Manages broker OAuth authentication
  - Handles success/failure states
  - Provides user feedback
  - Supports custom callbacks

## State Management

### Stores
- `useBrokerDataStore`: Manages broker connections and account data
- `useDebugStore`: Handles development and testing features
- `useAuthStore`: Manages user authentication

### Session Persistence
- Broker connection state is persisted in localStorage
- SnapTrade user credentials are managed securely
- Debug state is maintained for development

## Integration Points

### Import Trades
- The `ImportTradeForm` component uses `BrokerConnectionPortal` for connecting brokers during trade import
- Located at: `src/components/trades/ImportTradeForm.tsx`

### Dashboard Integration
- Broker connection status is displayed on the main dashboard
- Quick access to broker management through dashboard cards

## Development Guidelines

### Theme Compliance
- All components use the application's theme system
- Dark mode support is built-in
- UI components follow the design system

### Error Handling
- Connection errors are handled gracefully
- User feedback is provided through toast notifications
- Debug mode provides detailed error information

### Testing
- Demo mode available for testing without real broker connections
- Debug tools help track connection states
- Test credentials can be used in development

## Future Considerations

### Planned Features
- Support for additional brokers
- Enhanced error reporting
- Improved connection status monitoring
- Real-time data synchronization

### Maintenance
- Keep `ALL_SUPPORTED_BROKERS` list updated
- Monitor SnapTrade API changes
- Update documentation as features are added 