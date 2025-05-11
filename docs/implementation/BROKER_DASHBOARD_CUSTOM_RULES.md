#[broker_dashboard.implementation]
source_of_truth = "src/views/BrokerDashboard.tsx"
description = """
The Broker Dashboard implementation MUST NOT be changed without proper review.
The current implementation has been carefully designed to handle:
- SnapTrade authentication
- Broker connection flows
- Account display and management
- Error handling for connection issues

DO NOT:
- Replace the existing flow with a completely new implementation
- Introduce alternative broker connection mechanisms
- Change the error handling strategy

Changes to this implementation are restricted and require thorough review and testing.
"""

#[broker_dashboard.components]
location = "src/components/broker/*"
description = """
Broker-related components should remain consistent with the dashboard's expectations.
DO NOT modify the component interfaces without updating the dashboard implementation.

Pay special attention to SnapTradeConnection which follows a specific workflow:
1. Check for credentials
2. Register with SnapTrade if needed
3. Fetch available brokers
4. Enable broker connection

This flow has been optimized for reliability and error handling.
"""

#[broker_dashboard.data_flow]
source_of_truth = "src/stores/brokerDataStore.ts"
auth_store = "src/stores/authStore.ts"
description = """
Data flow for broker accounts follows a specific pattern:
1. Authentication via authStore (SnapTrade credentials)
2. Account fetching via brokerDataStore 
3. Account selection and data display in BrokerDashboard

DO NOT implement alternative data flows or bypass these stores.
"""

#[broker_dashboard.proxy]
source_of_truth = "src/server/api/snaptrade/proxy.ts"
description = """
The SnapTrade proxy implementation has been optimized for authentication handling.
DO NOT modify the authentication flow without thorough testing.

Authentication uses a combination of approaches:
- x-api-key headers for general endpoints
- Body parameters for account-specific endpoints
- Consistent clientId inclusion

Modifications must preserve this authentication strategy.
"""

#[broker_dashboard.testing]
test_requirements = """
Any changes to the broker dashboard must be tested against:
1. Different broker connections
2. Error scenarios (network errors, authentication failures)
3. Account data retrieval
4. UI rendering in both light and dark modes
"""

#[broker_dashboard.allowed_changes]
permitted_modifications = """
The following modifications are permitted without extensive review:
- UI styling improvements that don't affect functionality
- Additional monitoring or logging
- Performance optimizations that don't change the authentication flow
- Adding new display components for additional account data
""" 