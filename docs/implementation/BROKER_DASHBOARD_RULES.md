# Broker Dashboard Rules

## Overview
This document outlines the rules and guidelines for the Broker Dashboard implementation in TraderInsights. The current implementation has been tested and optimized, so these rules help ensure stability and consistency.

## Rules

### [broker_dashboard.implementation]
source_of_truth = "src/views/BrokerDashboard.tsx"
description = """
The Broker Dashboard implementation MUST NOT be changed without proper review.
The current implementation has been carefully designed to handle:
- SnapTrade authentication
- Broker connection flows
- Account display and management
- Error handling for connection issues

Changes to this implementation are restricted and require thorough review and testing.
"""

### [broker_dashboard.components]
location = "src/components/broker/*"
description = """
Broker-related components should remain consistent with the dashboard's expectations.
DO NOT modify the component interfaces without updating the dashboard implementation.
"""

### [broker_dashboard.data_flow]
source_of_truth = "src/stores/brokerDataStore.ts"
auth_store = "src/stores/authStore.ts"
description = """
Data flow for broker accounts follows a specific pattern:
1. Authentication via authStore (SnapTrade credentials)
2. Account fetching via brokerDataStore 
3. Account selection and data display in BrokerDashboard

DO NOT implement alternative data flows or bypass these stores.
"""

### [broker_dashboard.proxy]
source_of_truth = "src/server/api/snaptrade/proxy.ts"
description = """
The SnapTrade proxy implementation has been optimized for authentication handling.
DO NOT modify the authentication flow without thorough testing.
"""

## Testing Requirements
Any changes to the broker dashboard must be tested against:
1. Different broker connections
2. Error scenarios (network errors, authentication failures)
3. Account data retrieval
4. UI rendering in both light and dark modes

## Approved Modifications
The following modifications are permitted without extensive review:
- UI styling improvements that don't affect functionality
- Additional monitoring or logging
- Performance optimizations that don't change the authentication flow
- Adding new display components for additional account data 